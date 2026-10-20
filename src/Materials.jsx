
import { useState } from 'react'
import './Materials.css'

const materials = [
  {
    id: 1,
    name: 'Aluminium Scrap',
    category: 'Metal',
    quantity: 1000,
    unit: 'kg',
    condition: 'Good',
    location: 'Vijayawada, AP',
    price: 'Contact supplier',
    description:
      'Reusable aluminium scrap suitable for further industrial processing.',
    icon: '⚙',
  },
  {
    id: 2,
    name: 'Recycled Plastic',
    category: 'Plastic',
    quantity: 500,
    unit: 'kg',
    condition: 'Processed',
    location: 'Guntur, AP',
    price: 'Contact supplier',
    description:
      'Recycled plastic material available for suitable manufacturing needs.',
    icon: '◈',
  },
  {
    id: 3,
    name: 'Rubber Waste',
    category: 'Rubber',
    quantity: 750,
    unit: 'kg',
    condition: 'Reusable',
    location: 'Eluru, AP',
    price: 'Contact supplier',
    description:
      'Industrial rubber leftovers that may be reused after inspection.',
    icon: '◉',
  },
  {
    id: 4,
    name: 'Wood Offcuts',
    category: 'Wood',
    quantity: 300,
    unit: 'kg',
    condition: 'Good',
    location: 'Rajahmundry, AP',
    price: 'Contact supplier',
    description:
      'Wood offcuts suitable for reuse in appropriate applications.',
    icon: '▤',
  },
  {
    id: 5,
    name: 'Steel Scrap',
    category: 'Metal',
    quantity: 1200,
    unit: 'kg',
    condition: 'Mixed',
    location: 'Hyderabad, Telangana',
    price: 'Contact supplier',
    description:
      'Mixed steel scrap for buyers seeking reusable metal materials.',
    icon: '⚙',
  },
  {
    id: 6,
    name: 'Plastic Granules',
    category: 'Plastic',
    quantity: 400,
    unit: 'kg',
    condition: 'Processed',
    location: 'Vijayawada, AP',
    price: 'Contact supplier',
    description:
      'Processed plastic granules for potential industrial reuse.',
    icon: '◈',
  },
]

const categories = ['All', 'Metal', 'Plastic', 'Rubber', 'Wood']

function Materials() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(search.toLowerCase()) ||
      material.location.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' || material.category === category

    return matchesSearch && matchesCategory
  })

  const openRequestForm = (material = null) => {
    setSelectedMaterial(material)
    setRequestSubmitted(false)
    setShowRequestForm(true)
  }

  const closeRequestForm = () => {
    setShowRequestForm(false)
    setSelectedMaterial(null)
    setRequestSubmitted(false)
  }

  return (
    <div className="materials-page">
      <div className="materials-header">
        <p className="eyebrow">REUSEHUB MARKETPLACE</p>
        <h1>Find Reusable Materials</h1>
        <p>
          Discover industrial materials that could become valuable
          resources for your business.
        </p>
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
          <button onClick={() => setSearch('')}>Clear</button>
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
                className={`listing-icon ${material.category.toLowerCase()}`}
              >
                {material.icon}
              </div>

              <div className="listing-category">
                {material.category}
              </div>

              <h3>{material.name}</h3>

              <div className="listing-detail">
                <span>Available quantity</span>
                <strong>
                  {material.quantity.toLocaleString()} {material.unit}
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
                onClick={() => setSelectedMaterial(material)}
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
          <p>Try another search term or select a different category.</p>

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

      {/* Material Details Modal */}
      {selectedMaterial && !showRequestForm && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedMaterial(null)}
        >
          <div
            className="material-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="material-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedMaterial(null)}
              aria-label="Close details"
            >
              ×
            </button>

            <div
              className={`listing-icon ${selectedMaterial.category.toLowerCase()}`}
            >
              {selectedMaterial.icon}
            </div>

            <p className="eyebrow">MATERIAL DETAILS</p>
            <h2 id="material-modal-title">
              {selectedMaterial.name}
            </h2>
            <p>{selectedMaterial.description}</p>

            <div className="modal-info">
              <div>
                <span>Category</span>
                <strong>{selectedMaterial.category}</strong>
              </div>

              <div>
                <span>Quantity</span>
                <strong>
                  {selectedMaterial.quantity} {selectedMaterial.unit}
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
              Demo listing — supplier contact is not connected yet.
            </p>

            <button
              className="view-details-btn"
              onClick={() => openRequestForm(selectedMaterial)}
            >
              Send Request ↗
            </button>
          </div>
        </div>
      )}

      {/* Send Request Form Modal */}
      {showRequestForm && (
        <div
          className="modal-overlay"
          onClick={closeRequestForm}
        >
          <div
            className="material-modal request-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={closeRequestForm}
              aria-label="Close request form"
            >
              ×
            </button>

            {!requestSubmitted ? (
              <>
                <p className="eyebrow">BUYER REQUEST</p>
                <h2 id="request-title">Request a Material</h2>
                <p>
                  Enter your details to express interest in this listing.
                </p>

                <form
                  className="request-form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    setRequestSubmitted(true)
                  }}
                >
                  <label htmlFor="request-material">Material</label>
                  <input
                    id="request-material"
                    name="material"
                    value={
                      selectedMaterial?.name ||
                      'General material enquiry'
                    }
                    readOnly
                  />

                  <label htmlFor="company-name">Company name</label>
                  <input
                    id="company-name"
                    name="company"
                    placeholder="Enter your company name"
                    required
                  />

                  <label htmlFor="buyer-name">Your name</label>
                  <input
                    id="buyer-name"
                    name="buyer"
                    placeholder="Enter your name"
                    required
                  />

                  <label htmlFor="buyer-email">Email address</label>
                  <input
                    id="buyer-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />

                  <label htmlFor="request-quantity">
                    Required quantity (kg)
                  </label>
                  <input
                    id="request-quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max={selectedMaterial?.quantity}
                    placeholder="Enter quantity"
                    required
                  />

                  <label htmlFor="request-message">
                    Message (optional)
                  </label>
                  <textarea
                    id="request-message"
                    name="message"
                    placeholder="Tell the supplier what you need..."
                    rows="3"
                  />

                  <button
                    className="view-details-btn"
                    type="submit"
                  >
                    Submit Request ↗
                  </button>
                </form>
              </>
            ) : (
              <div className="request-success">
                <div className="success-icon">✓</div>
                <h2>Request Submitted!</h2>
                <p>
                  Your demo request has been submitted successfully.
                  No supplier has been contacted, and the request is
                  not saved permanently.
                </p>
                <button
                  className="view-details-btn"
                  onClick={closeRequestForm}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Materials
