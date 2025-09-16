const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')
const radioRouter = require('./controllers/radio')
const morgan = require('morgan')
const logger = require('./utils/logger')
const cors = require('cors')

// const questionsRouter = require('./controllers/questions')
// const submissionsRouter = require('./controllers/submissions')

const { MONGODB_URI } = config

const app = express()

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    logger.info('connected to MongoDB')
  } catch (error) {
    logger.error('error connecting to MongoDB:', error.message)
  }
}

connectToMongoDB()

app.use(express.json())
app.use(middleware.tokenExtractor)
app.use(morgan('tiny'))

//* Routes here
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/radio', radioRouter)
// app.use('/api/questions', questionsRouter)
// app.use('/api/submissions', submissionsRouter)

app.use(middleware.errorHandler)
app.use(middleware.unknownEndpoint)

module.exports = app