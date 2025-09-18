const supertest = require('supertest')
const mongoose = require('mongoose')
const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')
const errorMessages = require('../utils/errorMessages')
const app = require('../app')

const {
  USERNAME_REQUIRED,
  USERNAME_LENGTH_INVALID,
  USERNAME_INVALID,
  EMAIL_REQUIRED,
  EMAIL_LENGTH_INVALID,
  EMAIL_INVALID,
  PASSWORD_REQUIRED,
  PASSWORD_WEAK,
  PASSWORD_TOO_LONG
} = errorMessages

const api = supertest(app)

describe('user tests when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({
      username: 'root',
      email: 'root@example.com',
      passwordHash
    })

    await user.save()
  })

  test('should return all users as json', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    response.body.forEach(user => {
      assert(user.username, 'username is missing')
      assert(user.email, 'email is missing')
      assert(user.id, 'id is missing')
      assert(!user.passwordHash, 'passwordHash should not be exposed')
    })

    const users = await helper.usersInDb()
    assert(response.body.length === users.length)
  })

  test('creation succeeds with correct data', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'quizmaster42',
      email: 'quizmaster42@example.com',
      password: 'QuizPass987'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(usersAtEnd.length === usersAtStart.length + 1)
  })

  describe('username validations', () => {

    test('creation fails with proper statuscode and message if username is missing', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        email: 'quizmaster42@example.com',
        password: 'QuizPass987'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert(response.body.error.includes(USERNAME_REQUIRED))
    })

    test('creation fails with proper statuscode and message if username is too short', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'qu',
        email: 'quizmaster42@example.com',
        password: 'QuizPass987'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert(response.body.error.includes(USERNAME_LENGTH_INVALID))
    })

    test('username is too long', async () => {
      const usersAtStart = await helper.usersInDb()

      const longUsername = 'q'.repeat(31)

      const newUser = {
        username: longUsername,
        email: 'quizmaster42@example.com',
        password: 'QuizPass987'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert(response.body.error.includes(USERNAME_LENGTH_INVALID))
    })

    test('creation fails with proper statuscode and message if username is invalid', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'quiz@master',
        email: 'quizmaster42@example.com',
        password: 'QuizPass987'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert(response.body.error.includes(USERNAME_INVALID))
    })

    test('creation fails with proper statuscode and message if username is already taken', async () => {

      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        email: 'quizmaster42@example.com',
        password: 'QuizPass987'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert(usersAtEnd.length === usersAtStart.length)

      assert(response.body.error.includes('username must be unique'))
    })

  })

  describe('email validations', () => {

    test('creation fails with proper statuscode and message if email is missing', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'quizmaster42',
        password: 'QuizPass987'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert(response.body.error.includes(EMAIL_REQUIRED))
    })

    test('creation fails with proper statuscode and message if email is too short', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'quizmaster42',
        email: 'q@a.',
        password: 'QuizPass987'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert(response.body.error.includes(EMAIL_LENGTH_INVALID))
    })

    test('creation fails with proper statuscode and message if email is too long', async () => {
      const usersAtStart = await helper.usersInDb()

      const localPart = 'a'.repeat(64);
      const domain = 'b'.repeat(190) + '.com'
      const longEmail = `${localPart}@${domain}`

      const newUser = {
        username: 'quizmaster42',
        email: longEmail,
        password: 'QuizPass987'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert(response.body.error.includes(EMAIL_LENGTH_INVALID))
    })

    test('creation fails with proper statuscode and message if email is invalid', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'quizmaster42',
        email: 'quizmaster',
        password: 'QuizPass987'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert(response.body.error.includes(EMAIL_INVALID))
    })

    test('creation fails with proper statuscode and message if email already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'quizmaster42',
        email: 'root@example.com',
        password: 'QuizPass987'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert(usersAtEnd.length === usersAtStart.length)
      assert(response.body.error.includes('email must be unique'))
    })
  })

  describe('password validations', () => {

    test('creation fails with proper statuscode and message if password is missing', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'quizmaster42',
        email: 'root@example.com'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert(usersAtEnd.length === usersAtStart.length)
      assert(response.body.error.includes(PASSWORD_REQUIRED))
    })

    test('creation fails with proper statuscode and message if password is too short', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'quizmaster42',
        email: 'root@example.com',
        password: 'pass'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert(usersAtEnd.length === usersAtStart.length)
      assert(response.body.error.includes(PASSWORD_WEAK))
    })

    test('creation fails with proper statuscode and message if password is too long', async () => {
      const usersAtStart = await helper.usersInDb()

      const passLetters = 'a'.repeat(65)
      const passNums = '1'.repeat(64)
      const longPass = `${passLetters}${passNums}`

      const newUser = {
        username: 'quizmaster42',
        email: 'root@example.com',
        password: longPass
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()

      assert(usersAtEnd.length === usersAtStart.length)
      assert(response.body.error.includes(PASSWORD_TOO_LONG))
    })

  })

})

after(async () => {
  await mongoose.connection.close()
})