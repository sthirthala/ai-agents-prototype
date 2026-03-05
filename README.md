# API Center Portal — Azure API Center Dashboard

A React + Vite portal that connects to **Azure API Center** to discover and explore **APIs**, **AI Agents**, **Foundation Models**, and **Tools** — all categorized by `assetType` custom property.

## Features

- **APIs** — Browse REST, GraphQL, and other APIs registered in Azure API Center
- **Agents** — Explore AI agents with their capabilities, connected models, and tools
- **Models** — Discover foundation models (GPT-4o, Claude, Codex, Gemini, LLaMA, etc.)
- **Tools** — View tools like Web Search, Code Executor, Git Operations, and more
- **Relationships** — See how agents connect to models and tools in one unified view
- **Authentication** — Secured with Microsoft Entra ID (Azure AD) via MSAL
- Click any card for a detail panel showing specs and connections

## Prerequisites

1. An **Azure API Center** instance with APIs registered and `assetType` custom property set to `api`, `agent`, `model`, or `tool`
2. An **Azure AD / Entra ID app registration** configured as a Single-Page Application with redirect URI pointing to your app URL

## Setup

1. Copy `.env.example` to `.env` and fill in your Azure values:

```bash
cp .env.example .env
```

2. Configure the `.env` file:

```env
VITE_AZURE_CLIENT_ID=your-client-id-here
VITE_AZURE_TENANT_ID=your-tenant-id-here
VITE_AZURE_SUBSCRIPTION_ID=your-subscription-id-here
VITE_AZURE_RESOURCE_GROUP=your-resource-group-here
VITE_AZURE_APIC_SERVICE_NAME=your-api-center-service-name
VITE_AZURE_APIC_WORKSPACE=default
```

3. Install dependencies and start:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in with your Microsoft account.

## Tech Stack

- React 19 + Vite
- MSAL React (`@azure/msal-react`) for authentication
- Azure API Center REST API
- Pure CSS (no UI library)
- Dark-themed, responsive design

## Azure API Center — Asset Type Convention

This app reads the `customProperties.assetType` field from each API registered in Azure API Center and categorizes it into tabs:

| Asset Type Value | Tab     | Description                        |
|------------------|---------|------------------------------------|
| `REST`           | APIs    | RESTful API endpoints              |
| `GraphQL`        | APIs    | GraphQL API endpoints              |
| `gRPC`           | APIs    | gRPC services                      |
| `SOAP`           | APIs    | SOAP web services                  |
| `Webhook`        | APIs    | Webhook endpoints                  |
| `Websocket`      | APIs    | WebSocket connections              |
| `mcp`            | Tools   | Model Context Protocol tools       |
| `a2a`            | Agents  | Agent-to-Agent protocol agents     |


