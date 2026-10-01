import { useNavigate } from 'react-router-dom'

function NexusLogo() {
  return (
    <div className="welcome-logo">
      <span className="welcome-logo-node welcome-logo-node-top"></span>
      <span className="welcome-logo-node welcome-logo-node-left"></span>
      <span className="welcome-logo-node welcome-logo-node-right"></span>

      <span className="welcome-logo-line welcome-logo-line-left"></span>
      <span className="welcome-logo-line welcome-logo-line-right"></span>

      <span className="welcome-logo-core"></span>
    </div>
  )
}

function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="welcome-page">
      {/* Background decoration */}

      <div className="welcome-grid"></div>
      <div className="welcome-glow"></div>

      <main className="welcome-content">
        {/* BRAND */}

        <div className="welcome-brand">
          <NexusLogo />

          <div className="welcome-brand-text">
            <strong>NEXUS</strong>
            <span>INFRASTRUCTURE INTELLIGENCE</span>
          </div>
        </div>

        {/* HERO */}

        <section className="welcome-hero">
          <div className="welcome-eyebrow">AI-ASSISTED OPERATIONS</div>

          <h1>
            Your infrastructure.
            <span> Understood.</span>
          </h1>

          <p className="welcome-description">
            Nexus helps you understand incidents, trace failures, uncover root causes, and move from
            alert to resolution with intelligent assistance.
          </p>

          {/* PRIMARY ACTION */}

          <button className="welcome-button" onClick={() => navigate('/dashboard')}>
            <span>Enter Nexus</span>
            <span className="welcome-button-arrow">→</span>
          </button>

          <p className="welcome-hint">Monitor · Investigate · Resolve</p>
        </section>

        {/* CAPABILITIES */}

        <section className="welcome-capabilities">
          <div className="welcome-capability">
            <div className="capability-number">01</div>

            <div>
              <h3>Monitor</h3>
              <p>See the health of your services and infrastructure at a glance.</p>
            </div>
          </div>

          <div className="welcome-capability">
            <div className="capability-number">02</div>

            <div>
              <h3>Investigate</h3>
              <p>Connect incidents, logs, and events to understand what went wrong.</p>
            </div>
          </div>

          <div className="welcome-capability">
            <div className="capability-number">03</div>

            <div>
              <h3>Resolve</h3>
              <p>Get practical recommendations and remediation guidance from Nexus AI.</p>
            </div>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="welcome-footer">
          <span>AI-ASSISTED DEVOPS</span>

          <span className="welcome-footer-line"></span>

          <span>BUILT FOR INCIDENT RESPONSE</span>
        </footer>
      </main>
    </div>
  )
}

export default Welcome
