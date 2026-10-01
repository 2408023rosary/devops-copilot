import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Welcome from './Welcome'
import Dashboard from './Dashboard'
import Incidents from './Incidents'
import Copilot from './Copilot'
import Settings from './Settings'
import History from './History'
import Sidebar from './Sidebar'
import Memory from './Memory'
import WorkspaceProvider from './state/WorkspaceProvider'
import { useWorkspace } from './state/workspace-context'
import { isDemo } from './services/api'
import { Button, ErrorState, Loading } from './components/UI'
import './App.css'
import './Refinements.css'
import './Functionality.css'

function AppLayout() {
  const location = useLocation()
  const { data, loading, error, refresh, busy } = useWorkspace()
  useEffect(() => {
    const titles = {
      '/': 'Welcome',
      '/dashboard': 'System Overview',
      '/incidents': 'Incidents',
      '/copilot': 'Nexus AI',
      '/history': 'History',
      '/memory': 'Memory',
      '/settings': 'Settings',
    }
    document.title = `${titles[location.pathname] || 'Workspace'} | Nexus`
    window.scrollTo(0, 0)
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [location.pathname])
  useEffect(() => {
    document.documentElement.dataset.motion = data?.settings.animations === false ? 'off' : 'on'
  }, [data?.settings.animations])
  if (location.pathname === '/') return <Welcome />
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Sidebar />
      <main id="main-content" className="main-content" tabIndex={-1}>
        <div className="demo-notice">
          {isDemo ? 'DEMO WORKSPACE' : 'CONNECTED WORKSPACE'}
          <span>
            {isDemo
              ? 'Sample infrastructure · simulated AI responses'
              : 'Data provided by your API'}
          </span>
          <Button className="nx-refresh" busy={loading} disabled={busy} onClick={() => refresh()}>
            Refresh data
          </Button>
        </div>
        {error && <ErrorState message={error} retry={() => refresh()} />}
        {!data ? (
          !error && <Loading />
        ) : (
          <div className="nx-route" key={location.pathname}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route
                path="/copilot"
                element={<Copilot key={location.state?.chatSessionKey ?? location.search} />}
              />
              <Route path="/settings" element={<Settings />} />
              <Route path="/history" element={<History />} />
              <Route path="/memory" element={<Memory />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        )}
      </main>
    </div>
  )
}
export default function App() {
  return (
    <BrowserRouter>
      <WorkspaceProvider>
        <AppLayout />
      </WorkspaceProvider>
    </BrowserRouter>
  )
}
