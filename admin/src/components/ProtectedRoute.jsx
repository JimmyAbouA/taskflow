import { Navigate } from 'react-router-dom'
import { getToken } from '../api.js'

function ProtectedRoute({ children }) {
  const token = getToken()

  if (!token || token === 'placeholder-until-day-3') {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
