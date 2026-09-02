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

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <p className="subtitle">Overview of the TaskFlow backend.</p>

      <div className="card">
        <ApiStatus />
      </div>
    </div>
  )
}

export default Dashboard
