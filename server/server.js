import './config/env'
import express from 'express'
import connectDB from './config/db'
import authRouter from './routes/api/auth'
import postsRouter from './routes/api/posts'
import usersRouter from './routes/api/users'
import profileRouter from './routes/api/profile'

const app = express()

// Connect database
connectDB()

// Init middleware
app.use(express.json({ extended: false }))

app.get('/', (req, res) => {
  res.send('api running')
})

// Define routes
app.use('/api/users', usersRouter)
app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/posts', postsRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
