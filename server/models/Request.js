const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema(
  {
    materialId: { type: String, required: true },
    materialName: { type: String, required: true, trim: true },
    unit: { type: String, default: 'kg', trim: true },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyName: { type: String, required: true, trim: true },
    buyerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    message: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Request', requestSchema)