const mongoose = require('mongoose')
const errorMessages = require('../utils/errorMessages')

const {
  USERNAME_REQUIRED,
  EMAIL_REQUIRED,
  PASSWORD_REQUIRED,
} = errorMessages

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, USERNAME_REQUIRED],
    unique: true,
    minLength: 3,
  },
  email: { 
    type: String, 
    required: [true, EMAIL_REQUIRED], 
    unique: true 
  },
  passwordHash: { 
    type: String, 
    required: [true, PASSWORD_REQUIRED]
  },
}, { timestamps: true })

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User