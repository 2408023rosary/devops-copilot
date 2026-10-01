import { useState } from 'react'

function NexusMark({ small = false }) {
  return (
    <div className={`nexus-chat-mark ${small ? 'small' : ''}`}>
      <span className="chat-logo-node top"></span>
      <span className="chat-logo-node left"></span>
      <span className="chat-logo-node right"></span>

      <span className="chat-logo-line left-line"></span>
      <span className="chat-logo-line right-line"></span>

      <span className="chat-logo-core"></span>
    </div>
  )
}

function Copilot() {
  const [message, setMessage] = useState('')

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text:
        "I'm Nexus. I have the current incident context and can help you investigate the failure, understand the evidence, and identify the next troubleshooting step.",
    },
  ])

  const [loading, setLoading] = useState(false)

  const suggestions = [
    'Why is payment-service failing?',
    'What is the likely root cause?',
    'What should I check first?',
    'Have we seen this incident before?',
  ]

  const sendMessage = async (text = message) => {
    const trimmedMessage = text.trim()

    if (!trimmedMessage || loading) return

    setMessages((previous) => [
      ...previous,
      {
        role: 'user',
        text: trimmedMessage,
      },
    ])

    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/copilot/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: trimmedMessage,
            service: 'payment-service',
            scenario: 'crashloop',
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.detail || 'The backend returned an error.',
        )
      }

      const diagnosisText = [
        data.summary,
        '',
        `Root cause: ${data.root_cause}`,
        `Severity: ${data.severity}`,
        `Confidence: ${Math.round(data.confidence * 100)}%`,
        '',
        'Evidence:',
        ...data.evidence.map((item) => `• ${item}`),
        '',
        'Recommended actions:',
        ...data.recommendations.map((item) => `• ${item}`),
        ...(data.missing_information?.length
          ? [
              '',
              'Missing information:',
              ...data.missing_information.map(
                (item) => `• ${item}`,
              ),
            ]
          : []),
      ].join('\n')

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          text: diagnosisText,
        },
      ])
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          text:
            `I couldn't reach the investigation backend. ` +
            `${error.message || 'Please make sure the backend is running.'}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="copilot-page">

      {/* ───────────────── HEADER ───────────────── */}

      <header className="copilot-header">

        <div className="copilot-title-area">

          <div className="nexus-page-eyebrow">
            <span>◈</span>
            NEXUS
            <i></i>
            AI INVESTIGATION
          </div>

          <h1>Nexus AI</h1>

          <p>
            Investigate incidents with context-aware assistance
            across your services, logs, and system signals.
          </p>

        </div>

        <div className="copilot-online">

          <span className="online-pulse"></span>

          <div>
            <strong>{loading ? 'Investigating' : 'AI Ready'}</strong>
            <span>
              {loading
                ? 'Analyzing current incident evidence'
                : 'Investigation context loaded'}
            </span>
          </div>

        </div>

      </header>

      {/* ───────────────── WORKSPACE ───────────────── */}

      <div className="copilot-workspace">

        {/* CONTEXT */}

        <aside className="copilot-context">

          <div className="context-header">

            <div>
              <span className="section-kicker">
                INVESTIGATION
              </span>

              <h2>Current Context</h2>
            </div>

            <span className="context-live">
              LIVE
            </span>

          </div>

          {/* SERVICE */}

          <div className="context-card context-service">

            <span className="context-label">
              AFFECTED SERVICE
            </span>

            <div className="context-service-name">

              <span className="service-context-icon">
                ◇
              </span>

              <strong>
                payment-service
              </strong>

            </div>

            <div className="context-status">

              <span></span>

              CrashLoopBackOff

            </div>

          </div>

          {/* INCIDENT */}

          <div className="context-card">

            <span className="context-label">
              ACTIVE INCIDENT
            </span>

            <div className="context-incident-id">
              INC-001
            </div>

            <p>
              Payment service is failing and containers are
              repeatedly restarting.
            </p>

          </div>

          {/* SIGNALS */}

          <div className="context-card signals-card">

            <span className="context-label">
              RECENT SIGNALS
            </span>

            <div className="signal">

              <span>01</span>

              <p>
                Database connection refused
              </p>

            </div>

            <div className="signal">

              <span>02</span>

              <p>
                Application exited with code 1
              </p>

            </div>

            <div className="signal">

              <span>03</span>

              <p>
                Back-off restarting container
              </p>

            </div>

          </div>

          {/* CONTEXT NOTE */}

          <div className="context-note">

            <NexusMark small />

            <div>
              <strong>Nexus has context</strong>

              <p>
                Responses are grounded in the current
                incident and available system signals.
              </p>
            </div>

          </div>

        </aside>

        {/* CHAT */}

        <section className="chat-panel">

          {/* CHAT HEADER */}

          <div className="chat-panel-header">

            <div className="chat-agent">

              <NexusMark />

              <div>
                <strong>Nexus AI</strong>

                <span>
                  Incident investigation assistant
                </span>
              </div>

            </div>

            <span className="chat-context-status">
              INC-001
            </span>

          </div>

          {/* MESSAGES */}

          <div className="chat-messages">

            {messages.map((item, index) => (

              <div
                className={`chat-message ${item.role}`}
                key={index}
              >

                {item.role === 'assistant' ? (

                  <NexusMark small />

                ) : (

                  <div className="user-avatar">
                    You
                  </div>

                )}

                <div className="message-content">

                  <span className="message-role">

                    {item.role === 'assistant'
                      ? 'Nexus AI'
                      : 'You'}

                  </span>

                  <p style={{ whiteSpace: 'pre-line' }}>
                    {item.text}
                  </p>

                </div>

              </div>

            ))}

            {loading && (
              <div className="chat-message assistant">

                <NexusMark small />

                <div className="message-content">

                  <span className="message-role">
                    Nexus AI
                  </span>

                  <p>
                    Analyzing the current incident evidence...
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* SUGGESTIONS */}

          <div className="suggestion-area">

            <span className="suggestion-label">
              SUGGESTED QUESTIONS
            </span>

            <div className="suggestions">

              {suggestions.map((suggestion) => (

                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  disabled={loading}
                >
                  {suggestion}
                  <span>→</span>
                </button>

              ))}

            </div>

          </div>

          {/* INPUT */}

          <div className="chat-input-area">

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Ask Nexus about this incident..."
              rows={1}
              disabled={loading}
              onKeyDown={(event) => {

                if (
                  event.key === 'Enter' &&
                  !event.shiftKey
                ) {
                  event.preventDefault()
                  sendMessage()
                }

              }}
            />

            <button
              className="send-button"
              onClick={() => sendMessage()}
              disabled={loading || !message.trim()}
              aria-label="Send message"
            >
              ↑
            </button>

          </div>

          <div className="chat-disclaimer">

            Nexus uses available incident context, logs,
            and system signals to generate its response.

          </div>

        </section>

      </div>

    </div>
  )
}

export default Copilot