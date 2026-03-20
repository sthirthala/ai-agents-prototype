/**
 * A2A (Agent-to-Agent) JSON-RPC Client
 *
 * Communicates with A2A-compliant agent servers using the JSON-RPC 2.0 protocol.
 * Supports: agent card discovery, message/send, message/stream.
 *
 * Protocol reference: https://google.github.io/A2A/
 */

let nextId = 1;
function rpcId() {
  return `req-${nextId++}-${Date.now()}`;
}

function taskId() {
  return `task-${crypto.randomUUID()}`;
}

function messageId() {
  return `msg-${crypto.randomUUID()}`;
}

/**
 * Fetch the agent's public AgentCard.
 * @param {string} baseUrl - Agent server base URL (e.g. "http://localhost:10002")
 * @returns {Promise<object>} AgentCard JSON
 */
export async function fetchAgentCard(baseUrl) {
  const url = `${baseUrl}/.well-known/agent.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch agent card: ${res.status}`);
  return res.json();
}

/**
 * Send a message to an A2A agent (non-streaming).
 * @param {string} baseUrl - Agent server base URL
 * @param {string} text - User message text
 * @param {string} [sessionId] - Optional session ID for multi-turn
 * @param {string} [existingTaskId] - Reuse task ID for multi-turn
 * @returns {Promise<object>} JSON-RPC result containing task status/artifacts
 */
export async function sendMessage(baseUrl, text, sessionId, existingTaskId) {
  const body = {
    jsonrpc: '2.0',
    id: rpcId(),
    method: 'message/send',
    params: {
      id: existingTaskId || taskId(),
      message: {
        role: 'user',
        parts: [{ kind: 'text', text }],
        messageId: messageId(),
      },
      ...(sessionId && { sessionId }),
    },
  };

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`A2A request failed (${res.status}): ${errText}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`A2A error ${json.error.code}: ${json.error.message}`);
  }
  return json.result;
}

/**
 * Send a streaming message to an A2A agent.
 * Yields parsed JSON-RPC result objects as they arrive.
 * @param {string} baseUrl - Agent server base URL
 * @param {string} text - User message text
 * @param {string} [sessionId] - Optional session ID
 * @param {string} [existingTaskId] - Reuse task ID for multi-turn
 * @param {AbortSignal} [signal] - Optional abort signal
 * @yields {object} Streamed JSON-RPC result objects (status updates, artifacts)
 */
export async function* streamMessage(baseUrl, text, sessionId, existingTaskId, signal) {
  const body = {
    jsonrpc: '2.0',
    id: rpcId(),
    method: 'message/stream',
    params: {
      id: existingTaskId || taskId(),
      message: {
        role: 'user',
        parts: [{ kind: 'text', text }],
        messageId: messageId(),
      },
      ...(sessionId && { sessionId }),
    },
  };

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`A2A stream failed (${res.status}): ${errText}`);
  }

  const contentType = res.headers.get('content-type') || '';

  // Handle SSE-style streams
  if (contentType.includes('text/event-stream')) {
    yield* readSSEStream(res.body);
    return;
  }

  // Handle NDJSON or chunked JSON streams
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const json = JSON.parse(trimmed);
          if (json.error) {
            throw new Error(`A2A stream error ${json.error.code}: ${json.error.message}`);
          }
          yield json.result || json;
        } catch (e) {
          if (e instanceof SyntaxError) continue; // skip non-JSON lines
          throw e;
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      try {
        const json = JSON.parse(buffer.trim());
        yield json.result || json;
      } catch { /* ignore trailing non-JSON */ }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Parse an SSE (Server-Sent Events) stream body.
 */
async function* readSSEStream(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        const dataLine = event
          .split('\n')
          .find((l) => l.startsWith('data:'));
        if (!dataLine) continue;
        const data = dataLine.slice(5).trim();
        if (!data) continue;
        try {
          const json = JSON.parse(data);
          yield json.result || json;
        } catch { /* skip non-JSON data lines */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Extract text content from A2A result parts.
 * Handles task status updates, artifacts, and direct message results.
 * @param {object} result - A2A JSON-RPC result
 * @returns {string} Extracted text content
 */
export function extractText(result) {
  const parts = [];

  // Extract from status message
  if (result.status?.message?.parts) {
    for (const part of result.status.message.parts) {
      if (part.kind === 'text') parts.push(part.text);
      else if (part.kind === 'data') parts.push('```json\n' + JSON.stringify(part.data, null, 2) + '\n```');
    }
  }

  // Extract from artifacts
  if (result.artifact?.parts) {
    for (const part of result.artifact.parts) {
      if (part.kind === 'text') parts.push(part.text);
      else if (part.kind === 'file') parts.push(`📎 File: ${part.file?.name || 'attachment'}`);
      else if (part.kind === 'data') parts.push('```json\n' + JSON.stringify(part.data, null, 2) + '\n```');
    }
  }

  // Extract from result.artifacts array (non-streaming)
  if (result.artifacts) {
    for (const artifact of result.artifacts) {
      for (const part of artifact.parts || []) {
        if (part.kind === 'text') parts.push(part.text);
        else if (part.kind === 'file') parts.push(`📎 File: ${part.file?.name || 'attachment'}`);
        else if (part.kind === 'data') parts.push('```json\n' + JSON.stringify(part.data, null, 2) + '\n```');
      }
    }
  }

  return parts.join('\n\n') || '';
}
