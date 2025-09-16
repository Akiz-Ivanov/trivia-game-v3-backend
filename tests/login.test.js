const supertest = require('supertest')
const mongoose = require('mongoose')
const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const app = require('../app')

const api = supertest(app)

describe('login tests when one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('secret1', 10)
    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      passwordHash
    })
    await user.save()
  })

  test('succeeds with correct username and password', async () => {
    const response = await api
      .post('/api/login')
      .send({ 
        login: 'testuser',
        password: 'secret1' 
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(response.body.token)
    assert.strictEqual(response.body.username, 'testuser')
    assert.strictEqual(response.body.email, 'testuser@example.com')
  })

  test('succeeds with correct email and password', async () => {
    const response = await api
      .post('/api/login')
      .send({
        login: 'testuser@example.com',
        password: 'secret1'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(response.body.token)
    assert.strictEqual(response.body.username, 'testuser')
    assert.strictEqual(response.body.email, 'testuser@example.com')
  })

  test('fails with wrong password', async () => {
    const response = await api
      .post('/api/login')
      .send({ 
        login: 'testuser',
        password: 'wrong123' 
      })
      .expect(401)

    assert(response.body.error.includes('invalid login credentials'))
  })

  test('fails with non-existent user', async () => {
    const response = await api
      .post('/api/login')
      .send({ 
        login: 'nope', 
        password: 'whatever1'
      })
      .expect(401)

    assert(response.body.error.includes('invalid login credentials'))
  })

  test('fails when login is missing', async () => {
    const response = await api.post('/api/login').send({ password: 'secret1' }).expect(400)
    assert(response.body.error.includes('username/email and password required'))
  })

  test('fails when password is missing', async () => {
    const response = await api.post('/api/login').send({ login: 'testuser' }).expect(400)
    assert(response.body.error.includes('username/email and password required'))
  })

})

after(async () => {
  await mongoose.connection.close()
})