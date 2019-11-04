import express from 'express'
import auth from '~/server/middleware/auth'
import User from '~/server/models/User'
import Post from '~/server/models/Post'
import { check, validationResult } from 'express-validator'

const router = express.Router()

// @route   POST api/posts
// @desc    Create a post
// @access  Private

router.post('/', [
  auth,
  [
    check('text').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const user = await User.findById(req.user.id).select('-password')

    const newPost = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    }

    const post = new Post(newPost)

    await post.save()

    res.json(post)
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Server error')
  }
})

// @route   GET api/posts
// @desc    Get all posts
// @access  Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 })
    res.json(posts)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    res.json(post)
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Post not found' })
    }

    console.error(error.message)
    res.status(500).send('Server error')
  }
})

// @route   DELETE api/posts/:id
// @desc    Delete post by ID
// @access  Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized ' })
    }

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    await post.remove()

    res.json({ msg: 'Post removed' })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Post not found' })
    }

    console.error(error.message)
    res.status(500).send('Server error')
  }
})

export default router
