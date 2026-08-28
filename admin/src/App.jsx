import { useState, useEffect } from 'react'

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
      API is {status.status} — database {status.database} — up for{' '}
      {status.uptimeSeconds}s
    </p>
  )
}

function TaskCard({ title, priority }) {
  const [done, setDone] = useState(false)

  return (
    <div>
      <strong>{title}</strong> — priority: {priority} — status: {done ? 'done' : 'todo'}
      <button onClick={() => setDone(!done)}>
        {done ? 'Mark as todo' : 'Mark as done'}
      </button>
    </div>
  )
}

function App() {
  return (
    <div>
      <h1>TaskFlow Admin</h1>
      <h3>Compu-Vision internship — Week 2</h3>

      <ApiStatus />

      <TaskCard title="Design the logo" priority="high" />
      <TaskCard title="Write the README" priority="low" />
      <TaskCard title="Deploy the API" priority="medium" />
    </div>
  )
}

export default App
