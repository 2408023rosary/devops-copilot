import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Welcome from './Welcome'
import Dashboard from './Dashboard'
import Incidents from './Incidents'
import Copilot from './Copilot'
import Settings from './Settings'
import History from './History'
import Sidebar from './Sidebar'
import Memory from './Memory'
import './App.css'

function AppLayout() {
  const location = useLocation()

  const isWelcomePage = location.pathname === '/'

  if (isWelcomePage) {
    return <Welcome />
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/copilot" element={<Copilot />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="/memory" element={<Memory />} />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App