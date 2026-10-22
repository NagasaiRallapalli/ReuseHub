
import { useState } from 'react'
import './Auth.css'

const API_URL = 'http://localhost:5000/api/auth'

function Auth({ onLogin, onBack }) {
  const [isRegister, setIsRegister] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('buyer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()

    if (isRegister && !name.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (isRegister && password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    try {
      setLoading(true)

      const endpoint = isRegister ? 'register' : 'login'

      const payload = isRegister
        ? {
            name: name.trim(),
            email: cleanEmail,
            password,
            role,
          }
        : {
            email: cleanEmail,
            password,
          }

      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.')
      }

      localStorage.setItem('reusehub_token', data.token)
      localStorage.setItem(
        'reusehub_demo_user',
        JSON.stringify(data.user)
      )

      // Clear the old demo accounts, which stored plain-text passwords.
      localStorage.removeItem('reusehub_demo_accounts')

      onLogin(data.user)
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          'Cannot connect to the server. Please check that the backend is running.'
        )
      } else {
        setError(err.message || 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button
          type="button"
          className="auth-back"
          onClick={onBack}
        >
          ← Back to Home
        </button>

        <div className="auth-logo">♻ ReuseHub</div>

        <h1>
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>

        <p className="auth-subtitle">
          {isRegister
            ? 'Join the industrial reuse community.'
            : 'Login to continue to ReuseHub.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (at least 8 characters)"
              autoComplete={
                isRegister ? 'new-password' : 'current-password'
              }
              minLength={isRegister ? 8 : undefined}
              required
            />
          </div>

          {isRegister && (
            <div className="auth-field">
              <label htmlFor="auth-role">Account Type</label>
              <select
                id="auth-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="buyer">Buyer — Find materials</option>
                <option value="supplier">Supplier — List waste</option>
              </select>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : `${isRegister ? 'Create Account' : 'Login'} ↗`}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>

        <p className="auth-demo-note">
          Securely authenticate through the ReuseHub backend.
        </p>
      </section>
    </main>
  )
}

export default Auth
