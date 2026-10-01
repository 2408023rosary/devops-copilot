import { useState } from 'react'

function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoAnalyze: true,
    showLogs: true,
    rememberChats: true,
  })

  const toggleSetting = (name) => {
    setSettings((previous) => ({
      ...previous,
      [name]: !previous[name],
    }))
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <div className="brand">APPLICATION</div>

          <h1>Settings</h1>

          <p>
            Configure how DevOps Copilot behaves and how you
            interact with your incident data.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-main">
          {/* General */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">⚙</div>

              <div>
                <h2>General</h2>
                <p>Basic Copilot application preferences.</p>
              </div>
            </div>

            <div className="settings-option">
              <div>
                <strong>Notifications</strong>
                <span>
                  Receive notifications when important incidents
                  are detected.
                </span>
              </div>

              <button
                className={`toggle ${
                  settings.notifications ? 'on' : ''
                }`}
                onClick={() => toggleSetting('notifications')}
              >
                <span></span>
              </button>
            </div>

            <div className="settings-option">
              <div>
                <strong>Automatically analyze incidents</strong>
                <span>
                  Allow Copilot to start an initial analysis when
                  a new incident appears.
                </span>
              </div>

              <button
                className={`toggle ${
                  settings.autoAnalyze ? 'on' : ''
                }`}
                onClick={() => toggleSetting('autoAnalyze')}
              >
                <span></span>
              </button>
            </div>
          </section>

          {/* Investigation */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">✦</div>

              <div>
                <h2>Investigation</h2>
                <p>Control the information shown during investigations.</p>
              </div>
            </div>

            <div className="settings-option">
              <div>
                <strong>Show recent logs</strong>
                <span>
                  Display relevant logs alongside incident details
                  and AI analysis.
                </span>
              </div>

              <button
                className={`toggle ${
                  settings.showLogs ? 'on' : ''
                }`}
                onClick={() => toggleSetting('showLogs')}
              >
                <span></span>
              </button>
            </div>

            <div className="settings-option">
              <div>
                <strong>Remember conversations</strong>
                <span>
                  Keep Copilot conversations available in your
                  chat history.
                </span>
              </div>

              <button
                className={`toggle ${
                  settings.rememberChats ? 'on' : ''
                }`}
                onClick={() => toggleSetting('rememberChats')}
              >
                <span></span>
              </button>
            </div>
          </section>

          {/* AI Configuration */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">🧠</div>

              <div>
                <h2>AI Configuration</h2>
                <p>Information about the Copilot AI engine.</p>
              </div>
            </div>

            <div className="configuration-row">
              <span>AI Engine</span>
              <strong>DevOps Copilot AI</strong>
            </div>

            <div className="configuration-row">
              <span>Analysis Mode</span>
              <strong>Incident Investigation</strong>
            </div>

            <div className="configuration-row">
              <span>Response Format</span>
              <strong>Structured Diagnosis</strong>
            </div>

            <div className="configuration-row">
              <span>Status</span>

              <strong className="configuration-status">
                <span></span>
                Ready
              </strong>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="settings-card danger-zone">
            <div className="settings-card-header">
              <div className="settings-card-icon danger-icon">!</div>

              <div>
                <h2>Data Management</h2>
                <p>
                  Manage locally stored conversations and incident
                  history.
                </p>
              </div>
            </div>

            <div className="danger-action">
              <div>
                <strong>Clear chat history</strong>
                <span>
                  Remove saved Copilot conversations from this
                  application.
                </span>
              </div>

              <button className="danger-button">
                Clear History
              </button>
            </div>
          </section>
        </div>

        <aside className="settings-sidebar">
          <div className="settings-status-card">
            <div className="settings-status-icon">✦</div>

            <h3>DevOps Copilot</h3>

            <p>
              Your AI-powered assistant for understanding and
              resolving infrastructure incidents.
            </p>

            <div className="settings-version">
              <span>Version</span>
              <strong>0.1.0</strong>
            </div>
          </div>

          <div className="settings-help-card">
            <span>?</span>

            <div>
              <strong>Need help?</strong>
              <p>
                Settings can be changed at any time. Your
                investigation workflow will continue to use the
                latest configuration.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Settings