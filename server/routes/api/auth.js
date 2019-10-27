import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { check, validationResult } from 'express-validator'
import User from '../../models/User'
import auth from '../../middleware/auth'

const router = express.Router()

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post('/', [
  check('email', 'please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
],
async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        errors: [{
          msg: 'Invalid credentials'
        }]
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({
        errors: [{
          msg: 'Invalid credentials'
        }]
      })
    }

    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (error, token) => {
      if (error) {
        throw error
      } else {
        res.json({ token })
      }
    })
  } catch (error) {
    console.error(error.message)
    res.send(500).send('server error')
  }
})

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')

    res.json(user)
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Server error')
  }
})

export default router
