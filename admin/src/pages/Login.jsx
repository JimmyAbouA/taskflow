import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, clearToken, getToken, setToken } from '../api.js'
import { FeedbackBanner, FieldHint, formatApiError } from '../components/Feedback.jsx'
import { validateAuth } from '../constants.js'

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const alreadyIn = Boolean(getToken() && getToken() !== 'placeholder-until-day-3')

  function switchMode(next) {
    setMode(next)
    setError('')
    setFieldErrors({})
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateAuth({ mode, name, email, password })
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setError('')
    setLoading(true)

    try {
      const path = mode === 'register' ? '/auth/register' : '/auth/login'
      const payload =
        mode === 'register'
          ? { name: name.trim(), email: email.trim(), password }
          : { email: email.trim(), password }

      const body = await api(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setToken(body.data.token)
      navigate('/', { state: { justSignedIn: body.data.user } })
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }

  if (alreadyIn) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <p className="brand">
            <span className="brand-mark">TF</span>
            TaskFlow
          </p>
          <h2>You are already signed in</h2>
          <p className="subtitle">
            Register and login both store a token, so this page skips the form
            until you log out.
          </p>
          <button type="button" onClick={() => navigate('/')}>
            Go to dashboard
          </button>
          <button
            type="button"
            className="linkish"
            onClick={() => {
              clearToken()
              setError('')
            }}
          >
            Log out and use a different account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <p className="brand">
          <span className="brand-mark">TF</span>
          TaskFlow
        </p>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="subtitle">
          {mode === 'register'
            ? 'This creates a user in MongoDB, then signs you in automatically.'
            : 'Use the same email and password you registered with.'}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'register' ? (
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              <FieldHint>{fieldErrors.name}</FieldHint>
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <FieldHint>{fieldErrors.email}</FieldHint>
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
            <FieldHint>{fieldErrors.password}</FieldHint>
          </label>

          <FeedbackBanner>{error}</FeedbackBanner>

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="switch-mode">
          {mode === 'login' ? (
            <button type="button" className="linkish" onClick={() => switchMode('register')}>
              Need an account? Register
            </button>
          ) : (
            <button type="button" className="linkish" onClick={() => switchMode('login')}>
              Already have an account? Log in
            </button>
          )}
        </p>
      </div>
    </div>
  )
}

export default Login
