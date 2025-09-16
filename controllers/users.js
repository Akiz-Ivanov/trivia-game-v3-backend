const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const { validateUserInput } = require('../utils/validation');
const { userExtractor } = require('../utils/middleware');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
    // .populate('userStats')
  response.json(users.map(user => user.toJSON()))
})

usersRouter.post('/', async (request, response) => {
  let { username, email, password } = request.body

  username = username?.trim().toLowerCase()
  email = email?.trim().toLowerCase()
  password = password?.trim()

  const error = validateUserInput(username, email, password)
  if (error) {
    return response.status(400).json({ error })
  }
  
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  
  const user = new User({
    username,
    email,
    passwordHash
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.delete('/:id', userExtractor, async (request, response) => {
  const currentUser = request.user
  const userIdToDelete = request.params.id

  const user = await User.findById(userIdToDelete)
  
  if (!user) {
    return response.status(404).json({ error: 'User not found' })
  }

  if (user._id.toString() !== currentUser._id.toString()) {
    return response.status(403).json({ error: 'Unauthorized: only the user can delete their own account' })
  }

  await User.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

usersRouter.get('/check', async (request, response) => {
  const { username, email } = request.query

  if (!username && !email) {
    return response.status(400).json({ error: 'Provide username or email to check' })
  }

  let user
  
  if (username) {
    user = await User.findOne({ username: username.trim().toLowerCase() })
    if (user) return response.json({ available: false })
  }

  if (email) {
    user = await User.findOne({ email: email.trim().toLowerCase() })
    if (user) return response.json({ available: false })
  }

  response.json({ available: true })
})

module.exports = usersRouter