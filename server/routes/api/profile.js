import express from 'express'
import auth from '~/server/middleware/auth'
import Profile from '~/server/models/Profile'
import { check, validationResult } from 'express-validator'

const router = express.Router()

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
    if (!profile) {
      return res.status(400).json('There is no profile for this user')
    }

    res.json(profile)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

const setField = (object, key, val) => {
  if (val) {
    object[key] = val
  }
}

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private

router.post('/', [
  auth,
  [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  } = req.body

  // Build profile fields

  const profileFields = {}

  profileFields.user = req.user.id
  profileFields.skills = skills.split(',').map(skill => skill.trim())

  setField(profileFields, 'company', company)
  setField(profileFields, 'website', website)
  setField(profileFields, 'location', location)
  setField(profileFields, 'bio', bio)
  setField(profileFields, 'status', status)
  setField(profileFields, 'githubusername', githubusername)

  // Build social object
  const social = {}

  setField(social, 'twitter', twitter)
  setField(social, 'facebook', facebook)
  setField(social, 'youtube', youtube)
  setField(social, 'instagram', instagram)
  setField(social, 'linkedin', linkedin)

  profileFields.social = social

  try {
    let profile = await Profile.findOne({ user: req.user.id })

    // Update if found
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      )

      return res.json(profile)
    }

    // Create otherwise

    profile = new Profile(profileFields)

    await profile.save()
    res.json(profile)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
  res.send('yeet')
})

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' })
    }
    res.json(profile)
  } catch (error) {
    console.error(error.message)
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' })
    }
    res.status(500).send('Server error')
  }
})

export default router
