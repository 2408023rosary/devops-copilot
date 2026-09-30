import { useState } from 'react'

function History() {
  const [activeTab, setActiveTab] = useState('chats')

  const chats = [
    {
      id: 1,
      title: 'Why is payment-service failing?',
      service: 'payment-service',
      time: 'Today, 9:42 PM',
      messages: 8,
      status: 'Investigated',
    },
    {
      id: 2,
      title: 'Database connection errors',
      service: 'payment-service',
      time: 'Today, 7:18 PM',
      messages: 5,
      status: 'Investigated',
    },
    {
      id: 3,
      title: 'High latency on order service',
      service: 'order-service',
      time: 'Yesterday, 4:31 PM',
      messages: 11,
      status: 'Resolved',
    },
  ]

  const incidents = [
    {
      id: 'INC-001',
      service: 'payment-service',
      title: 'Payment service is failing',
      date: 'Today',
      severity: 'Critical',
      rootCause: 'Database connection failure',
    },
    {
      id: 'INC-002',
      service: 'order-service',
      title: 'Elevated response latency',
      date: 'Yesterday',
      severity: 'Warning',
      rootCause: 'Traffic spike',
    },
    {
      id: 'INC-003',
      service: 'user-service',
      title: 'Authentication recovered',
      date: 'Sep 29',
      severity: 'Resolved',
      rootCause: 'Authentication timeout',
    },
  ]

  return (
    <div className="history-page">
      <div className="page-header">
        <div>
          <div className="brand">INVESTIGATION RECORD</div>

          <h1>History</h1>

          <p>
            Review previous Copilot conversations and incident
            investigations.
          </p>
        </div>
      </div>

      <div className="history-tabs">
        <button
          className={activeTab === 'chats' ? 'active' : ''}
          onClick={() => setActiveTab('chats')}
        >
          <span>◷</span>
          Chat History
          <strong>{chats.length}</strong>
        </button>

        <button
          className={activeTab === 'incidents' ? 'active' : ''}
          onClick={() => setActiveTab('incidents')}
        >
          <span>⚠</span>
          Incident History
          <strong>{incidents.length}</strong>
        </button>
      </div>

      {activeTab === 'chats' && (
        <section className="history-content">
          <div className="history-section-header">
            <div>
              <h2>Previous Conversations</h2>
              <p>
                Continue an investigation or review what Copilot
                previously discovered.
              </p>
            </div>

            <button className="history-action">
              + New Chat
            </button>
          </div>

          <div className="history-list">
            {chats.map((chat) => (
              <div className="history-item" key={chat.id}>
                <div className="history-item-icon">✦</div>

                <div className="history-item-main">
                  <h3>{chat.title}</h3>

                  <div className="history-meta">
                    <span>{chat.service}</span>
                    <span>•</span>
                    <span>{chat.time}</span>
                    <span>•</span>
                    <span>{chat.messages} messages</span>
                  </div>
                </div>

                <div className="history-item-right">
                  <span className="history-status">
                    {chat.status}
                  </span>

                  <button>Open →</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'incidents' && (
        <section className="history-content">
          <div className="history-section-header">
            <div>
              <h2>Previous Incidents</h2>
              <p>
                Review previous incidents and their discovered root
                causes.
              </p>
            </div>

            <span className="history-count">
              {incidents.length} investigations
            </span>
          </div>

          <div className="incident-history-list">
            {incidents.map((incident) => (
              <div
                className="incident-history-item"
                key={incident.id}
              >
                <div className="history-incident-id">
                  {incident.id}
                </div>

                <div className="history-incident-main">
                  <h3>{incident.title}</h3>

                  <div className="history-meta">
                    <span>{incident.service}</span>
                    <span>•</span>
                    <span>{incident.date}</span>
                  </div>
                </div>

                <div className="history-root-cause">
                  <span>ROOT CAUSE</span>
                  <strong>{incident.rootCause}</strong>
                </div>

                <span
                  className={`incident-status ${
                    incident.severity === 'Critical'
                      ? 'critical'
                      : incident.severity === 'Warning'
                        ? 'warning'
                        : 'resolved'
                  }`}
                >
                  {incident.severity}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="history-info">
        <span>✦</span>

        <div>
          <strong>Investigation memory</strong>
          <p>
            Previous investigations can help Copilot recognize
            recurring problems and surface similar incidents.
          </p>
        </div>
      </div>
    </div>
  )
}

export default History