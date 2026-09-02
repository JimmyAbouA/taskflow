import { Navigate } from 'react-router-dom'

// Blocks anything it wraps unless a token is stored. Day 3 replaces the
// placeholder token with a real JWT from POST /api/auth/login.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
