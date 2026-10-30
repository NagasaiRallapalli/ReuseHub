import { useState } from 'react'
import './Materials.css'

const categories = ['All', 'Metal', 'Plastic', 'Rubber', 'Wood', 'Paper', 'Other']

const API_URL = 'http://localhost:5000/api/requests'

function getAvailable(material) {
  return Number(material.availableQuantity ?? material.quantity)
}

function getPrice(material) {
  const price = material.pricePerUnit

  if (price == null || price === '') return null

  const numericPrice = Number(price)
  return Number.isFinite(numericPrice) && numericPrice > 0
    ? numericPrice
    : null
}

function formatPricePerUnit(material) {
  const price = getPrice(material)

  if (price == null) return 'Price not available'

  return `₹${price.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })} / ${material.unit || 'unit'}`
}

function Materials({
  materials = [],
  user = null,
  onRequireLogin = () => {},
  onRefresh = () => {},
}) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortOrder, setSortOrder] = useState('default')
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showPriceForm, setShowPriceForm] = useState(false)
  const [priceInput, setPriceInput] = useState('')
  const [priceError, setPriceError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState('')
  const [deleting, setDeleting] = useState(false)
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

  const pricedMaterialCount = filteredMaterials.filter(
    (material) => getPrice(material) != null
  ).length

  const sortedMaterials = [...filteredMaterials]

  if (sortOrder !== 'default') {
    sortedMaterials.sort((first, second) => {
      const firstPrice = getPrice(first)
      const secondPrice = getPrice(second)

      if (firstPrice == null) return secondPrice == null ? 0 : 1
      if (secondPrice == null) return -1

      return sortOrder === 'price-ascending'
        ? firstPrice - secondPrice
        : secondPrice - firstPrice
    })
  }

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
    if (submitting || deleting) return

    setSelectedMaterial(null)
    setShowRequestForm(false)
    setShowPriceForm(false)
    setRequestSubmitted(false)
    setRequestError('')
    setPriceError('')
    setDeleteError('')
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

  const handlePriceUpdate = async (event) => {
    event.preventDefault()

    if (!selectedMaterial || !isOwnListing(selectedMaterial)) return

    const token = localStorage.getItem('reusehub_token')
    const price = Number(priceInput)

    if (!token) {
      setPriceError('Please log in again before updating this listing.')
      return
    }

    if (!Number.isFinite(price) || price <= 0) {
      setPriceError('Enter a price greater than zero.')
      return
    }

    setSubmitting(true)
    setPriceError('')

    try {
      const response = await fetch(
        `http://localhost:5000/api/materials/${encodeURIComponent(selectedMaterial.id)}/price`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pricePerUnit: price }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update listing price.')
      }

      setSelectedMaterial((current) => ({
        ...current,
        pricePerUnit: data.material.pricePerUnit,
      }))
      setShowPriceForm(false)
      onRefresh()
    } catch (error) {
      setPriceError(error.message || 'Could not update the listing price.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteListing = async () => {
    if (!selectedMaterial || !isOwnListing(selectedMaterial)) return

    const confirmed = window.confirm(
      `Delete your "${selectedMaterial.name}" listing? This cannot be undone.`
    )

    if (!confirmed) return

    const token = localStorage.getItem('reusehub_token')

    if (!token) {
      setDeleteError('Please log in again before deleting this listing.')
      return
    }

    setDeleting(true)
    setDeleteError('')

    try {
      const response = await fetch(
        `http://localhost:5000/api/materials/${encodeURIComponent(selectedMaterial.id)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await response.json()
        : null

      if (!response.ok) {
        throw new Error(
          data?.message ||
            (response.status === 404
              ? 'The delete API is not active. Restart the backend and try again.'
              : 'The server returned an unexpected response. Please restart the backend and try again.')
        )
      }

      if (!data) {
        throw new Error('The server returned an unexpected response. Please try again.')
      }

      setDeleteSuccess(`${selectedMaterial.name} listing deleted.`)
      setSelectedMaterial(null)
      setShowRequestForm(false)
      setShowPriceForm(false)
      onRefresh()
    } catch (error) {
      setDeleteError(error.message || 'Could not delete the listing.')
    } finally {
      setDeleting(false)
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
        {sortOrder !== 'default' && pricedMaterialCount === 0 && (
          <p className="price-sort-status" role="status">
            These listings have no prices to compare. Ask suppliers to update
            their listing prices.
          </p>
        )}
        <label className="price-sort">
          <span>Sort by</span>
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            aria-label="Sort materials by price"
          >
            <option value="default">Default Sorting</option>
            <option value="price-ascending">Price: Low to High</option>
            <option value="price-descending">Price: High to Low</option>
          </select>
        </label>
      </div>

      {deleteSuccess && (
        <p className="listing-delete-success" role="status">
          {deleteSuccess}
        </p>
      )}

      {sortedMaterials.length > 0 ? (
        <div className="listing-grid">
          {sortedMaterials.map((material) => (
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

              <div className="listing-price">
                {formatPricePerUnit(material)}
              </div>

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

            {!showRequestForm && !showPriceForm ? (
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
                    <span>Price per unit</span>
                    <strong>{formatPricePerUnit(selectedMaterial)}</strong>
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

                {isOwnListing(selectedMaterial) && (
                  <>
                    <button
                      className="secondary-btn price-edit-btn"
                      onClick={() => {
                        setPriceInput(
                          getPrice(selectedMaterial)?.toString() || ''
                        )
                        setPriceError('')
                        setShowPriceForm(true)
                      }}
                    >
                      Update Listing Price
                    </button>
                    <button
                      className="delete-listing-btn"
                      onClick={handleDeleteListing}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete Listing'}
                    </button>
                    {deleteError && (
                      <p className="request-error" role="alert">
                        {deleteError}
                      </p>
                    )}
                  </>
                )}

                {!getPrice(selectedMaterial) &&
                  !isOwnListing(selectedMaterial) && (
                    <p className="price-unavailable-note">
                      This older listing has no price yet. Please contact the
                      supplier to confirm the price.
                    </p>
                  )}

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
            ) : showPriceForm ? (
              <>
                <p className="eyebrow">SUPPLIER PORTAL</p>
                <h2>Update {selectedMaterial.name} price</h2>
                <p className="price-form-unit">
                  Enter the price per {selectedMaterial.unit}.
                </p>

                <form className="request-form" onSubmit={handlePriceUpdate}>
                  <label>
                    Price per {selectedMaterial.unit} (₹) *
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={priceInput}
                      onChange={(event) => setPriceInput(event.target.value)}
                      placeholder="e.g. 80"
                      required
                    />
                  </label>

                  {priceError && (
                    <p className="request-error" role="alert">
                      {priceError}
                    </p>
                  )}

                  <button
                    className="view-details-btn"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Price'}
                  </button>
                  <button
                    className="secondary-btn price-cancel-btn"
                    type="button"
                    onClick={() => setShowPriceForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </form>
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