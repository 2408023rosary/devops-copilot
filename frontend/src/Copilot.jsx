import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useWorkspace } from './state/workspace-context'
import { Button, Badge, Empty, Field, Modal, PageHeader } from './components/UI'
import { downloadFile, formatDate } from './services/download'
import { isDemo } from './services/api'

export default function Copilot() {
  const { data, createConversation, sendMessage, saveMemory, notice } = useWorkspace()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeId, setActiveId] = useState(params.get('chat'))
  const [incidentId, setIncidentId] = useState(params.get('incident') || '')
  const [memoryId, setMemoryId] = useState(params.get('memory') || '')
  const [message, setMessage] = useState(params.get('prompt') || '')
  const [pending, setPending] = useState(false)
  const [pendingText, setPendingText] = useState('')
  const [error, setError] = useState('')
  const [saveOpen, setSaveOpen] = useState(false)
  const controller = useRef(null)
  const retry = useRef(null)
  const inFlight = useRef(false)
  const end = useRef(null)
  const mounted = useRef(true)
  const chat = data.conversations.find((item) => item.id === activeId)
  const incident = data.incidents.find((item) => item.id === (chat?.incidentId || incidentId))
  const memory = data.memories.find((item) => item.id === (chat?.memoryId || memoryId))
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      controller.current?.abort()
    }
  }, [])
  useEffect(() => {
    if (end.current) end.current.scrollTop = end.current.scrollHeight
  }, [chat?.messages.length, pending])
  const send = async (text = message) => {
    const trimmed = text.trim()
    if (!trimmed || inFlight.current) return
    inFlight.current = true
    setPending(true)
    setPendingText(trimmed)
    setError('')
    const abort = new AbortController()
    controller.current = abort
    try {
      let currentId = activeId
      if (!currentId) {
        const created = await createConversation({
          incidentId: incident?.id || null,
          memoryId: data.settings.memoryEnabled ? memory?.id || null : null,
        })
        currentId = created.id
        if (mounted.current) setActiveId(currentId)
      }
      if (abort.signal.aborted) throw new DOMException('Request cancelled', 'AbortError')
      const payload =
        retry.current?.text === trimmed && retry.current.chatId === currentId
          ? retry.current
          : { text: trimmed, requestId: crypto.randomUUID(), chatId: currentId }
      retry.current = payload
      await sendMessage(
        currentId,
        { text: payload.text, requestId: payload.requestId },
        abort.signal,
      )
      retry.current = null
      if (mounted.current) {
        setMessage('')
        if (!params.get('chat'))
          navigate(`/copilot?chat=${currentId}`, {
            replace: true,
            state: { chatSessionKey: location.state?.chatSessionKey ?? location.search },
          })
      }
    } catch (err) {
      if (mounted.current) {
        setMessage(trimmed)
        setError(
          err.name === 'AbortError'
            ? 'Response stopped. Your message is ready to send again.'
            : err.message,
        )
      }
    } finally {
      inFlight.current = false
      if (mounted.current) {
        setPending(false)
        setPendingText('')
      }
    }
  }
  const exportChat = () =>
    downloadFile(
      `nexus-${chat.id}.txt`,
      `${chat.title}\n${chat.incidentId || 'General investigation'}\n\n${chat.messages.map((item) => `${item.role.toUpperCase()} — ${formatDate(item.at)}\n${item.text}`).join('\n\n')}`,
    )
  if (params.get('chat') && !chat)
    return (
      <div className="copilot-page nx-page">
        <Empty
          title="Conversation not found"
          action={<Button onClick={() => navigate('/copilot')}>Start a new conversation</Button>}
        >
          It may have been deleted or was not saved between sessions.
        </Empty>
      </div>
    )
  return (
    <div className="copilot-page nx-page">
      <PageHeader
        eyebrow="AI INVESTIGATION"
        title="Nexus AI"
        description="Follow the evidence, ask focused questions, and keep each investigation together."
      >
        <Button disabled={pending} onClick={() => navigate(`/copilot?new=${crypto.randomUUID()}`)}>
          + New conversation
        </Button>
      </PageHeader>
      <div className="nx-chat-layout">
        <aside className="nx-panel nx-chat-context">
          <div className="nx-panel-heading">
            <h2>Investigation context</h2>
            <Badge value={isDemo ? 'demo' : 'connected'} />
          </div>
          <Field label="Incident">
            <select
              value={incident?.id || ''}
              disabled={!!chat || pending}
              onChange={(event) => setIncidentId(event.target.value)}
            >
              <option value="">General investigation</option>
              {data.incidents.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} · {item.service}
                </option>
              ))}
            </select>
          </Field>
          {incident && (
            <div className="nx-context-block">
              <span className="brand">AFFECTED SERVICE</span>
              <h3>{incident.service}</h3>
              <Badge value={incident.status} />
              <p>{incident.description}</p>
              <Button onClick={() => navigate(`/incidents?id=${incident.id}`)}>
                Open incident →
              </Button>
            </div>
          )}
          {incident && data.settings.showLogs && (
            <div className="nx-context-block">
              <span className="brand">RECENT SIGNALS</span>
              <ul className="nx-signals">
                {incident.logs.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {data.settings.memoryEnabled && (
            <Field label="Reference investigation">
              <select
                value={memory?.id || ''}
                disabled={!!chat || pending}
                onChange={(event) => setMemoryId(event.target.value)}
              >
                <option value="">No memory attached</option>
                {data.memories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {memory && data.settings.memoryEnabled && (
            <div className="nx-context-block">
              <span className="brand">PREVIOUS RESOLUTION</span>
              <p>{memory.resolution}</p>
            </div>
          )}
          <p className="nx-meta">
            {chat
              ? 'Context stays attached to this conversation. Start a new conversation to change it.'
              : 'Choose an incident or begin with a general question.'}
          </p>
          <span className="nx-save-status">
            {(chat?.persisted ?? data.settings.rememberChats)
              ? chat
                ? '◷ Conversation saved to history'
                : '◷ New conversation will be saved'
              : '◌ Session only · not saved after reload'}
          </span>
        </aside>
        <section className="nx-chat-panel">
          <div className="nx-chat-heading">
            <div>
              <strong>{chat?.title || 'New investigation'}</strong>
              <span>
                {isDemo
                  ? 'Demo assistant · simulated responses'
                  : 'Incident investigation assistant'}
              </span>
            </div>
            <div className="nx-actions">
              <Button disabled={!chat?.messages.length || pending} onClick={exportChat}>
                Export
              </Button>
              <Button
                disabled={
                  !incident || !chat?.messages.length || !data.settings.memoryEnabled || pending
                }
                onClick={() => setSaveOpen(true)}
              >
                Save to memory
              </Button>
            </div>
          </div>
          <div
            className="nx-messages"
            ref={end}
            role="log"
            aria-label="Conversation"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {!chat?.messages.length && !pending && (
              <Empty title="Where should we start?">
                {incident
                  ? `The ${incident.service} evidence is attached. Ask about the failure, logs, or next troubleshooting step.`
                  : 'Select an incident for context or ask a general investigation question.'}
              </Empty>
            )}
            {chat?.messages.map((item) => (
              <article className={`nx-message ${item.role}`} key={item.id}>
                <span className="nx-avatar" aria-hidden="true">
                  {item.role === 'user' ? 'Y' : '✦'}
                </span>
                <div>
                  <span className="nx-message-role">
                    {item.role === 'user' ? 'You' : 'Nexus AI'}
                  </span>
                  <p>{item.text}</p>
                  {item.role === 'assistant' && (
                    <button
                      className="nx-copy"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(item.text)
                          notice('Response copied')
                        } catch {
                          notice(
                            'Clipboard access is unavailable. Use Export to download the conversation.',
                            'warning',
                          )
                        }
                      }}
                    >
                      Copy response
                    </button>
                  )}
                </div>
              </article>
            ))}
            {pending && (
              <>
                <article className="nx-message user">
                  <span className="nx-avatar" aria-hidden="true">
                    Y
                  </span>
                  <div>
                    <span className="nx-message-role">You · sending</span>
                    <p>{pendingText}</p>
                  </div>
                </article>
                <div className="nx-thinking" role="status">
                  <span className="nx-avatar" aria-hidden="true">
                    ✦
                  </span>
                  <span className="nx-typing" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>Nexus is reviewing the evidence…</span>
                </div>
              </>
            )}
          </div>
          <div className="nx-chat-bottom">
            {(!chat || chat.messages.length === 0) && (
              <div className="nx-suggestions">
                {[
                  'What is the likely root cause?',
                  'What should I check first?',
                  'Show me the evidence',
                  'Have we seen this before?',
                ].map((text) => (
                  <button
                    disabled={pending}
                    key={text}
                    onClick={() => {
                      setMessage(text)
                      send(text)
                    }}
                  >
                    {text} ↗
                  </button>
                ))}
              </div>
            )}
            {error && (
              <div className="nx-inline-error" role="alert">
                {error}
                {message.trim() && (
                  <Button disabled={pending} onClick={() => send()}>
                    Retry message
                  </Button>
                )}
              </div>
            )}
            <form
              className="nx-composer"
              onSubmit={(event) => {
                event.preventDefault()
                send()
              }}
            >
              <label className="dashboard-sr-only" htmlFor="nexus-message">
                Message Nexus
              </label>
              <textarea
                id="nexus-message"
                rows={2}
                value={message}
                disabled={pending}
                maxLength={4000}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    send()
                  }
                }}
                placeholder="Ask about the incident…"
              />
              {pending ? (
                <Button
                  key="stop"
                  tone="danger"
                  onClick={(event) => {
                    event.preventDefault()
                    controller.current?.abort()
                  }}
                >
                  Stop
                </Button>
              ) : (
                <Button key="send" type="submit" tone="primary" disabled={!message.trim()}>
                  Send ↑
                </Button>
              )}
            </form>
            <div className="nx-composer-hint">
              <span>Enter to send · Shift + Enter for a new line</span>
              <span>{message.length}/4000</span>
            </div>
            <p className="nx-disclaimer">
              {isDemo ? 'Simulated replies. ' : ''}Verify findings before changing infrastructure.
              Nexus does not execute remediation.
            </p>
          </div>
        </section>
      </div>
      {saveOpen && (
        <SaveMemory incident={incident} onClose={() => setSaveOpen(false)} onSave={saveMemory} />
      )}
    </div>
  )
}
function SaveMemory({ incident, onClose, onSave }) {
  const [cause, setCause] = useState(incident.analysis?.summary || '')
  const [resolution, setResolution] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <Modal title="Save investigation to Memory" onClose={onClose} busy={busy}>
      <p>Record verified findings for {incident.id}. Enter what actually resolved the issue.</p>
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          setBusy(true)
          setError('')
          try {
            await onSave({
              incidentId: incident.id,
              service: incident.service,
              title: incident.title,
              rootCause: cause.trim(),
              resolution: resolution.trim(),
            })
            onClose()
          } catch (err) {
            setError(err.message)
          } finally {
            setBusy(false)
          }
        }}
      >
        <Field label="Verified root cause">
          <input
            required
            maxLength={300}
            value={cause}
            onChange={(event) => setCause(event.target.value)}
          />
        </Field>
        <Field label="Resolution">
          <textarea
            required
            maxLength={2000}
            rows={4}
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
          />
        </Field>
        {error && (
          <p role="alert" className="nx-inline-error">
            {error}
          </p>
        )}
        <div className="nx-actions">
          <Button disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            tone="primary"
            busy={busy}
            disabled={!cause.trim() || !resolution.trim()}
          >
            Save investigation
          </Button>
        </div>
      </form>
    </Modal>
  )
}
