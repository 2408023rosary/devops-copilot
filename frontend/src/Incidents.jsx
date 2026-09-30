import { useState } from 'react'

function Incidents() {
  const [selectedIncident, setSelectedIncident] = useState(null)

  const incidents = [
    {
      id: 'INC-001',
      service: 'payment-service',
      title: 'Payment service is failing',
      status: 'Critical',
      statusClass: 'critical',
      state: 'Investigating',
      time: '12 min ago',
      error: 'CrashLoopBackOff',
      description:
        'The payment-service container is repeatedly restarting after failing to establish a connection to the database.',
      logs: [
        'Database connection refused',
        'Application exited with code 1',
        'Back-off restarting failed container',
      ],
    },
    {
      id: 'INC-002',
      service: 'order-service',
      title: 'Elevated response latency',
      status: 'Warning',
      statusClass: 'warning',
      state: 'Monitoring',
      time: '2 hours ago',
      error: 'HighLatency',
      description:
        'The order-service has experienced increased response times during recent requests.',
      logs: [
        'Request latency exceeded threshold',
        'Response time: 2.8s',
        'Traffic spike detected',
      ],
    },
    {
      id: 'INC-003',
      service: 'user-service',
      title: 'Authentication recovered',
      status: 'Resolved',
      statusClass: 'resolved',
      state: 'Resolved',
      time: 'Yesterday',
      error: 'AuthTimeout',
      description:
        'A temporary authentication timeout affected a small number of requests and has been resolved.',
      logs: [
        'Authentication timeout detected',
        'Service restarted',
        'Authentication requests normal',
      ],
    },
  ]

  return (
    <div className="incidents-page">

      {/* ───────────────── HEADER ───────────────── */}

      <header className="incidents-header">

        <div className="incidents-title">

          <div className="nexus-page-eyebrow">
            <span>◈</span>
            NEXUS
            <i></i>
            INCIDENT RESPONSE
          </div>

          <h1>Incident Explorer</h1>

          <p>
            Investigate service failures, inspect evidence,
            and understand what happened.
          </p>

        </div>


        <div className="incident-summary">

          <div className="summary-item">
            <strong>3</strong>
            <span>Total</span>
          </div>

          <div className="summary-item critical-summary">
            <strong>1</strong>
            <span>Critical</span>
          </div>

          <div className="summary-item warning-summary">
            <strong>1</strong>
            <span>Warning</span>
          </div>

          <div className="summary-item resolved-summary">
            <strong>1</strong>
            <span>Resolved</span>
          </div>

        </div>

      </header>


      {/* ───────────────── TOOLBAR ───────────────── */}

      <div className="incident-toolbar">

        <div className="incident-search">

          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search incidents, services, or errors..."
          />

          <span className="search-shortcut">
            /
          </span>

        </div>


        <div className="incident-filter">

          <span>STATUS</span>

          <select defaultValue="all">
            <option value="all">All incidents</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="resolved">Resolved</option>
          </select>

        </div>

      </div>


      {/* ───────────────── INCIDENT WORKSPACE ───────────────── */}

      <div className="incidents-layout">


        {/* INCIDENT LIST */}

        <aside className="incident-list-panel">

          <div className="incident-list-header">

            <div>
              <span className="section-kicker">
                INCIDENTS
              </span>

              <h2>Recent activity</h2>
            </div>

            <span className="incident-count">
              {incidents.length}
            </span>

          </div>


          <div className="incident-list">

            {incidents.map((incident) => (

              <button
                key={incident.id}
                className={`incident-list-item ${
                  selectedIncident?.id === incident.id
                    ? 'selected'
                    : ''
                }`}
                onClick={() => setSelectedIncident(incident)}
              >

                <div className="incident-list-top">

                  <span className="incident-id">
                    {incident.id}
                  </span>

                  <span
                    className={`incident-status ${incident.statusClass}`}
                  >
                    <span className="incident-status-dot"></span>
                    {incident.status}
                  </span>

                </div>


                <h3>{incident.title}</h3>


                <div className="incident-meta">

                  <span>{incident.service}</span>

                  <span className="meta-dot">·</span>

                  <span>{incident.time}</span>

                </div>


                <div className="incident-error">
                  {incident.error}
                </div>

              </button>

            ))}

          </div>

        </aside>


        {/* INCIDENT DETAILS */}

        <main className="incident-details">

          {selectedIncident ? (

            <>

              {/* DETAILS HEADER */}

              <div className="details-header">

                <div className="details-title">

                  <div className="details-id-row">

                    <span className="incident-id">
                      {selectedIncident.id}
                    </span>

                    <span className="details-service">
                      {selectedIncident.service}
                    </span>

                  </div>


                  <h2>
                    {selectedIncident.title}
                  </h2>


                  <div className="incident-meta">

                    <span>
                      Detected {selectedIncident.time}
                    </span>

                    <span className="meta-dot">·</span>

                    <span>
                      {selectedIncident.error}
                    </span>

                  </div>

                </div>


                <span
                  className={`incident-status large ${selectedIncident.statusClass}`}
                >
                  <span className="incident-status-dot"></span>
                  {selectedIncident.status}
                </span>

              </div>


              {/* STATE */}

              <div className="details-grid">

                <div className="details-section state-section">

                  <div className="details-label">
                    CURRENT STATE
                  </div>

                  <div className="incident-state">

                    <span
                      className={`state-dot ${selectedIncident.statusClass}`}
                    ></span>

                    <strong>
                      {selectedIncident.state}
                    </strong>

                  </div>

                </div>


                <div className="details-section">

                  <div className="details-label">
                    AFFECTED SERVICE
                  </div>

                  <div className="service-reference">
                    <span className="service-reference-icon">
                      ◇
                    </span>

                    <strong>
                      {selectedIncident.service}
                    </strong>
                  </div>

                </div>

              </div>


              {/* DESCRIPTION */}

              <div className="details-section description-section">

                <div className="details-label">
                  INCIDENT SUMMARY
                </div>

                <p className="details-description">
                  {selectedIncident.description}
                </p>

              </div>


              {/* LOGS */}

              <div className="details-section logs-section">

                <div className="details-section-heading">

                  <div>
                    <div className="details-label">
                      EVIDENCE
                    </div>

                    <h3>Recent logs</h3>
                  </div>

                  <span className="live-log-status">
                    <span></span>
                    LIVE
                  </span>

                </div>


                <div className="incident-logs">

                  {selectedIncident.logs.map((log, index) => (

                    <div
                      className="incident-log"
                      key={index}
                    >

                      <span className="incident-log-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="incident-log-time">
                        14:{32 + index}:0{index}
                      </span>

                      <code>
                        {log}
                      </code>

                    </div>

                  ))}

                </div>

              </div>


              {/* ACTIONS */}

              <div className="details-actions">

                <button className="primary-action">

                  <span>✦</span>

                  Analyze with Nexus

                  <span className="action-arrow">
                    →
                  </span>

                </button>


                <button className="secondary-action">
                  View timeline
                  <span>→</span>
                </button>

              </div>

            </>

          ) : (

            /* EMPTY STATE */

            <div className="empty-incident-state">

              <div className="empty-incident-icon">

                <span></span>
                <span></span>
                <span></span>

              </div>

              <span className="empty-kicker">
                INCIDENT WORKSPACE
              </span>

              <h2>Select an incident</h2>

              <p>
                Choose an incident from the activity list to
                inspect its state, evidence, and investigation
                details.
              </p>

              <div className="empty-hint">
                Select an incident to begin
              </div>

            </div>

          )}

        </main>

      </div>

    </div>
  )
}

export default Incidents