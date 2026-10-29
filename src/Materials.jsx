import { useState } from 'react'
import './Materials.css'

const categories = ['All', 'Metal', 'Plastic', 'Rubber', 'Wood', 'Paper', 'Other']

const API_URL = 'http://localhost:5000/api/requests'

function getAvailable(material) {
  return Number(material.availableQuantity ?? material.quantity)
}

function Materials({
  materials = [],
  user = null,
  onRequireLogin = () => {},
  onRefresh = () => {},
}) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [requestError, setRequestError] = useState('')

  const [requestData, setRequestData] = useState({
    companyName: '',
    buyerName: '',
    email: '',
    quantity: '',
    message: '',
  })

  const filteredMaterials = materials.filter((material) => {
    const name = (material.name || '').toLowerCase()
    const location = (material.location || '').toLowerCase()

    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      location.includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' || material.category === category

    return matchesSearch && matchesCategory
  })

  const isOwnListing = (material) =>
    user && String(material.supplierId) === String(user.id)

  const isFulfilled = (material) =>
    material.status === 'Fulfilled' || getAvailable(material) <= 0

  const openRequestForm = () => {
    if (!user) {
      onRequireLogin()
      return
    }

    setRequestData({
      companyName: '',
      buyerName: user.name || '',
      email: user.email || '',
      quantity: '',
      message: '',
    })

    setRequestError('')
    setRequestSubmitted(false)
    setShowRequestForm(true)
  }

  const closeModal = () => {
    if (submitting) return

    setSelectedMaterial(null)
    setShowRequestForm(false)
    setRequestSubmitted(false)
    setRequestError('')
  }

  const handleRequestSubmit = async (event) => {
    event.preventDefault()

    if (!user) {
      onRequireLogin()
      return
    }

    if (!selectedMaterial) return

    const token = localStorage.getItem('reusehub_token')

    if (!token) {
      setRequestError('Please log in again before sending a request.')
      return
    }

    const requestedQuantity = Number(requestData.quantity)
    const availableQuantity = getAvailable(selectedMaterial)

    if (
      !Number.isFinite(requestedQuantity) ||
      requestedQuantity <= 0 ||
      requestedQuantity > availableQuantity
    ) {
      setRequestError(
        `Enter a valid quantity (maximum ${availableQuantity} ${selectedMaterial.unit}).`
      )
      return
    }

    setSubmitting(true)
    setRequestError('')

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          materialId: String(selectedMaterial.id),
          companyName: requestData.companyName.trim(),
          buyerName: requestData.buyerName.trim(),
          email: requestData.email.trim(),
          quantity: requestedQuantity,
          message: requestData.message.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit request.')
      }

      setRequestSubmitted(true)
      onRefresh()
    } catch (error) {
      setRequestError(
        error.message || 'Could not connect to the server. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  function ProgressBar({ material }) {
    const total = Number(material.quantity)
    const taken = total - getAvailable(material)
    const percent = total > 0 ? Math.min(100, (taken / total) * 100) : 0

    return (
      <div className="reserve-block">
        <div className="progress">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <small>
          {taken.toLocaleString()} / {total.toLocaleString()} {material.unit}{' '}
          already reserved
        </small>
      </div>
    )
  }

  return (
    <div className="materials-page">
      <div className="materials-header">
        <p className="eyebrow">REUSEHUB MARKETPLACE</p>

        <h1>Find Reusable Materials</h1>

        <p>
          Explore materials listed by suppliers. Request only the quantity you
          need, and other buyers can take the rest.
        </p>

        {user && <p className="demo-note">Signed in as {user.name}.</p>}
      </div>

      <div className="materials-search">
        <span>⌕</span>

        <input
          type="text"
          placeholder="Search materials or location..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {search && <button onClick={() => setSearch('')}>Clear</button>}
      </div>

      <div className="category-filters">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? 'active-filter' : ''}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="results-info">
        <h2>Available Materials</h2>
        <span>{filteredMaterials.length} listings</span>
      </div>

      {filteredMaterials.length > 0 ? (
        <div className="listing-grid">
          {filteredMaterials.map((material) => (
            <article
              className={`listing-card ${isFulfilled(material) ? 'fulfilled' : ''}`}
              key={material.id}
            >
              <div
                className={`listing-icon ${(material.category || 'other').toLowerCase()}`}
              >
                {material.icon || '♻'}
              </div>

              <div className="listing-category">
                {material.category}
                {isFulfilled(material) && (
                  <span className="fulfilled-badge">Fully reserved</span>
                )}
              </div>

              <h3>{material.name}</h3>

              <div className="listing-detail">
                <span>Available quantity</span>
                <strong>
                  {getAvailable(material).toLocaleString()} {material.unit}
                </strong>
              </div>

              <div className="listing-detail">
                <span>Condition</span>
                <strong>{material.condition}</strong>
              </div>

              <ProgressBar material={material} />

              <div className="listing-location">
                <span>⌖</span> {material.location}
              </div>

              <button
                className="view-details-btn"
                onClick={() => {
                  setSelectedMaterial(material)
                  setShowRequestForm(false)
                  setRequestSubmitted(false)
                  setRequestError('')
                }}
              >
                View Details ↗
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>⌕</span>
          <h3>No materials found</h3>
          <p>Try another search term or category.</p>

          <button
            className="view-details-btn"
            onClick={() => {
              setSearch('')
              setCategory('All')
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {selectedMaterial && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="material-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="Close modal"
            >
              ×
            </button>

            {!showRequestForm ? (
              <>
                <div
                  className={`listing-icon ${(selectedMaterial.category || 'other').toLowerCase()}`}
                >
                  {selectedMaterial.icon || '♻'}
                </div>

                <p className="eyebrow">MATERIAL DETAILS</p>
                <h2>{selectedMaterial.name}</h2>
                <p>{selectedMaterial.description}</p>

                <div className="modal-info">
                  <div>
                    <span>Category</span>
                    <strong>{selectedMaterial.category}</strong>
                  </div>

                  <div>
                    <span>Available</span>
                    <strong>
                      {getAvailable(selectedMaterial).toLocaleString()}{' '}
                      {selectedMaterial.unit}
                    </strong>
                  </div>

                  <div>
                    <span>Condition</span>
                    <strong>{selectedMaterial.condition}</strong>
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>{selectedMaterial.location}</strong>
                  </div>
                </div>

                <ProgressBar material={selectedMaterial} />

                <p className="demo-note">
                  Your request goes to the supplier&apos;s dashboard. Quantity
                  is reserved once the supplier accepts it.
                </p>

                <button
                  className="view-details-btn"
                  onClick={openRequestForm}
                  disabled={
                    isFulfilled(selectedMaterial) ||
                    isOwnListing(selectedMaterial)
                  }
                >
                  {isFulfilled(selectedMaterial)
                    ? 'Fully Reserved'
                    : isOwnListing(selectedMaterial)
                      ? 'This is your listing'
                      : 'Send Request ↗'}
                </button>
              </>
            ) : requestSubmitted ? (
              <div className="request-success">
                <div className="success-icon">✓</div>

                <h2>Request Submitted!</h2>

                <p>
                  Your request for {selectedMaterial.name} has been sent to the
                  supplier. You can track its status in your Dashboard.
                </p>

                <button className="view-details-btn" onClick={closeModal}>
                  Back to Materials
                </button>
              </div>
            ) : (
              <>
                <p className="eyebrow">MATERIAL REQUEST</p>
                <h2>Request {selectedMaterial.name}</h2>

                <form className="request-form" onSubmit={handleRequestSubmit}>
                  <label>
                    Company Name *
                    <input
                      name="companyName"
                      value={requestData.companyName}
                      onChange={(event) =>
                        setRequestData({
                          ...requestData,
                          companyName: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Contact Person *
                    <input
                      name="buyerName"
                      value={requestData.buyerName}
                      onChange={(event) =>
                        setRequestData({
                          ...requestData,
                          buyerName: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Email Address *
                    <input
                      type="email"
                      name="email"
                      value={requestData.email}
                      onChange={(event) =>
                        setRequestData({
                          ...requestData,
                          email: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Required Quantity ({selectedMaterial.unit}) * — max{' '}
                    {getAvailable(selectedMaterial)}
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      max={getAvailable(selectedMaterial)}
                      value={requestData.quantity}
                      onChange={(event) =>
                        setRequestData({
                          ...requestData,
                          quantity: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Message (Optional)
                    <textarea
                      name="message"
                      rows="3"
                      value={requestData.message}
                      onChange={(event) =>
                        setRequestData({
                          ...requestData,
                          message: event.target.value,
                        })
                      }
                      placeholder="Add your requirements..."
                    />
                  </label>

                  {requestError && (
                    <p role="alert" className="request-error">
                      {requestError}
                    </p>
                  )}

                  <button
                    className="view-details-btn"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request ↗'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Materials