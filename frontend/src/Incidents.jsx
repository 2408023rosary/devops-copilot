import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useWorkspace } from './state/workspace-context'
import { Badge, Button, Empty, Field, PageHeader } from './components/UI'
import { downloadFile, formatDate } from './services/download'

export default function Incidents() {
  const { data, updateIncident, analyze, busy } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const search = useRef(null)
  const navigate = useNavigate()
  const selected = data.incidents.find((item) => item.id === params.get('id'))
  const filtered = data.incidents
    .filter(
      (item) =>
        (filter === 'all' ||
          (filter === 'resolved'
            ? item.status === 'resolved'
            : item.severity === filter && item.status !== 'resolved')) &&
        `${item.id} ${item.title} ${item.service} ${item.error}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'oldest'
        ? a.createdAt.localeCompare(b.createdAt)
        : sort === 'severity'
          ? Number(b.severity === 'critical') - Number(a.severity === 'critical')
          : b.createdAt.localeCompare(a.createdAt),
    )
  useEffect(() => {
    const handler = (event) => {
      if (
        event.key === '/' &&
        !/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) &&
        !event.target.isContentEditable
      ) {
        event.preventDefault()
        search.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  return (
    <div className="incidents-page nx-page">
      <PageHeader
        eyebrow="INCIDENT RESPONSE"
        title="Incident Explorer"
        description="Inspect evidence, track investigation progress, and record what you learn."
      >
        <div className="nx-count-badge">
          {data.incidents.filter((item) => item.status !== 'resolved').length} open ·{' '}
          {data.incidents.length} total
        </div>
      </PageHeader>
      <div className="nx-toolbar">
        <Field label="Search incidents">
          <input
            type="search"
            ref={search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Service, ID, error…"
          />
        </Field>
        <Field label="Filter">
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All incidents</option>
            <option value="critical">Open critical</option>
            <option value="warning">Open warning</option>
            <option value="resolved">Resolved</option>
          </select>
        </Field>
        <Field label="Sort">
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="severity">Critical first</option>
          </select>
        </Field>
        <Button
          onClick={() =>
            downloadFile(
              'nexus-incidents.json',
              JSON.stringify(filtered, null, 2),
              'application/json',
            )
          }
        >
          Export results
        </Button>
      </div>
      <div className="nx-incident-layout">
        <section className="nx-panel nx-incident-list" aria-label="Incident list">
          <div className="nx-panel-heading">
            <h2>Recent activity</h2>
            <span className="nx-meta" role="status">
              {filtered.length} results
            </span>
          </div>
          {filtered.map((item) => (
            <button
              key={item.id}
              className={`nx-incident-item ${selected?.id === item.id ? 'selected' : ''}`}
              aria-pressed={selected?.id === item.id}
              onClick={() => setParams({ id: item.id })}
            >
              <div className="nx-panel-heading">
                <span className="nx-meta">{item.id}</span>
                <Badge value={item.status === 'resolved' ? 'resolved' : item.severity} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.service}</p>
              <span className="nx-code">{item.error}</span>
            </button>
          ))}
          {!filtered.length && (
            <Empty
              title="No matching incidents"
              action={
                <Button
                  onClick={() => {
                    setQuery('')
                    setFilter('all')
                  }}
                >
                  Clear filters
                </Button>
              }
            >
              Try a different service name or status.
            </Empty>
          )}
        </section>
        <section className="nx-panel nx-incident-detail" aria-label="Incident details">
          {selected ? (
            <IncidentDetail
              key={selected.id}
              incident={selected}
              data={data}
              updateIncident={updateIncident}
              analyze={analyze}
              busy={busy}
              initialTab={params.get('tab')}
              onChat={() => navigate(`/copilot?incident=${selected.id}`)}
            />
          ) : (
            <Empty title={params.get('id') ? 'Incident not found' : 'Select an incident'}>
              Choose an incident to review evidence, add notes, and track its status.
            </Empty>
          )}
        </section>
      </div>
    </div>
  )
}
function IncidentDetail({ incident, data, updateIncident, analyze, busy, initialTab, onChat }) {
  const [tab, setTab] = useState(
    ['logs', 'timeline', 'notes'].includes(initialTab) ? initialTab : 'overview',
  )
  const [note, setNote] = useState('')
  const [logQuery, setLogQuery] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const automatic = useRef(false)
  useEffect(() => {
    if (!data.settings.autoAnalyze || incident.analysis || automatic.current) return
    automatic.current = true
    // Deliberately keep the operation alive across navigation so the workspace receives its result.
    analyze(incident.id).catch(() => {})
  }, [data.settings.autoAnalyze, incident.id, incident.analysis, analyze])
  const runAnalysis = async () => {
    setAnalyzing(true)
    setError('')
    try {
      await analyze(incident.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }
  const saveNote = async (event) => {
    event.preventDefault()
    if (!note.trim()) return
    setError('')
    try {
      await updateIncident(incident.id, { note: note.trim() })
      setNote('')
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <>
      <div className="nx-panel-heading">
        <span className="nx-meta">
          {incident.id} · {incident.service}
        </span>
        <Badge value={incident.severity} />
      </div>
      <h2 className="nx-detail-title">{incident.title}</h2>
      <p>{incident.description}</p>
      <div className="nx-toolbar compact">
        <Field label="Investigation status">
          <select
            aria-label="Investigation status"
            value={incident.status}
            disabled={busy}
            onChange={(event) =>
              updateIncident(incident.id, { status: event.target.value }).catch((err) =>
                setError(err.message),
              )
            }
          >
            <option value="investigating">Investigating</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </select>
        </Field>
        <Button tone="primary" busy={analyzing} disabled={busy && !analyzing} onClick={runAnalysis}>
          {incident.analysis ? 'Run analysis again' : 'Run analysis'}
        </Button>
        <Button onClick={onChat}>Ask Nexus ↗</Button>
      </div>
      {error && (
        <p className="nx-inline-error" role="alert">
          {error}
        </p>
      )}
      <div className="nx-tabs" aria-label="Incident sections">
        {['overview', 'logs', 'timeline', 'notes'].map((name) => (
          <button
            key={name}
            aria-pressed={tab === name}
            className={tab === name ? 'active' : ''}
            onClick={() => setTab(name)}
          >
            {name}
            {name === 'notes' && ` (${incident.notes.length})`}
          </button>
        ))}
      </div>
      <div key={tab} className="nx-tab-content">
        {tab === 'overview' && (
          <>
            {incident.analysis ? (
              <div className="nx-analysis">
                <span className="brand">INVESTIGATION RESULT</span>
                <h3>{incident.analysis.summary}</h3>
                <ol className="nx-check-list">
                  {incident.analysis.recommendations.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ol>
                <p className="nx-meta">
                  Generated {formatDate(incident.analysis.generatedAt)}. No remediation was
                  executed.
                </p>
              </div>
            ) : (
              <Empty
                title={
                  busy && data.settings.autoAnalyze ? 'Analyzing evidence…' : 'Ready to investigate'
                }
              >
                Run analysis to review a working hypothesis and suggested checks.
              </Empty>
            )}
            <dl className="nx-detail-grid">
              <div>
                <dt>Detected</dt>
                <dd>{formatDate(incident.createdAt)}</dd>
              </div>
              <div>
                <dt>Error</dt>
                <dd>{incident.error}</dd>
              </div>
            </dl>
          </>
        )}
        {tab === 'logs' && (
          <>
            <div className="nx-toolbar compact">
              <Field label="Search evidence">
                <input
                  type="search"
                  value={logQuery}
                  onChange={(event) => setLogQuery(event.target.value)}
                  placeholder="Filter log messages"
                />
              </Field>
              <Button
                onClick={() => downloadFile(`${incident.id}-logs.txt`, incident.logs.join('\n'))}
              >
                Download logs
              </Button>
            </div>
            <div className="nx-log-list">
              {incident.logs
                .filter((line) => line.toLowerCase().includes(logQuery.toLowerCase()))
                .map((line, index) => (
                  <div key={index}>
                    <span>{index + 1}</span>
                    <code>{line}</code>
                  </div>
                ))}
            </div>
            {!incident.logs.some((line) => line.toLowerCase().includes(logQuery.toLowerCase())) && (
              <p className="nx-meta">No matching log messages.</p>
            )}
          </>
        )}
        {tab === 'timeline' && (
          <ol className="nx-timeline">
            {incident.timeline.map((event, index) => (
              <li key={index}>
                <strong>{event.text}</strong>
                <time>{formatDate(event.at)}</time>
              </li>
            ))}
          </ol>
        )}
        {tab === 'notes' && (
          <>
            <form onSubmit={saveNote}>
              <Field label="Investigation note">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder="Record a finding or next step…"
                />
              </Field>
              <div className="nx-actions">
                <span className="nx-meta">{note.length}/2000</span>
                <Button type="submit" tone="primary" disabled={busy || !note.trim()}>
                  Save note
                </Button>
              </div>
            </form>
            <div className="nx-notes">
              {[...incident.notes].reverse().map((item) => (
                <article className="nx-note" key={item.id}>
                  <p>{item.text}</p>
                  <time>{formatDate(item.at)}</time>
                </article>
              ))}
              {!incident.notes.length && <p className="nx-meta">No notes yet.</p>}
            </div>
          </>
        )}
      </div>
    </>
  )
}
