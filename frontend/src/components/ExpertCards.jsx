import { useState } from 'react';

const ROLE_COLORS = {
  labor_rep: { bg: '#fff7ed', border: '#fed7aa', accent: '#ea580c', avatar: '#fb923c' },
  consumer_advocate: { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', avatar: '#60a5fa' },
  diplomat: { bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a', avatar: '#4ade80' },
  climate_scientist: { bg: '#fdf4ff', border: '#e9d5ff', accent: '#9333ea', avatar: '#c084fc' },
};

const DEFAULT_COLOR = { bg: '#f8fafc', border: '#e2e8f0', accent: '#7c3aed', avatar: '#a78bfa' };

function ExpertCards({ data }) {
  const [revealed, setRevealed] = useState({});

  const { project_metadata, expert_cards } = data;

  const toggleReveal = (roleId) =>
    setRevealed((prev) => ({ ...prev, [roleId]: !prev[roleId] }));

  return (
    <div className="expert-cards-wrapper">
      {/* Project Metadata Banner */}
      <div className="project-meta-banner">
        <div className="meta-tag technique">{project_metadata.technique}</div>
        <div className="meta-tag conflict">{project_metadata.conflict_type}</div>
        <div className="meta-tag curriculum">{project_metadata.curriculum_alignment}</div>
      </div>

      {/* Expert Cards Grid */}
      <div className="expert-cards-grid">
        {expert_cards.map((card) => {
          const colors = ROLE_COLORS[card.role_id] || DEFAULT_COLOR;
          const isRevealed = revealed[card.role_id];

          return (
            <div
              key={card.role_id}
              className="expert-card"
              style={{ background: colors.bg, borderColor: colors.border }}
            >
              {/* Header */}
              <div className="expert-card-header">
                <div
                  className="expert-avatar"
                  style={{ background: colors.avatar }}
                >
                  {card.name[0]}
                </div>
                <div className="expert-identity">
                  <div className="expert-name">{card.name}</div>
                  <div className="expert-title" style={{ color: colors.accent }}>
                    {card.title}
                  </div>
                </div>
              </div>

              {/* Persona */}
              <p className="expert-persona">{card.persona}</p>

              {/* Key Data */}
              <div className="key-data-section">
                <div className="section-label" style={{ color: colors.accent }}>
                  Key Data
                </div>
                {card.key_data.map((d) => (
                  <div key={d.metric} className="key-data-row">
                    <span className="key-metric">{d.metric}</span>
                    <span className="key-value">{d.value}</span>
                  </div>
                ))}
              </div>

              {/* Primary Goal */}
              <div className="primary-goal" style={{ borderColor: colors.border }}>
                <span className="section-label" style={{ color: colors.accent }}>
                  Primary Goal
                </span>
                <p>{card.primary_goal}</p>
              </div>

              {/* Hidden Insight Toggle */}
              <button
                className={`reveal-btn ${isRevealed ? 'revealed' : ''}`}
                style={isRevealed ? { background: colors.accent } : { borderColor: colors.accent, color: colors.accent }}
                onClick={() => toggleReveal(card.role_id)}
              >
                {isRevealed ? 'Hide Secret Insight' : 'Reveal Hidden Insight'}
              </button>

              {isRevealed && (
                <div className="hidden-insight" style={{ borderColor: colors.accent, background: colors.bg }}>
                  <span className="insight-label" style={{ color: colors.accent }}>
                    Secret
                  </span>
                  <p>{card.hidden_insight}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExpertCards;
