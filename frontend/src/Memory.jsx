import { useState } from 'react'

function Memory() {
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState(null)

  const similarIncidents = [
    {
      id: 'INC-014',
      service: 'payment-service',
      title: 'Database connection failure',
      similarity: '94%',
      date: 'Sep 18, 2026',
      rootCause: 'Incorrect database host configuration',
      resolution:
        'Updated the database host value and restarted the payment-service deployment.',
    },
    {
      id: 'INC-009',
      service: 'payment-service',
      title: 'Payment container restart loop',
      similarity: '87%',
      date: 'Sep 05, 2026',
      rootCause: 'Expired database credentials',
      resolution:
        'Updated the database credentials stored in the deployment secret.',
    },
    {
      id: 'INC-021',
      service: 'order-service',
      title: 'Database unavailable',
      similarity: '71%',
      date: 'Sep 25, 2026',
      rootCause: 'Database instance unavailable',
      resolution:
        'Restored database availability and verified application connectivity.',
    },
  ]

  return (
    <div className="memory-page">
      <div className="page-header">
        <div>
          <div className="brand">COPILOT MEMORY</div>

          <h1>Memory</h1>

          <p>
            Help Copilot learn from previous investigations and
            recognize recurring incidents.
          </p>
        </div>

        <button
          className={`memory-toggle ${memoryEnabled ? 'enabled' : ''}`}
          onClick={() => setMemoryEnabled(!memoryEnabled)}
        >
          <span className="memory-toggle-dot"></span>

          {memoryEnabled ? 'Memory Enabled' : 'Memory Disabled'}
        </button>
      </div>

      <div className="memory-overview">
        <div className="memory-stat">
          <span className="memory-stat-icon">🧠</span>

          <div>
            <strong>24</strong>
            <span>Stored investigations</span>
          </div>
        </div>

        <div className="memory-stat">
          <span className="memory-stat-icon">⌁</span>

          <div>
            <strong>17</strong>
            <span>Known patterns</span>
          </div>
        </div>

        <div className="memory-stat">
          <span className="memory-stat-icon">✦</span>

          <div>
            <strong>9</strong>
            <span>Repeated incidents detected</span>
          </div>
        </div>

        <div className="memory-stat">
          <span className="memory-stat-icon">✓</span>

          <div>
            <strong>31</strong>
            <span>Successful resolutions</span>
          </div>
        </div>
      </div>

      <section className="memory-highlight">
        <div className="memory-highlight-icon">✦</div>

        <div>
          <span className="memory-label">SMART FEATURE</span>

          <h2>Have we seen this before?</h2>

          <p>
            Copilot can compare a new incident with previous
            investigations and surface similar failures, known root
            causes, and previous resolutions.
          </p>
        </div>

        <button
          onClick={() => setSelectedIncident(similarIncidents[0])}
        >
          Find Similar Incidents →
        </button>
      </section>

      <div className="memory-layout">
        <section className="memory-main-card">
          <div className="memory-section-header">
            <div>
              <h2>Similar Incidents</h2>

              <p>
                Matches for the current payment-service incident.
              </p>
            </div>

            <span className="match-count">
              {similarIncidents.length} matches
            </span>
          </div>

          <div className="similar-list">
            {similarIncidents.map((incident) => (
              <button
                key={incident.id}
                className={`similar-item ${
                  selectedIncident?.id === incident.id
                    ? 'selected'
                    : ''
                }`}
                onClick={() => setSelectedIncident(incident)}
              >
                <div className="similar-score">
                  <strong>{incident.similarity}</strong>
                  <span>match</span>
                </div>

                <div className="similar-content">
                  <div className="similar-top">
                    <span>{incident.id}</span>
                    <span>{incident.date}</span>
                  </div>

                  <h3>{incident.title}</h3>

                  <p>{incident.service}</p>
                </div>

                <span className="similar-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="memory-detail-card">
          {selectedIncident ? (
            <>
              <div className="memory-detail-top">
                <span className="memory-label">
                  PREVIOUS INVESTIGATION
                </span>

                <span className="similarity-badge">
                  {selectedIncident.similarity} match
                </span>
              </div>

              <h2>{selectedIncident.id}</h2>

              <p className="memory-detail-service">
                {selectedIncident.service}
              </p>

              <div className="memory-detail-section">
                <span>ROOT CAUSE</span>

                <p>{selectedIncident.rootCause}</p>
              </div>

              <div className="memory-detail-section">
                <span>WHAT FIXED IT</span>

                <p>{selectedIncident.resolution}</p>
              </div>

              <button className="use-memory-button">
                Use This Investigation
              </button>
            </>
          ) : (
            <div className="memory-empty">
              <div>🧠</div>

              <h2>Select a match</h2>

              <p>
                Select a previous incident to see what happened and
                how it was resolved.
              </p>
            </div>
          )}
        </aside>
      </div>

      <section className="memory-management">
        <div>
          <h2>Memory Management</h2>

          <p>
            Copilot memory stores investigation information so
            recurring problems can be recognized.
          </p>
        </div>

        <div className="memory-management-actions">
          <button className="secondary-action">
            Review Stored Memories
          </button>

          <button className="danger-button">
            Clear Memory
          </button>
        </div>
      </section>
    </div>
  )
}

export default Memory