import { useState } from 'react'
import './ListWaste.css'

const API_URL = 'http://localhost:5000/api/materials'

function ListWaste({ onAddMaterial }) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    materialName: '',
    category: '',
    quantity: '',
    pricePerUnit: '',
    unit: 'kg',
    condition: '',
    location: '',
    description: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const token = localStorage.getItem('reusehub_token')

    if (!token) {
      setError('Please log in again before publishing a listing.')
      setSubmitting(false)
      return
    }

    const icon =
      formData.category === 'Metal' ? '⚙' :
      formData.category === 'Plastic' ? '◈' :
      formData.category === 'Rubber' ? '◉' :
      formData.category === 'Wood' ? '▤' : '♻'

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.materialName.trim(),
          category: formData.category,
          quantity: Number(formData.quantity),
          pricePerUnit: Number(formData.pricePerUnit),
          unit: formData.unit,
          condition: formData.condition,
          location: formData.location.trim(),
          description: formData.description.trim(),
          icon,
          companyName: formData.companyName.trim(),
          contactPerson: formData.contactPerson.trim(),
          email: formData.email.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to publish listing.')
      }

      if (onAddMaterial) {
        onAddMaterial(data.material)
      }

      setSubmitted(true)
    } catch (err) {
      setError(
        err.message || 'Could not connect to the server. Try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="list-waste-page">
        <div className="listing-success">
          <div className="success-icon">✓</div>
          <h2>Listing Published Successfully!</h2>
          <p>Your material has been saved to the ReuseHub database.</p>
          <p className="listing-note">
            Your listing should remain available after a page refresh.
          </p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="list-waste-page">
      <div className="listing-header">
        <span className="listing-tag">SUPPLIER PORTAL</span>
        <h1>List Your Waste</h1>
        <p>
          Share your available industrial materials with businesses
          that can reuse them.
        </p>
      </div>

      <form className="listing-form" onSubmit={handleSubmit}>
        <h2>Company Details</h2>

        <div className="listing-form-grid">
          <div className="listing-field">
            <label>Company Name *</label>
            <input name="companyName" value={formData.companyName}
              onChange={handleChange} required />
          </div>

          <div className="listing-field">
            <label>Contact Person *</label>
            <input name="contactPerson" value={formData.contactPerson}
              onChange={handleChange} required />
          </div>

          <div className="listing-field">
            <label>Email Address *</label>
            <input type="email" name="email" value={formData.email}
              onChange={handleChange} required />
          </div>

          <div className="listing-field">
            <label>Material Name *</label>
            <input name="materialName" value={formData.materialName}
              onChange={handleChange} required />
          </div>

          <div className="listing-field">
            <label>Category *</label>
            <select name="category" value={formData.category}
              onChange={handleChange} required>
              <option value="">Select category</option>
              <option value="Metal">Metal</option>
              <option value="Plastic">Plastic</option>
              <option value="Rubber">Rubber</option>
              <option value="Wood">Wood</option>
              <option value="Paper">Paper</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="listing-field">
            <label>Quantity *</label>
            <div className="quantity-field">
              <input type="number" name="quantity" value={formData.quantity}
                onChange={handleChange} min="1" required />
              <select name="unit" value={formData.unit} onChange={handleChange}>
                <option value="kg">Kg</option>
                <option value="tonnes">Tonnes</option>
                <option value="pieces">Pieces</option>
                <option value="litres">Litres</option>
              </select>
            </div>
          </div>

          <div className="listing-field">
            <label htmlFor="pricePerUnit">
              Price per {formData.unit} (₹) *
            </label>
            <input
              id="pricePerUnit"
              type="number"
              name="pricePerUnit"
              value={formData.pricePerUnit}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="e.g. 80"
              required
            />
          </div>

          <div className="listing-field">
            <label>Material Condition *</label>
            <select name="condition" value={formData.condition}
              onChange={handleChange} required>
              <option value="">Select condition</option>
              <option value="Unused">New / Unused</option>
              <option value="Good">Good</option>
              <option value="Used">Used</option>
              <option value="Recyclable">Recyclable</option>
              <option value="Processed">Processed</option>
            </select>
          </div>

          <div className="listing-field">
            <label>Location *</label>
            <input name="location" value={formData.location}
              onChange={handleChange} required />
          </div>
        </div>

        <div className="listing-field description-field">
          <label>Material Description</label>
          <textarea name="description" value={formData.description}
            onChange={handleChange} rows="4" />
        </div>

        {error && <p className="request-error" role="alert">{error}</p>}

        <button className="listing-submit" type="submit" disabled={submitting}>
          {submitting ? 'Publishing...' : 'Publish Material Listing ↗'}
        </button>

        <p className="listing-note">* Required fields.</p>
      </form>
    </div>
  )
}

export default ListWaste