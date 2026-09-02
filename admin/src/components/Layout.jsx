import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearToken } from '../api.js'

function Layout() {
  const navigate = useNavigate()

  function handleLogout() {
    clearToken()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <p className="brand">
          <span className="brand-mark">TF</span>
          TaskFlow
        </p>

        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/tasks">Tasks</NavLink>
        </nav>

        <div className="sidebar-footer">
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
