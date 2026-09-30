import { NavLink } from 'react-router-dom'

function Sidebar() {
  const navigation = [
    {
      section: 'Monitor',
      items: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: '⌂',
        },
        {
          name: 'Incidents',
          path: '/incidents',
          icon: '⚠',
        },
      ],
    },
    {
      section: 'Copilot',
      items: [
        {
          name: 'AI Assistant',
          path: '/copilot',
          icon: '✦',
        },
        {
          name: 'History',
          path: '/history',
          icon: '◷',
        },
        {
          name: 'Memory',
          path: '/memory',
          icon: '🧠',
        },
      ],
    },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">✦</div>

        <div>
          <strong>DevOps</strong>
          <span>Copilot</span>
        </div>
      </div>

      <div className="sidebar-content">
        {navigation.map((group) => (
          <div className="sidebar-group" key={group.section}>
            <div className="sidebar-section-title">
              {group.section}
            </div>

            <nav>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <span className="sidebar-icon">⚙</span>
          <span>Settings</span>
        </NavLink>

        <div className="sidebar-ai-status">
          <span className="ai-status-dot"></span>

          <div>
            <strong>AI Copilot</strong>
            <span>Ready to assist</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar