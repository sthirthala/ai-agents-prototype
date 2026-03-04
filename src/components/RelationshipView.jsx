import { agents, models, tools, getById } from '../data';

export default function RelationshipView({ onSelectItem }) {
  return (
    <section className="relationship-view">
      <h2 className="rel-heading">Agent → Model → Tool Relationships</h2>
      <p className="rel-description">
        Each agent is powered by specific models and equipped with specialized tools.
        Click any item to see its details.
      </p>

      <div className="rel-grid">
        {agents.map((agent) => {
          const agentModels = agent.models.map((id) => getById(models, id)).filter(Boolean);
          const agentTools = agent.tools.map((id) => getById(tools, id)).filter(Boolean);

          return (
            <div key={agent.id} className="rel-card">
              <div
                className="rel-agent"
                style={{ '--agent-color': agent.color }}
                onClick={() => onSelectItem(agent)}
              >
                <span className="rel-icon">{agent.icon}</span>
                <span className="rel-name">{agent.name}</span>
              </div>

              <div className="rel-connections">
                <div className="rel-column">
                  <span className="rel-col-label">🧠 Models</span>
                  {agentModels.map((m) => (
                    <div
                      key={m.id}
                      className="rel-chip"
                      style={{ '--chip-color': m.color }}
                      onClick={() => onSelectItem(m)}
                    >
                      {m.icon} {m.name}
                    </div>
                  ))}
                </div>

                <div className="rel-column">
                  <span className="rel-col-label">🛠️ Tools</span>
                  {agentTools.map((t) => (
                    <div
                      key={t.id}
                      className="rel-chip"
                      style={{ '--chip-color': t.color }}
                      onClick={() => onSelectItem(t)}
                    >
                      {t.icon} {t.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
