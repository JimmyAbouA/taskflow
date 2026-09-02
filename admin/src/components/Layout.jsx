import { NavLink, Outlet, useNavigate } from 'react-router-dom'

function Layout() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <p className="brand">TaskFlow Admin</p>

        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/tasks">Tasks</NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
