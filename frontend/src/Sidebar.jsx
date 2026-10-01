import { NavLink } from 'react-router-dom'
import './Sidebar.css'
import { useWorkspace } from './state/workspace-context'

const navigation = [
  {
    section: 'Monitor',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      { name: 'Incidents', path: '/incidents', icon: 'incidents' },
    ],
  },
  {
    section: 'Intelligence',
    items: [
      { name: 'Nexus AI', path: '/copilot', icon: 'copilot' },
      { name: 'History', path: '/history', icon: 'history' },
      { name: 'Memory', path: '/memory', icon: 'memory' },
    ],
  },
]

function SidebarIcon({ name }) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    incidents: (
      <>
        <path d="M10.3 4.5a2 2 0 0 1 3.4 0L21.2 18a2 2 0 0 1-1.7 3H4.5a2 2 0 0 1-1.7-3Z" />
        <path d="M12 9v5m0 3h.01" />
      </>
    ),
    copilot: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />,
    history: (
      <>
        <path d="M3 11a9 9 0 1 1 2.6 7.4M3 5v6h6" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    memory: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="2" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
        <path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" />
      </>
    ),
    settings: (
      <>
        <path d="M3 7h4m6 0h8M3 17h8m6 0h4" />
        <circle cx="10" cy="7" r="3" />
        <circle cx="14" cy="17" r="3" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}

function NexusLogo() {
  return (
    <span className="nexus-sidebar-logo" aria-hidden="true">
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
        <ellipse cx="16" cy="16" rx="11" ry="5" transform="rotate(35 16 16)" />
        <ellipse cx="16" cy="16" rx="11" ry="5" transform="rotate(-35 16 16)" />
        <rect x="12.5" y="12.5" width="7" height="7" rx="1.5" transform="rotate(45 16 16)" />
      </svg>
    </span>
  )
}

function NavigationLink({ name, path, icon }) {
  return (
    <NavLink
      to={path}
      title={name}
      className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
    >
      <span className="sidebar-icon">
        <SidebarIcon name={icon} />
      </span>
      <span className="sidebar-link-label">{name}</span>
    </NavLink>
  )
}

function Sidebar() {
  const { data, loading } = useWorkspace()
  const open = data?.incidents.filter((item) => item.status !== 'resolved').length || 0
  return (
    <aside className="sidebar" aria-label="Nexus workspace">
      <div className="sidebar-brand">
        <NexusLogo />
        <div className="sidebar-brand-text">
          <strong>NEXUS</strong>
          <span>DevOps Intelligence</span>
        </div>
      </div>

      <div className="sidebar-content">
        {navigation.map((group) => (
          <div className="sidebar-group" key={group.section}>
            <div className="sidebar-section-title">{group.section}</div>
            <nav className="sidebar-group-links" aria-label={group.section}>
              {group.items.map((item) => (
                <NavigationLink key={item.path} {...item} />
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <nav className="sidebar-utility" aria-label="Workspace settings">
          <NavigationLink name="Settings" path="/settings" icon="settings" />
        </nav>

        <div className="sidebar-ai-status">
          <span className="sidebar-ai-indicator" aria-hidden="true">
            <span className="ai-status-dot" />
          </span>
          <div className="sidebar-ai-status-text">
            <strong>Nexus AI</strong>
            <span>{loading ? 'Refreshing workspace…' : `${open} open incidents`}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
