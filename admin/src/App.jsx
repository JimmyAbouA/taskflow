import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function ApiStatus() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((body) => setStatus(body.data))
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p>Could not reach the API: {error}</p>
  if (!status) return <p>Checking the API...</p>

  return (
    <p>
      API is {status.status} — database {status.database}
    </p>
  )
}

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <ApiStatus />
    </div>
  )
}

function Projects() {
  return (
    <div>
      <h2>Projects</h2>
      <p>The projects table will go here on Day 4.</p>
    </div>
  )
}

function Login() {
  return (
    <div>
      <h2>Login</h2>
      <p>The login form will go here on Day 3.</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div>
        <h1>TaskFlow Admin</h1>

        <nav>
          <Link to="/">Dashboard</Link>
          {' | '}
          <Link to="/projects">Projects</Link>
          {' | '}
          <Link to="/login">Login</Link>
        </nav>

        <hr />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
