import { useState, useEffect, useCallback } from 'react'
import './Dashboard.css'

const API = 'http://localhost:5000/api'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${String(status).toLowerCase()}`}>
      {status}
    </span>
  )
}

function Dashboard({
  user,
  materials = [],
  onRefresh = () => {},
  onRequireLogin = () => {},
  onListWaste = () => {},
}) {
  const [tab, setTab] = useState('received')
  const [received, setReceived] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const myListings = materials.filter(
    (m) => String(m.supplierId) === String(user?.id)
  )

  const loadRequests = useCallback(async () => {
    const token = localStorage.getItem('reusehub_token')

    if (!token) {
      onRequireLogin()
      return
    }

    setError('')

    try {
      const headers = { Authorization: `Bearer ${token}` }

      const [receivedRes, sentRes] = await Promise.all([
        fetch(`${API}/requests/received`, { headers }),
        fetch(`${API}/requests/sent`, { headers }),
      ])

      if (receivedRes.status === 401 || sentRes.status === 401) {
        onRequireLogin()
        return
      }

      const receivedData = await receivedRes.json()
      const sentData = await sentRes.json()

      setReceived(receivedData.requests || [])
      setSent(sentData.requests || [])
    } catch {
      setError('Could not connect to the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [onRequireLogin])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  async function updateStatus(requestId, status) {
    const token = localStorage.getItem('reusehub_token')
    setBusyId(requestId)
    setError('')

    try {
      const res = await fetch(`${API}/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Could not update request.')
      }

      await loadRequests()
      await onRefresh()
    } catch (err) {
      setError(err.message || 'Could not update request.')
    } finally {
      setBusyId(null)
    }
  }

  const pendingCount = received.filter((r) => r.status === 'Pending').length

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <p className="eyebrow">YOUR DASHBOARD</p>
        <h1>Welcome, {user.name}</h1>
        <p>Manage your listings and track material requests in one place.</p>
      </div>

      <div className="dashboard-stats">
        <div>
          <strong>{myListings.length}</strong>
          <span>My listings</span>
        </div>
        <div>
          <strong>{pendingCount}</strong>
          <span>Pending requests</span>
        </div>
        <div>
          <strong>{sent.length}</strong>
          <span>Requests sent</span>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={tab === 'received' ? 'active-tab' : ''}
          onClick={() => setTab('received')}
        >
          Requests Received
          {pendingCount > 0 && <em>{pendingCount}</em>}
        </button>
        <button
          className={tab === 'listings' ? 'active-tab' : ''}
          onClick={() => setTab('listings')}
        >
          My Listings
        </button>
        <button
          className={tab === 'sent' ? 'active-tab' : ''}
          onClick={() => setTab('sent')}
        >
          My Requests
        </button>
      </div>

      {error && (
        <p className="request-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="dashboard-empty">Loading...</p>
      ) : tab === 'received' ? (
        received.length === 0 ? (
          <div className="dashboard-empty">
            No requests received yet. When someone requests your material,
            it will appear here.
          </div>
        ) : (
          <div className="dash-list">
            {received.map((r) => (
              <div className="dash-card" key={r._id}>
                <div className="dash-card-top">
                  <div>
                    <h3>{r.materialName}</h3>
                    <p className="dash-sub">
                      {r.companyName} · {r.buyerName}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="dash-meta">
                  <span>
                    Requested: <strong>{r.quantity.toLocaleString()} {r.unit}</strong>
                  </span>
                  <span>
                    Email: <strong>{r.email}</strong>
                  </span>
                  <span>
                    Date: <strong>{formatDate(r.createdAt)}</strong>
                  </span>
                </div>

                {r.message && <p className="dash-message">“{r.message}”</p>}

                {r.status === 'Pending' && (
                  <div className="dash-actions">
                    <button
                      className="accept-btn"
                      disabled={busyId === r._id}
                      onClick={() => updateStatus(r._id, 'Accepted')}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-btn"
                      disabled={busyId === r._id}
                      onClick={() => updateStatus(r._id, 'Rejected')}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : tab === 'listings' ? (
        myListings.length === 0 ? (
          <div className="dashboard-empty">
            You have not listed any waste yet.
            <br />
            <button className="primary-btn" onClick={onListWaste}>
              + List Your Waste
            </button>
          </div>
        ) : (
          <div className="dash-list">
            {myListings.map((m) => {
              const available = Number(m.availableQuantity ?? m.quantity)
              const taken = Number(m.quantity) - available
              const percent = Math.min(100, (taken / Number(m.quantity)) * 100)

              return (
                <div className="dash-card" key={m.id}>
                  <div className="dash-card-top">
                    <div>
                      <h3>
                        {m.icon} {m.name}
                      </h3>
                      <p className="dash-sub">
                        {m.category} · {m.location}
                      </p>
                    </div>
                    <StatusBadge
                      status={available <= 0 ? 'Fulfilled' : 'Available'}
                    />
                  </div>

                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="dash-meta">
                    <span>
                      Total: <strong>{Number(m.quantity).toLocaleString()} {m.unit}</strong>
                    </span>
                    <span>
                      Reserved: <strong>{taken.toLocaleString()} {m.unit}</strong>
                    </span>
                    <span>
                      Left: <strong>{available.toLocaleString()} {m.unit}</strong>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : sent.length === 0 ? (
        <div className="dashboard-empty">
          You have not requested any materials yet.
        </div>
      ) : (
        <div className="dash-list">
          {sent.map((r) => (
            <div className="dash-card" key={r._id}>
              <div className="dash-card-top">
                <div>
                  <h3>{r.materialName}</h3>
                  <p className="dash-sub">Sent on {formatDate(r.createdAt)}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="dash-meta">
                <span>
                  Quantity: <strong>{r.quantity.toLocaleString()} {r.unit}</strong>
                </span>
                <span>
                  Company: <strong>{r.companyName}</strong>
                </span>
              </div>

              {r.message && <p className="dash-message">“{r.message}”</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard