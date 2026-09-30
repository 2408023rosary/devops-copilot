import { useNavigate } from 'react-router-dom'

function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <div className="welcome-badge">
          ✦ AI-POWERED DEVOPS ASSISTANT
        </div>

        <h1>
          Welcome to
          <span> DevOps Copilot</span>
        </h1>

        <p className="welcome-description">
          Your intelligent assistant for understanding incidents,
          analyzing logs, discovering root causes, and finding
          practical remediation steps.
        </p>

        <div className="welcome-features">
          <div className="welcome-feature">
            <span>◉</span>
            <div>
              <strong>Monitor</strong>
              <p>Track your services and system health.</p>
            </div>
          </div>

          <div className="welcome-feature">
            <span>⌁</span>
            <div>
              <strong>Investigate</strong>
              <p>Understand incidents using logs and events.</p>
            </div>
          </div>

          <div className="welcome-feature">
            <span>✦</span>
            <div>
              <strong>Ask Copilot</strong>
              <p>Get AI-powered explanations and recommendations.</p>
            </div>
          </div>

          <div className="welcome-feature">
            <span>🧠</span>
            <div>
              <strong>Learn from History</strong>
              <p>Find patterns from previous incidents.</p>
            </div>
          </div>
        </div>

        <button
          className="welcome-button"
          onClick={() => navigate('/dashboard')}
        >
          Explore DevOps Copilot
          <span>→</span>
        </button>

        <p className="welcome-hint">
          No complex setup. Select a service and start investigating.
        </p>
      </div>
    </div>
  )
}

export default Welcome