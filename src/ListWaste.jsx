
import { useState } from 'react'
import './ListWaste.css'

function ListWaste({ onAddMaterial }) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    materialName: '',
    category: '',
    quantity: '',
    unit: 'kg',
    condition: '',
    location: '',
    description: '',
  })

  const [submitted, setSubmitted] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const newMaterial = {
      id: Date.now(),
      name: formData.materialName.trim(),
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      condition: formData.condition,
      location: formData.location.trim(),
      price: 'Contact supplier',
      description: formData.description.trim() ||
        'Reusable industrial material listed by a supplier.',
      icon:
        formData.category === 'Metal' ? '⚙' :
        formData.category === 'Plastic' ? '◈' :
        formData.category === 'Rubber' ? '◉' :
        formData.category === 'Wood' ? '▤' : '♻',
      supplier: {
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
      },
    }

    onAddMaterial(newMaterial)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="list-waste-page">
        <div className="listing-success">
          <div className="success-icon">✓</div>
          <h2>Listing Added Successfully!</h2>
          <p>
            Your material has been added to the current ReuseHub
            session. Buyers can now find it on the Materials page.
          </p>
          <p className="listing-note">
            Demo only: the listing is not stored permanently and
            will be lost if the page is refreshed.
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

        <div className="listing-grid">
          <div className="listing-field">
            <label>Company Name *</label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="listing-field">
            <label>Contact Person *</label>
            <input
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Enter contact person"
              required
            />
          </div>

          <div className="listing-field">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="company@example.com"
              required
            />
          </div>

          <div className="listing-field">
            <label>Material Name *</label>
            <input
              name="materialName"
              value={formData.materialName}
              onChange={handleChange}
              placeholder="e.g. Aluminium Scrap"
              required
            />
          </div>

          <div className="listing-field">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
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
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                placeholder="Enter quantity"
                required
              />

              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="kg">Kg</option>
                <option value="tonnes">Tonnes</option>
                <option value="pieces">Pieces</option>
                <option value="litres">Litres</option>
              </select>
            </div>
          </div>

          <div className="listing-field">
            <label>Material Condition *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
            >
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
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
              required
            />
          </div>
        </div>

        <div className="listing-field description-field">
          <label>Material Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the material and its condition..."
            rows="4"
          />
        </div>

        <button className="listing-submit" type="submit">
          Publish Material Listing ↗
        </button>

        <p className="listing-note">
          * Required fields. This frontend demo adds the listing to
          the current session only.
        </p>
      </form>
    </div>
  )
}

export default ListWaste
