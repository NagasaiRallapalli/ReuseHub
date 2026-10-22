import { useState } from 'react'
import './Materials.css'

const categories = [
  'All',
  'Metal',
  'Plastic',
  'Rubber',
  'Wood',
  'Paper',
  'Other',
]

function Materials({
  materials = [],
  user = null,
  onRequireLogin = () => {},
}) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)

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

  const openRequestForm = () => {
    if (!user) {
      onRequireLogin()
      return
    }

    if (user.role !== 'buyer') {
      alert(
        'Only Buyer accounts can send material requests. Please log in with a Buyer account.'
      )
      return
    }

    setRequestData({
      companyName: '',
      buyerName: user.name || '',
      email: user.email || '',
      quantity: '',
      message: '',
    })

    setRequestSubmitted(false)
    setShowRequestForm(true)
  }

  const closeModal = () => {
    setSelectedMaterial(null)
    setShowRequestForm(false)
    setRequestSubmitted(false)
  }

  const handleRequestSubmit = (event) => {
    event.preventDefault()

    if (!user || user.role !== 'buyer') {
      alert('Please log in with a Buyer account to submit a request.')
      setShowRequestForm(false)
      return
    }

    const requestedQuantity = Number(requestData.quantity)
    const availableQuantity = Number(selectedMaterial.quantity)

    if (
      !Number.isFinite(requestedQuantity) ||
      requestedQuantity <= 0 ||
      requestedQuantity > availableQuantity
    ) {
      alert('Please enter a valid quantity within the available amount.')
      return
    }

    setRequestSubmitted(true)
  }

  return (
    <div className="materials-page">
      <div className="materials-header">
        <p className="eyebrow">REUSEHUB MARKETPLACE</p>

        <h1>Find Reusable Materials</h1>

        <p>
          Explore materials listed by suppliers and find resources
          for your business.
        </p>

        {user && (
          <p className="demo-note">
            Signed in as {user.name} ({user.role}).
          </p>
        )}
      </div>

      <div className="materials-search">
        <span>⌕</span>

        <input
          type="text"
          placeholder="Search materials or location..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {search && (
          <button onClick={() => setSearch('')}>
            Clear
          </button>
        )}
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
            <article className="listing-card" key={material.id}>
              <div
                className={`listing-icon ${(material.category || 'other').toLowerCase()}`}
              >
                {material.icon || '♻'}
              </div>

              <div className="listing-category">
                {material.category}
              </div>

              <h3>{material.name}</h3>

              <div className="listing-detail">
                <span>Available quantity</span>

                <strong>
                  {Number(material.quantity).toLocaleString()}{' '}
                  {material.unit}
                </strong>
              </div>

              <div className="listing-detail">
                <span>Condition</span>
                <strong>{material.condition}</strong>
              </div>

              <div className="listing-location">
                <span>⌖</span> {material.location}
              </div>

              <button
                className="view-details-btn"
                onClick={() => {
                  setSelectedMaterial(material)
                  setShowRequestForm(false)
                  setRequestSubmitted(false)
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
                    <span>Quantity</span>
                    <strong>
                      {selectedMaterial.quantity}{' '}
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

                <p className="demo-note">
                  Sample listing for demonstration. Supplier contact
                  is not connected yet.
                </p>

                <button
                  className="view-details-btn"
                  onClick={openRequestForm}
                >
                  Send Request ↗
                </button>
              </>
            ) : requestSubmitted ? (
              <div className="request-success">
                <div className="success-icon">✓</div>

                <h2>Request Submitted!</h2>

                <p>
                  Your request for {selectedMaterial.name} has been
                  submitted in this demo. It is not stored permanently
                  and the supplier has not been notified.
                </p>

                <button
                  className="view-details-btn"
                  onClick={closeModal}
                >
                  Back to Materials
                </button>
              </div>
            ) : (
              <>
                <p className="eyebrow">BUYER REQUEST</p>

                <h2>Request {selectedMaterial.name}</h2>

                <form
                  className="request-form"
                  onSubmit={handleRequestSubmit}
                >
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
                    Required Quantity ({selectedMaterial.unit}) *
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      max={selectedMaterial.quantity}
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

                  <button
                    className="view-details-btn"
                    type="submit"
                  >
                    Submit Request ↗
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