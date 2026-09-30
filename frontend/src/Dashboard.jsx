import { useState } from 'react'

function Dashboard() {
  const [analyzing, setAnalyzing] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const services = [
    {
      name: 'payment-service',
      status: 'Critical',
      statusClass: 'critical',
      uptime: '98.2%',
      description: 'Payment processing',
      icon: '₿',
    },
    {
      name: 'user-service',
      status: 'Healthy',
      statusClass: 'healthy',
      uptime: '99.9%',
      description: 'Authentication & accounts',
      icon: '◎',
    },
    {
      name: 'order-service',
      status: 'Healthy',
      statusClass: 'healthy',
      uptime: '99.7%',
      description: 'Order management',
      icon: '□',
    },
  ]

  const logs = [
    'Database connection refused',
    'Application exited with code 1',
    'Back-off restarting failed container',
  ]

  const analyzeIncident = () => {
    setAnalyzing(true)

    setTimeout(() => {
      setAnalyzing(false)
    }, 1500)
  }

  const askCopilot = () => {
    if (!question.trim()) return

    setAnswer(
      'Based on the available incident information, payment-service cannot establish a connection to its database. This causes the application to exit and Kubernetes to restart the container.'
    )
  }

  return (
    <div className="dashboard-page">

      {/* ───────────────── HEADER ───────────────── */}

     <header className="dashboard-header">

  <div className="dashboard-branding">

    <div className="nexus-brand">

      <div className="nexus-logo">
        <span className="logo-node logo-node-top"></span>
        <span className="logo-node logo-node-left"></span>
        <span className="logo-node logo-node-right"></span>

        <span className="logo-line logo-line-left"></span>
        <span className="logo-line logo-line-right"></span>
        <span className="logo-core"></span>
      </div>

      <div className="nexus-wordmark">
        <strong>NEXUS</strong>
        <span>INFRASTRUCTURE INTELLIGENCE</span>
      </div>

    </div>

    <div className="dashboard-heading">

      <h1>System Overview</h1>

      <p>
        Understand your infrastructure at a glance.
        Monitor services, investigate incidents, and resolve issues faster.
      </p>

    </div>

  </div>


  <div className="dashboard-status">

    <span className="status-dot"></span>

    <div>
      <strong>1 incident needs attention</strong>
      <span>System monitoring is active</span>
    </div>

  </div>

</header>

      {/* ───────────────── ACTIVE INCIDENT ───────────────── */}

      <section className="priority-incident">

        <div className="priority-incident-content">

          <div className="priority-icon">
            !
          </div>

          <div className="priority-info">

            <div className="priority-label">
              ACTIVE INCIDENT
              <span className="priority-badge">
                CRITICAL
              </span>
            </div>

            <h2>payment-service is failing</h2>

            <p>
              The service is repeatedly restarting because it
              cannot establish a database connection.
            </p>

            <div className="priority-meta">
              <span>
                <b>STATUS</b> CrashLoopBackOff
              </span>

              <span>
                <b>SERVICE</b> payment-service
              </span>

              <span>
                <b>IMPACT</b> Payment processing
              </span>
            </div>

          </div>

        </div>

        <button
          className="primary-action"
          onClick={analyzeIncident}
          disabled={analyzing}
        >
          <span>✦</span>
          {analyzing ? 'Analyzing...' : 'Analyze with Nexus'}
          <span className="button-arrow">→</span>
        </button>

      </section>


      {/* ───────────────── OVERVIEW ───────────────── */}

      <section className="overview-grid">

        <div className="overview-card">

          <div className="overview-card-top">
            <span className="overview-icon">◫</span>
            <span className="overview-label">SERVICES</span>
          </div>

          <strong>3</strong>

          <span className="overview-subtext">
            Monitored services
          </span>

        </div>


        <div className="overview-card">

          <div className="overview-card-top">
            <span className="overview-icon healthy-icon">✓</span>
            <span className="overview-label">HEALTHY</span>
          </div>

          <strong>2</strong>

          <span className="overview-subtext">
            Operating normally
          </span>

        </div>


        <div className="overview-card incident-overview">

          <div className="overview-card-top">
            <span className="overview-icon critical-icon">!</span>
            <span className="overview-label">INCIDENTS</span>
          </div>

          <strong>1</strong>

          <span className="overview-subtext">
            Requires investigation
          </span>

        </div>


        <div className="overview-card ai-overview">

          <div className="overview-card-top">
            <span className="overview-icon ai-icon-small">✦</span>
            <span className="overview-label">NEXUS AI</span>
          </div>

          <strong>Ready</strong>

          <span className="overview-subtext">
            Available for assistance
          </span>

        </div>

      </section>


      {/* ───────────────── SERVICES ───────────────── */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <span className="section-kicker">
              INFRASTRUCTURE
            </span>

            <h2>Service Health</h2>

            <p>
              Current health and availability of your application services.
            </p>
          </div>

          <button className="section-link">
            View all services →
          </button>

        </div>


        <div className="service-grid">

          {services.map((service) => (

            <div
              className={`service-card ${service.statusClass}`}
              key={service.name}
            >

              <div className="service-card-header">

                <div className="service-icon">
                  {service.icon}
                </div>

                <span
                  className={`status-badge ${service.statusClass}`}
                >
                  <span className="badge-dot"></span>
                  {service.status}
                </span>

              </div>


              <div className="service-card-info">

                <h3>{service.name}</h3>

                <p>{service.description}</p>

              </div>


              <div className="service-card-footer">

                <div>
                  <span>UPTIME</span>
                  <strong>{service.uptime}</strong>
                </div>

                <span className="service-arrow">→</span>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* ───────────────── INVESTIGATION ───────────────── */}

      <section className="investigation-section">

        <div className="section-heading">

          <div>
            <span className="section-kicker">
              INVESTIGATION
            </span>

            <h2>Incident Analysis</h2>

            <p>
              Review the evidence and Nexus AI's diagnosis.
            </p>
          </div>

        </div>


        <div className="investigation-grid">

          {/* LOGS */}

          <div className="logs-card">

            <div className="card-heading">

              <div>
                <h3>Recent Logs</h3>
                <p>payment-service</p>
              </div>

              <span className="live-indicator">
                <span></span>
                LIVE
              </span>

            </div>


            <div className="logs-container">

              {logs.map((log, index) => (

                <div className="log-line" key={index}>

                  <span className="log-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="log-time">
                    14:{32 + index}:0{index}
                  </span>

                  <span className="log-message">
                    {log}
                  </span>

                </div>

              ))}

            </div>

            <button className="text-button">
              View full logs →
            </button>

          </div>


          {/* AI DIAGNOSIS */}

          <div className="diagnosis-card">

            <div className="diagnosis-header">

              <div className="nexus-ai-mark">
                ✦
              </div>

              <div>
                <span className="section-kicker">
                  NEXUS AI
                </span>

                <h3>Incident Diagnosis</h3>

              </div>

              <span className="confidence-badge">
                92% confidence
              </span>

            </div>


            <div className="diagnosis-content">

              <div className="diagnosis-block">

                <span className="diagnosis-label">
                  LIKELY ROOT CAUSE
                </span>

                <p>
                  <strong>
                    Database connection failure
                  </strong>
                </p>

                <p className="diagnosis-description">
                  payment-service is unable to establish a
                  connection to its database. The application
                  exits as a result, causing Kubernetes to
                  repeatedly restart the container.
                </p>

              </div>


              <div className="diagnosis-block">

                <span className="diagnosis-label">
                  RECOMMENDED ACTIONS
                </span>

                <ul className="recommendation-list">

                  <li>
                    <span>01</span>
                    Verify database availability.
                  </li>

                  <li>
                    <span>02</span>
                    Check database credentials.
                  </li>

                  <li>
                    <span>03</span>
                    Verify database host and port.
                  </li>

                  <li>
                    <span>04</span>
                    Review recent configuration changes.
                  </li>

                </ul>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ───────────────── ASK NEXUS ───────────────── */}

      <section className="ask-nexus-card">

        <div className="ask-nexus-heading">

          <div className="ask-nexus-icon">
            ✦
          </div>

          <div>
            <span className="section-kicker">
              NEXUS AI ASSISTANT
            </span>

            <h2>What would you like to investigate?</h2>

            <p>
              Ask about services, logs, incidents, root causes,
              or possible remediation steps.
            </p>
          </div>

        </div>


        <div className="question-box">

          <input
            type="text"
            placeholder="Why is payment-service failing?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                askCopilot()
              }
            }}
          />

          <button onClick={askCopilot}>
            Ask Nexus
            <span>→</span>
          </button>

        </div>


        {answer && (

          <div className="copilot-answer">

            <div className="answer-icon">
              ✦
            </div>

            <div>
              <span>NEXUS ANALYSIS</span>
              <p>{answer}</p>
            </div>

          </div>

        )}

      </section>

    </div>
  )
}

export default Dashboard