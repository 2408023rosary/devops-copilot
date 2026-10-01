import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorkspace } from './state/workspace-context'
import { Button, Badge, Empty, Modal, PageHeader } from './components/UI'
import { formatDate } from './services/download'
import './Dashboard.css'

export default function Dashboard() {
  const { data, updatedAt } = useWorkspace()
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [service, setService] = useState(null)
  const active = data.incidents.filter((item) => item.status !== 'resolved')
  const priority = [...active].sort(
    (a, b) => Number(b.severity === 'critical') - Number(a.severity === 'critical'),
  )[0]
  return (
    <div className="dashboard-page nx-page">
      <PageHeader
        eyebrow="INFRASTRUCTURE INTELLIGENCE"
        title="System Overview"
        description="Monitor service health, follow investigations, and decide what to check next."
      >
        <div className="nx-status-note">
          <Badge value={active.length ? 'investigating' : 'resolved'} />
          <span>{active.length} open incidents</span>
          <small>{updatedAt && `Updated ${formatDate(updatedAt)}`}</small>
        </div>
      </PageHeader>
      {priority ? (
        <section className="priority-incident">
          <div className="priority-incident-content">
            <span className="priority-icon" aria-hidden="true">
              !
            </span>
            <div className="priority-info">
              <div className="priority-label">
                PRIORITY INCIDENT <Badge value={priority.severity} />
              </div>
              <h2>{priority.title}</h2>
              <p>{priority.description}</p>
              <div className="nx-meta">
                {priority.id} · {priority.service} · {priority.error}
              </div>
            </div>
          </div>
          <Button tone="primary" onClick={() => navigate(`/incidents?id=${priority.id}`)}>
            Investigate incident →
          </Button>
        </section>
      ) : (
        <div className="nx-panel">
          <Empty title="No open incidents">
            All recorded incidents have been resolved. Service telemetry is shown separately below.
          </Empty>
        </div>
      )}
      <section className="overview-grid" aria-label="Workspace summary">
        {[
          ['Services', data.services.length, 'In this workspace'],
          [
            'Healthy',
            data.services.filter((item) => item.status === 'healthy').length,
            'Reported service health',
          ],
          ['Open incidents', active.length, 'Awaiting resolution'],
          ['Investigations', data.conversations.length, 'Conversations in this session'],
        ].map(([label, value, detail]) => (
          <article className="overview-card nx-lift" key={label}>
            <div className="overview-card-top">
              <span className="overview-label">{label}</span>
              <span className="nx-metric-symbol" aria-hidden="true">
                ◇
              </span>
            </div>
            <strong key={value} className="nx-value">
              {value}
            </strong>
            <span className="overview-subtext">{detail}</span>
          </article>
        ))}
      </section>
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">INFRASTRUCTURE</span>
            <h2>Service Health</h2>
            <p>Select a service for details and related incidents.</p>
          </div>
          <span className="section-kicker">{data.services.length} SERVICES</span>
        </div>
        <div className="service-grid">
          {data.services.map((item) => (
            <button
              className={`service-card nx-service-button nx-lift ${item.status}`}
              key={item.id}
              onClick={() => setService(item)}
            >
              <div className="service-card-header">
                <span className="service-icon" aria-hidden="true">
                  ▤
                </span>
                <Badge value={item.status} />
              </div>
              <div className="service-card-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
              <div className="service-card-footer">
                <div>
                  <span>UPTIME</span>
                  <strong>{item.uptime}</strong>
                </div>
                <span aria-hidden="true">↗</span>
              </div>
            </button>
          ))}
        </div>
        {!data.services.length && (
          <Empty title="No services yet">
            Services will appear when they are returned by your API.
          </Empty>
        )}
      </section>
      {priority && (
        <section className="nx-two-columns">
          {data.settings.showLogs && (
            <article className="nx-panel">
              <div className="nx-panel-heading">
                <h2>Recent evidence</h2>
                <span className="nx-meta">{priority.service}</span>
              </div>
              <div className="nx-log-list">
                {priority.logs.map((line, index) => (
                  <div key={index}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <code>{line}</code>
                  </div>
                ))}
              </div>
              <Link className="nx-text-link" to={`/incidents?id=${priority.id}&tab=logs`}>
                Explore logs →
              </Link>
            </article>
          )}
          <article className="nx-panel">
            <div className="nx-panel-heading">
              <h2>Investigation activity</h2>
              <Badge value={priority.status} />
            </div>
            <ol className="nx-timeline">
              {priority.timeline.slice(-3).map((event, index) => (
                <li key={index}>
                  <strong>{event.text}</strong>
                  <time>{formatDate(event.at)}</time>
                </li>
              ))}
            </ol>
            <Link className="nx-text-link" to={`/incidents?id=${priority.id}&tab=timeline`}>
              View full timeline →
            </Link>
          </article>
        </section>
      )}
      <section className="ask-nexus-card">
        <div className="ask-nexus-heading">
          <span className="ask-nexus-icon" aria-hidden="true">
            ✦
          </span>
          <div>
            <span className="section-kicker">NEXUS AI ASSISTANT</span>
            <h2>What would you like to investigate?</h2>
            <p>Start a conversation with your question and the priority incident attached.</p>
          </div>
        </div>
        <form
          className="question-box"
          onSubmit={(event) => {
            event.preventDefault()
            if (question.trim())
              navigate(
                `/copilot?${new URLSearchParams({ ...(priority ? { incident: priority.id } : {}), prompt: question.trim() })}`,
              )
          }}
        >
          <label className="dashboard-sr-only" htmlFor="dashboard-question">
            Your question for Nexus
          </label>
          <input
            id="dashboard-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={4000}
            placeholder="What should I check first?"
          />
          <button disabled={!question.trim()}>Ask Nexus →</button>
        </form>
      </section>
      {service && (
        <Modal title={service.name} onClose={() => setService(null)}>
          <Badge value={service.status} />
          <p>{service.description}</p>
          <dl className="nx-detail-grid">
            <div>
              <dt>Uptime</dt>
              <dd>{service.uptime}</dd>
            </div>
            <div>
              <dt>Replicas</dt>
              <dd>{service.replicas}</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>{service.region}</dd>
            </div>
          </dl>
          <h3>Related incidents</h3>
          {data.incidents
            .filter((item) => item.service === service.id)
            .map((item) => (
              <Link className="nx-record-link" key={item.id} to={`/incidents?id=${item.id}`}>
                {item.id} · {item.title}
                <Badge value={item.status} />
              </Link>
            ))}
          {!data.incidents.some((item) => item.service === service.id) && (
            <p>No recorded incidents for this service.</p>
          )}
          <p className="nx-meta">Incident status changes do not change service telemetry.</p>
        </Modal>
      )}
    </div>
  )
}
