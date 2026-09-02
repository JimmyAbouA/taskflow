import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  // Temporary stand-in so the route guard can be tested today. Day 3 replaces
  // this with a real email/password form calling POST /api/auth/login and
  // storing the JWT it returns.
  function handlePlaceholderLogin() {
    localStorage.setItem('token', 'placeholder-until-day-3')
    navigate('/')
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <h2>Log in</h2>
        <p className="subtitle">
          The real email and password form arrives on Day 3. For now this button
          stores a placeholder token so the protected pages can be reached.
        </p>
        <button onClick={handlePlaceholderLogin}>Continue</button>
      </div>
    </div>
  )
}

export default Login
