const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    // Total quantity the supplier listed
    quantity: { type: Number, required: true, min: 1 },
    // Quantity still left after accepted requests
    availableQuantity: { type: Number, min: 0 },
    unit: { type: String, required: true, trim: true },
    condition: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    icon: { type: String, default: '♻' },
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Fulfilled'],
      default: 'Available',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Material', materialSchema)