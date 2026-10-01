import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorkspace } from './state/workspace-context'
import { Badge, Button, Confirm, Empty, Field, Modal, PageHeader } from './components/UI'
import { downloadFile, formatDate } from './services/download'

export default function History() {
  const { data, deleteConversation, renameConversation, clearConversations } = useWorkspace()
  const navigate = useNavigate()
  const [tab, setTab] = useState('chats')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [remove, setRemove] = useState(null)
  const [rename, setRename] = useState(null)
  const chats = data.conversations
    .filter((item) =>
      `${item.title} ${item.incidentId || ''}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'oldest'
        ? a.updatedAt.localeCompare(b.updatedAt)
        : b.updatedAt.localeCompare(a.updatedAt),
    )
  const incidents = data.incidents
    .filter((item) =>
      `${item.title} ${item.id} ${item.service}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'oldest'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
    )
  const rows = tab === 'chats' ? chats : incidents
  return (
    <div className="history-page nx-page">
      <PageHeader
        eyebrow="INVESTIGATION RECORD"
        title="History"
        description="Resume a conversation, review an incident, or export your investigation records."
      >
        <Button tone="primary" onClick={() => navigate('/copilot')}>
          + New conversation
        </Button>
      </PageHeader>
      <div className="nx-tabs">
        <button
          className={tab === 'chats' ? 'active' : ''}
          aria-pressed={tab === 'chats'}
          onClick={() => setTab('chats')}
        >
          Conversations <span>{data.conversations.length}</span>
        </button>
        <button
          className={tab === 'incidents' ? 'active' : ''}
          aria-pressed={tab === 'incidents'}
          onClick={() => setTab('incidents')}
        >
          Incidents <span>{data.incidents.length}</span>
        </button>
      </div>
      <div className="nx-toolbar">
        <Field label="Search history">
          <input
            type="search"
            placeholder="Title, incident ID…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field label="Sort history">
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </Field>
        <Button
          disabled={!rows.length}
          onClick={() =>
            downloadFile(`nexus-${tab}.json`, JSON.stringify(rows, null, 2), 'application/json')
          }
        >
          Export results
        </Button>
        {tab === 'chats' && (
          <Button
            tone="danger"
            disabled={!data.conversations.length}
            onClick={() => setRemove('all')}
          >
            Clear conversations
          </Button>
        )}
      </div>
      <section className="nx-panel">
        <div className="nx-panel-heading">
          <h2>{tab === 'chats' ? 'Conversations' : 'Recorded incidents'}</h2>
          <span className="nx-meta" role="status">
            {rows.length} results
          </span>
        </div>
        {!rows.length && (
          <Empty
            title={query ? 'No matching records' : 'No conversations yet'}
            action={
              <Button onClick={() => (query ? setQuery('') : navigate('/copilot'))}>
                {query ? 'Clear search' : 'Start investigating'}
              </Button>
            }
          >
            {query
              ? 'Try another title or incident ID.'
              : 'Conversations appear here as you use Nexus AI.'}
          </Empty>
        )}
        {tab === 'chats'
          ? chats.map((chat) => (
              <article className="nx-history-row" key={chat.id}>
                <span className="nx-record-icon" aria-hidden="true">
                  ✦
                </span>
                <div className="nx-record-main">
                  <Link className="nx-record-title" to={`/copilot?chat=${chat.id}`}>
                    {chat.title}
                  </Link>
                  <p className="nx-meta">
                    {chat.incidentId || 'General'} · {chat.messages.length} messages ·{' '}
                    {formatDate(chat.updatedAt)}
                  </p>
                  <span className="nx-meta">{chat.persisted ? 'Saved' : 'Session only'}</span>
                </div>
                <div className="nx-actions">
                  <Button aria-label={`Rename ${chat.title}`} onClick={() => setRename(chat)}>
                    Rename
                  </Button>
                  <Button
                    tone="danger"
                    aria-label={`Delete ${chat.title}`}
                    onClick={() => setRemove(chat)}
                  >
                    Delete
                  </Button>
                  <Button onClick={() => navigate(`/copilot?chat=${chat.id}`)}>Open →</Button>
                </div>
              </article>
            ))
          : incidents.map((incident) => (
              <article className="nx-history-row" key={incident.id}>
                <div className="nx-record-main">
                  <span className="nx-meta">
                    {incident.id} · {incident.service}
                  </span>
                  <Link
                    className="nx-record-title"
                    to={`/incidents?id=${incident.id}&tab=timeline`}
                  >
                    {incident.title}
                  </Link>
                  <p className="nx-meta">
                    {formatDate(incident.createdAt)} · {incident.notes.length} notes
                  </p>
                </div>
                <Badge value={incident.status} />
                <Button onClick={() => navigate(`/incidents?id=${incident.id}&tab=timeline`)}>
                  View timeline →
                </Button>
              </article>
            ))}
      </section>
      {remove && (
        <Confirm
          title={remove === 'all' ? 'Clear all conversations?' : 'Delete this conversation?'}
          label={remove === 'all' ? 'Clear conversations' : 'Delete conversation'}
          onClose={() => setRemove(null)}
          onConfirm={() =>
            remove === 'all' ? clearConversations() : deleteConversation(remove.id)
          }
        >
          This removes the selected conversation records. Incident records and saved memories remain
          available. This cannot be undone.
        </Confirm>
      )}
      {rename && (
        <Rename chat={rename} onClose={() => setRename(null)} onSave={renameConversation} />
      )}
    </div>
  )
}
function Rename({ chat, onClose, onSave }) {
  const [title, setTitle] = useState(chat.title)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <Modal title="Rename conversation" onClose={onClose} busy={busy}>
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          setBusy(true)
          try {
            await onSave(chat.id, title.trim())
            onClose()
          } catch (err) {
            setError(err.message)
          } finally {
            setBusy(false)
          }
        }}
      >
        <Field label="Conversation title">
          <input
            autoFocus
            maxLength={100}
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        {error && (
          <p className="nx-inline-error" role="alert">
            {error}
          </p>
        )}
        <div className="nx-actions">
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button tone="primary" type="submit" busy={busy} disabled={!title.trim()}>
            Save title
          </Button>
        </div>
      </form>
    </Modal>
  )
}
