import { useState } from 'react'
import { useWorkspace } from './state/workspace-context'
import { Button, Confirm, PageHeader } from './components/UI'
import { downloadFile } from './services/download'
import { isDemo } from './services/api'

export default function Settings() {
  const { data, busy, updateSettings, clearConversations, clearMemories, resetDemo } =
    useWorkspace()
  const [confirmation, setConfirmation] = useState(null)
  const sections = [
    {
      title: 'Workspace experience',
      description: 'Choose how the interface responds while you work.',
      rows: [
        [
          'notifications',
          'In-app notifications',
          'Show success notices for completed actions. Errors always remain visible.',
        ],
        [
          'animations',
          'Interface animations',
          'Animate page transitions, cards, dialogs, and loading states. Your device’s reduced-motion preference always takes priority.',
        ],
      ],
    },
    {
      title: 'Investigation',
      description: 'Control the evidence and analysis workflow.',
      rows: [
        [
          'autoAnalyze',
          'Analyze when opening an incident',
          'Automatically analyze incidents without an existing analysis when you open their detail panel.',
        ],
        [
          'showLogs',
          'Show evidence panels',
          'Display recent signals on the dashboard and alongside Nexus AI. The incident logs tab stays available.',
        ],
      ],
    },
    {
      title: 'Conversations & memory',
      description: 'Decide what to retain for future investigations.',
      rows: [
        [
          'rememberChats',
          'Save new conversations',
          'Keep new conversations after a reload. When disabled, new chats last only for this tab session. Existing saved chats are not deleted.',
        ],
        [
          'memoryEnabled',
          'Investigation memory',
          'Allow attaching previous investigations and saving verified findings from conversations.',
        ],
      ],
    },
  ]
  const actions = {
    chats: {
      title: 'Clear conversation history?',
      label: 'Clear conversations',
      action: clearConversations,
    },
    memories: {
      title: 'Clear investigation memories?',
      label: 'Clear memories',
      action: clearMemories,
    },
    reset: { title: 'Reset the demo workspace?', label: 'Reset demo', action: resetDemo },
  }
  return (
    <div className="settings-page nx-page">
      <PageHeader
        eyebrow="WORKSPACE PREFERENCES"
        title="Settings"
        description="Make Nexus work the way you do. Preferences save as you change them."
      >
        <span className="nx-save-status" role="status">
          {busy ? 'Saving changes…' : 'Preferences up to date'}
        </span>
      </PageHeader>
      <div className="nx-settings-layout">
        <div className="nx-settings-main">
          {sections.map((section, index) => (
            <section className="nx-panel" key={section.title}>
              <div className="nx-settings-heading">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </div>
              </div>
              {section.rows.map(([key, title, description]) => (
                <div className="nx-setting-row" key={key}>
                  <div>
                    <strong id={`${key}-title`}>{title}</strong>
                    <p id={`${key}-description`}>{description}</p>
                  </div>
                  <button
                    className={`nx-switch ${data.settings[key] ? 'on' : ''}`}
                    role="switch"
                    aria-labelledby={`${key}-title`}
                    aria-describedby={`${key}-description`}
                    aria-checked={data.settings[key]}
                    disabled={busy}
                    onClick={() => updateSettings({ [key]: !data.settings[key] }).catch(() => {})}
                  >
                    <span />
                  </button>
                </div>
              ))}
            </section>
          ))}
          <section className="nx-panel">
            <h2>Data & privacy</h2>
            <p>
              Download your workspace or remove saved records. Destructive actions ask for
              confirmation.
            </p>
            <div className="nx-data-actions">
              <Button
                onClick={() =>
                  downloadFile(
                    'nexus-workspace.json',
                    JSON.stringify(data, null, 2),
                    'application/json',
                  )
                }
              >
                Export workspace
              </Button>
              <Button
                tone="danger"
                disabled={!data.conversations.length || busy}
                onClick={() => setConfirmation('chats')}
              >
                Clear conversation history
              </Button>
              <Button
                tone="danger"
                disabled={!data.memories.length || busy}
                onClick={() => setConfirmation('memories')}
              >
                Clear investigation memories
              </Button>
              {isDemo && (
                <Button disabled={busy} onClick={() => setConfirmation('reset')}>
                  Reset demo workspace
                </Button>
              )}
            </div>
          </section>
        </div>
        <aside className="nx-settings-side">
          <section className="nx-panel">
            <span className="nx-record-icon" aria-hidden="true">
              ✦
            </span>
            <div className="brand">NEXUS WORKSPACE</div>
            <h2>One connected investigation workflow</h2>
            <p>
              Changes to incident status, conversations, memories, and preferences are reflected
              across every page.
            </p>
            <dl className="nx-facts">
              <div>
                <dt>Data source</dt>
                <dd>{isDemo ? 'Local demo' : 'Connected API'}</dd>
              </div>
              <div>
                <dt>Conversations</dt>
                <dd>{data.conversations.length}</dd>
              </div>
              <div>
                <dt>Saved memories</dt>
                <dd>{data.memories.length}</dd>
              </div>
              <div>
                <dt>Open incidents</dt>
                <dd>{data.incidents.filter((item) => item.status !== 'resolved').length}</dd>
              </div>
            </dl>
          </section>
          <div className="nx-info">
            <strong>{isDemo ? 'Stored in this browser' : 'Connected workspace'}</strong>
            <p>
              {isDemo
                ? 'Demo records stay in this browser. They are not shared across devices. Private browsing or restricted storage may prevent saving.'
                : 'Your backend provides and stores workspace records. Session handling and permissions are enforced by the server.'}
            </p>
          </div>
        </aside>
      </div>
      {confirmation && (
        <Confirm
          title={actions[confirmation].title}
          label={actions[confirmation].label}
          onClose={() => setConfirmation(null)}
          onConfirm={actions[confirmation].action}
        >
          {confirmation === 'reset'
            ? 'This replaces all demo incidents, notes, conversations, memories, and settings with the original sample workspace. Export anything you want to keep first.'
            : 'This removes the selected saved data. This action cannot be undone.'}
        </Confirm>
      )}
    </div>
  )
}
