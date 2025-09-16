const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  let { login, password } = request.body

  login = login?.trim().toLowerCase()
  password = password?.trim()

  if (!login || !password) {
    return response.status(400).json({ error: 'username/email and password required' })
  }

  const isEmail = login.includes('@')

  const user = isEmail
    ? await User.findOne({ email: login })
    : await User.findOne({ username: login })

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'Invalid login credentials'
    })
  }

  const userForToken = {
    username: user.username,
    email: user.email,
    id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '2h' })

  response
    .status(200)
    .send({ token, username: user.username, email: user.email })
})

module.exports = loginRouter