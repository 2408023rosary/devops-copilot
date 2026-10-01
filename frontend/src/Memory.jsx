import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from './state/workspace-context'
import { Button, Confirm, Empty, Field, PageHeader } from './components/UI'
import { downloadFile, formatDate } from './services/download'

export default function Memory() {
  const { data, busy, updateSettings, deleteMemory, clearMemories } = useWorkspace()
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [service, setService] = useState('all')
  const [sort, setSort] = useState('similarity')
  const [remove, setRemove] = useState(null)
  const [targetIncident, setTargetIncident] = useState(
    data.incidents.find((item) => item.status !== 'resolved')?.id || '',
  )
  const navigate = useNavigate()
  const enabled = data.settings.memoryEnabled
  const filtered = data.memories
    .filter(
      (item) =>
        (service === 'all' || item.service === service) &&
        `${item.title} ${item.rootCause} ${item.service} ${item.incidentId}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'recent'
        ? b.createdAt.localeCompare(a.createdAt)
        : (b.similarity || 0) - (a.similarity || 0),
    )
  const selected = data.memories.find((item) => item.id === selectedId)
  return (
    <div className="memory-page nx-page">
      <PageHeader
        eyebrow="INVESTIGATION KNOWLEDGE"
        title="Memory"
        description="Keep verified findings and reuse past resolutions as investigation references."
      >
        <button
          className={`nx-button ${enabled ? 'primary' : 'secondary'}`}
          role="switch"
          aria-checked={enabled}
          disabled={busy}
          onClick={() => updateSettings({ memoryEnabled: !enabled }).catch(() => {})}
        >
          {enabled ? 'Memory enabled' : 'Memory disabled'}
        </button>
      </PageHeader>
      <div className="nx-memory-stats">
        {[
          [data.memories.length, 'Stored investigations'],
          [new Set(data.memories.map((item) => item.service)).size, 'Services covered'],
          [new Set(data.memories.map((item) => item.rootCause)).size, 'Recorded root causes'],
        ].map(([value, label]) => (
          <article className="nx-panel nx-lift" key={label}>
            <strong className="nx-stat-value">{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
      {!enabled && (
        <div className="nx-info">
          Memory is paused. You can review or delete saved records, but attaching and saving
          investigations is disabled.
        </div>
      )}
      <div className="nx-toolbar">
        <Field label="Search memories">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cause, service, incident…"
          />
        </Field>
        <Field label="Service">
          <select value={service} onChange={(event) => setService(event.target.value)}>
            <option value="all">All services</option>
            {[...new Set(data.memories.map((item) => item.service))].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </Field>
        <Field label="Sort memories">
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="similarity">Reference score</option>
            <option value="recent">Most recent</option>
          </select>
        </Field>
        <Button
          disabled={!filtered.length}
          onClick={() =>
            downloadFile(
              'nexus-memories.json',
              JSON.stringify(filtered, null, 2),
              'application/json',
            )
          }
        >
          Export results
        </Button>
      </div>
      <div className="nx-memory-layout">
        <section className="nx-panel">
          <div className="nx-panel-heading">
            <h2>Stored investigations</h2>
            <span className="nx-meta" role="status">
              {filtered.length} records
            </span>
          </div>
          <p className="nx-meta">
            Reference scores belong to the original sample dataset; new records are unscored.
          </p>
          {filtered.map((item) => (
            <button
              key={item.id}
              className={`nx-memory-item ${selectedId === item.id ? 'selected' : ''}`}
              aria-pressed={selectedId === item.id}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="nx-memory-score">
                {item.similarity == null ? '—' : `${item.similarity}%`}
                <small>{item.similarity == null ? 'unscored' : 'sample'}</small>
              </span>
              <span className="nx-record-main">
                <span className="nx-meta">
                  {item.incidentId} · {item.service}
                </span>
                <strong>{item.title}</strong>
                <span className="nx-meta">{formatDate(item.createdAt)}</span>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
          {!filtered.length && (
            <Empty
              title="No matching memories"
              action={
                query || service !== 'all' ? (
                  <Button
                    onClick={() => {
                      setQuery('')
                      setService('all')
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/copilot')}>Start an investigation</Button>
                )
              }
            >
              Save a verified root cause and resolution from a Nexus AI conversation.
            </Empty>
          )}
        </section>
        <aside className="nx-panel">
          {selected ? (
            <div className="nx-tab-content" key={selected.id}>
              <div className="brand">PREVIOUS INVESTIGATION</div>
              <h2>{selected.title}</h2>
              <p className="nx-meta">
                {selected.incidentId} · {selected.service}
              </p>
              <div className="nx-context-block">
                <h3>Root cause</h3>
                <p>{selected.rootCause}</p>
              </div>
              <div className="nx-context-block">
                <h3>What resolved it</h3>
                <p>{selected.resolution}</p>
              </div>
              <Field label="Attach to incident">
                <select
                  value={targetIncident}
                  onChange={(event) => setTargetIncident(event.target.value)}
                >
                  <option value="">General investigation</option>
                  {data.incidents.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} · {item.service}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="nx-actions">
                <Button
                  tone="primary"
                  disabled={!enabled}
                  onClick={() =>
                    navigate(
                      `/copilot?${new URLSearchParams({ memory: selected.id, ...(targetIncident ? { incident: targetIncident } : {}) })}`,
                    )
                  }
                >
                  Use this investigation →
                </Button>
                <Button tone="danger" onClick={() => setRemove(selected)}>
                  Delete memory
                </Button>
              </div>
            </div>
          ) : (
            <Empty title="Select an investigation">
              Review its cause and resolution before attaching it to a new conversation.
            </Empty>
          )}
        </aside>
      </div>
      <section className="nx-panel nx-management">
        <div>
          <h2>Memory management</h2>
          <p>Deleting memories removes the reference records, not your incident or chat history.</p>
        </div>
        <Button tone="danger" disabled={!data.memories.length} onClick={() => setRemove('all')}>
          Clear all memories
        </Button>
      </section>
      {remove && (
        <Confirm
          title={remove === 'all' ? 'Clear all memories?' : 'Delete this memory?'}
          label={remove === 'all' ? 'Clear memories' : 'Delete memory'}
          onClose={() => setRemove(null)}
          onConfirm={async () => {
            if (remove === 'all') await clearMemories()
            else await deleteMemory(remove.id)
            setSelectedId(null)
          }}
        >
          This permanently removes the selected reference records. Existing conversations will keep
          their messages.
        </Confirm>
      )}
    </div>
  )
}
