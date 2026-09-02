import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, clearToken } from '../api.js'
import { FeedbackBanner, formatApiError } from '../components/Feedback.jsx'

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const justSignedIn = location.state?.justSignedIn
  const [health, setHealth] = useState(null)
  const [user, setUser] = useState(justSignedIn || null)
  const [counts, setCounts] = useState({ projects: null, tasks: null })
  const [error, setError] = useState(null)

  useEffect(() => {
    api('/health')
      .then((body) => setHealth(body.data))
      .catch((err) => setError(formatApiError(err)))

    api('/auth/me')
      .then((body) => setUser(body.data.user))
      .catch((err) => {
        if (err.status === 401) {
          clearToken()
          navigate('/login')
          return
        }
        setError(formatApiError(err))
      })

    Promise.all([api('/projects'), api('/tasks')])
      .then(([projects, tasks]) => {
        setCounts({
          projects: projects.meta?.total ?? projects.data?.length ?? 0,
          tasks: tasks.meta?.total ?? tasks.data?.length ?? 0,
        })
      })
      .catch((err) => setError(formatApiError(err)))
  }, [navigate])

  return (
    <div>
      <div className="page-head">
        <h2>Dashboard</h2>
        <p className="subtitle">Overview of the TaskFlow backend.</p>
      </div>
      {justSignedIn ? (
        <p className="notice">
          Signed in. Your password is not shown here or in Compass — only a
          hash is stored.
        </p>
      ) : null}

      <FeedbackBanner>{error}</FeedbackBanner>

      <div className="stats">
        <div className="card">
          <p className="stat-label">Signed in as</p>
          <p className="stat-value">{user ? user.name : 'Loading…'}</p>
          {user ? (
            <p className="cell-muted">
              {user.email} · {user.role}
            </p>
          ) : null}
        </div>
        <div className="card">
          <p className="stat-label">API</p>
          <p className="stat-value">
            {health ? health.status : error ? 'unreachable' : 'checking…'}
          </p>
          {health ? (
            <p className="cell-muted">
              database {health.database} · up {health.uptimeSeconds}s
            </p>
          ) : null}
        </div>
        <div className="card">
          <p className="stat-label">Projects</p>
          <p className="stat-value">
            {counts.projects === null ? '…' : counts.projects}
          </p>
        </div>
        <div className="card">
          <p className="stat-label">Tasks</p>
          <p className="stat-value">
            {counts.tasks === null ? '…' : counts.tasks}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
