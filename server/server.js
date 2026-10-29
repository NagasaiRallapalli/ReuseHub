const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const dns = require('dns')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('./models/User')
const Request = require('./models/Request')
const Material = require('./models/Material')

dotenv.config()

// DNS configuration for MongoDB connections
dns.setServers(['8.8.8.8', '8.8.4.4'])

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('ReuseHub Backend is running!')
})

// ---------- Auth middleware ----------
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Please log in first.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token. Please log in again.',
    })
  }
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' })
}

// ---------- Auth ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' })
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters.' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Every user can both list and request materials.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'buyer',
    })

    return res.status(201).json({
      message: 'Registration successful.',
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Registration error:', error.message)

    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered.' })
    }

    return res
      .status(500)
      .json({ message: 'Server error during registration.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    return res.json({
      message: 'Login successful.',
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error.message)
    return res.status(500).json({ message: 'Server error during login.' })
  }
})

// ---------- Materials ----------
app.get('/api/materials', async (req, res) => {
  try {
    const materials = await Material.find().sort({ createdAt: -1 }).lean()
    return res.json({ materials })
  } catch (error) {
    console.error('Fetch materials error:', error.message)
    return res.status(500).json({ message: 'Unable to fetch materials.' })
  }
})

app.post('/api/materials', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      condition: materialCondition,
      location,
      description,
      icon,
      companyName,
      contactPerson,
      email,
    } = req.body

    if (
      !name?.trim() ||
      !category?.trim() ||
      !Number.isFinite(Number(quantity)) ||
      Number(quantity) <= 0 ||
      !unit?.trim() ||
      !materialCondition?.trim() ||
      !location?.trim() ||
      !companyName?.trim() ||
      !contactPerson?.trim() ||
      !email?.trim()
    ) {
      return res.status(400).json({
        message: 'Please fill in all required fields correctly.',
      })
    }

    const material = await Material.create({
      name: name.trim(),
      category: category.trim(),
      quantity: Number(quantity),
      availableQuantity: Number(quantity),
      unit: unit.trim(),
      condition: materialCondition.trim(),
      location: location.trim(),
      description: description?.trim() || '',
      icon: icon || '♻',
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim().toLowerCase(),
      supplierId: req.userId,
    })

    return res.status(201).json({
      message: 'Material listing saved successfully.',
      material,
    })
  } catch (error) {
    console.error('Create material error:', error.message)
    return res.status(500).json({ message: 'Unable to save material listing.' })
  }
})

// ---------- Requests ----------
app.post('/api/requests', authenticateToken, async (req, res) => {
  try {
    const { materialId, companyName, buyerName, email, quantity, message } =
      req.body

    if (
      !materialId ||
      !mongoose.isValidObjectId(materialId) ||
      !companyName?.trim() ||
      !buyerName?.trim() ||
      !email?.trim() ||
      !Number.isFinite(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return res
        .status(400)
        .json({ message: 'Please provide valid request details.' })
    }

    const material = await Material.findById(materialId)

    if (!material) {
      return res.status(404).json({ message: 'Material listing not found.' })
    }

    if (String(material.supplierId) === String(req.userId)) {
      return res
        .status(400)
        .json({ message: 'You cannot request your own listing.' })
    }

    const available = material.availableQuantity ?? material.quantity

    if (material.status === 'Fulfilled' || available <= 0) {
      return res
        .status(400)
        .json({ message: 'This material is already fully reserved.' })
    }

    if (Number(quantity) > available) {
      return res.status(400).json({
        message: `Requested quantity exceeds available quantity (${available} ${material.unit}).`,
      })
    }

    const request = await Request.create({
      materialId: String(material._id),
      materialName: material.name,
      unit: material.unit,
      supplierId: material.supplierId,
      buyerId: req.userId,
      companyName: companyName.trim(),
      buyerName: buyerName.trim(),
      email: email.trim().toLowerCase(),
      quantity: Number(quantity),
      message: message?.trim() || '',
    })

    return res.status(201).json({
      message: 'Request submitted successfully.',
      request: {
        id: request._id,
        materialName: request.materialName,
        status: request.status,
        createdAt: request.createdAt,
      },
    })
  } catch (error) {
    console.error('Request creation error:', error.message)
    return res.status(500).json({ message: 'Unable to submit request.' })
  }
})

app.get('/api/requests/received', authenticateToken, async (req, res) => {
  try {
    const requests = await Request.find({ supplierId: req.userId })
      .sort({ createdAt: -1 })
      .lean()
    return res.json({ requests })
  } catch (error) {
    console.error('Fetch received requests error:', error.message)
    return res
      .status(500)
      .json({ message: 'Unable to fetch received requests.' })
  }
})

app.get('/api/requests/sent', authenticateToken, async (req, res) => {
  try {
    const requests = await Request.find({ buyerId: req.userId })
      .sort({ createdAt: -1 })
      .lean()
    return res.json({ requests })
  } catch (error) {
    console.error('Fetch sent requests error:', error.message)
    return res.status(500).json({ message: 'Unable to fetch sent requests.' })
  }
})

// Accept / reject. Accepting reduces the material's availableQuantity atomically.
app.patch('/api/requests/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res
        .status(400)
        .json({ message: 'Status must be Accepted or Rejected.' })
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid request id.' })
    }

    const request = await Request.findOne({
      _id: req.params.id,
      supplierId: req.userId,
    })

    if (!request) {
      return res
        .status(404)
        .json({ message: 'Request not found for your listings.' })
    }

    if (request.status !== 'Pending') {
      return res
        .status(400)
        .json({ message: 'This request is already processed.' })
    }

    if (status === 'Accepted') {
      // Atomic: only decrements if enough quantity is still left.
      const updated = await Material.findOneAndUpdate(
        {
          _id: request.materialId,
          availableQuantity: { $gte: request.quantity },
        },
        { $inc: { availableQuantity: -request.quantity } },
        { new: true }
      )

      if (!updated) {
        return res.status(400).json({
          message: 'Not enough quantity left for this request.',
        })
      }

      if (updated.availableQuantity === 0) {
        updated.status = 'Fulfilled'
        await updated.save()
      }
    }

    request.status = status
    await request.save()

    return res.json({
      message: `Request ${status.toLowerCase()} successfully.`,
      request,
    })
  } catch (error) {
    console.error('Update request status error:', error.message)
    return res.status(500).json({ message: 'Unable to update request status.' })
  }
})

// ---------- Start ----------
async function startServer() {
  try {
    if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
      throw new Error('MONGODB_URI and JWT_SECRET must be set in .env')
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected successfully!')

    // One-time migration: old listings without availableQuantity
    await Material.updateMany({ availableQuantity: { $exists: false } }, [
      { $set: { availableQuantity: '$quantity' } },
    ])

    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`ReuseHub server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

startServer()