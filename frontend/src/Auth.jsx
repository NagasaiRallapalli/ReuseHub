
import { useState } from 'react'
import './Auth.css'

const API_URL = 'http://localhost:5000/api/auth'

function Auth({ onLogin, onBack }) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      <div className="auth-layout">
        <aside className="auth-showcase">
          <button
            type="button"
            className="auth-back"
            onClick={onBack}
          >
            ← Back to Home
          </button>

          <div className="auth-showcase-content">
            <div className="auth-showcase-mark" aria-hidden="true">♻</div>
            <p className="auth-showcase-eyebrow">INDUSTRIAL REUSE, REIMAGINED</p>
            <h2>Good materials deserve another life.</h2>
            <p>
              Connect with trusted businesses to find reusable materials and
              turn industrial leftovers into new opportunities.
            </p>
            <div className="auth-showcase-note">
              <span aria-hidden="true">✓</span>
              A smarter way to reuse. A better way to grow.
            </div>
          </div>
        </aside>

        <section className="auth-card">
          <div className="auth-logo">♻ <span>ReuseHub</span></div>

          <p className="auth-welcome">
            {isRegister ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}
          </p>
          <h1>
            {isRegister ? 'Join ReuseHub' : 'Login to your account'}
          </h1>

          <p className="auth-subtitle">
            {isRegister
              ? 'Join the industrial reuse community.'
              : 'Continue your journey toward a more sustainable industry.'}
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
                placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
                autoComplete={
                  isRegister ? 'new-password' : 'current-password'
                }
                minLength={isRegister ? 8 : undefined}
                required
              />
            </div>

            {error && <p className="auth-error" role="alert">{error}</p>}

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
              {isRegister ? 'Login' : 'Create account'}
            </button>
          </p>

          <p className="auth-demo-note">
            Securely authenticate through the ReuseHub backend.
          </p>
        </section>
      </div>
    </main>
  )
}

export default Auth
