import express from 'express'
import gravatar from 'gravatar'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { check, validationResult } from 'express-validator'
import User from '../../models/User'

const router = express.Router()

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
  check('name', 'name is required').not().isEmpty(),
  check('email', 'please include a valid email').isEmail(),
  check('password', 'please enter password with 6 or more characters').isLength({
    min: 6
  })
],
async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { name, email, password } = req.body

  try {
    let user = await User.findOne({ email })

    if (user) {
      return res.status(400).json({
        errors: [{
          msg: 'User already exists'
        }]
      })
    }

    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })

    user = new User({
      name,
      email,
      avatar,
      password
    })

    const salt = await bcrypt.genSalt(10)

    user.password = await bcrypt.hash(password, salt)

    await user.save()

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

export default router
