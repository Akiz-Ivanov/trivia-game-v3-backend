const validator = require('validator')
const errorMessages = require('./errorMessages')

const { 
  USERNAME_REQUIRED, 
  USERNAME_INVALID, 
  USERNAME_LENGTH_INVALID, 
  EMAIL_REQUIRED, 
  EMAIL_INVALID,
  EMAIL_LENGTH_INVALID,
  PASSWORD_REQUIRED, 
  PASSWORD_WEAK,
  PASSWORD_TOO_LONG
} = errorMessages

const validateUserInput = (username, email, password) => {
    
  if (!username) return USERNAME_REQUIRED
  if (!email) return EMAIL_REQUIRED
  if (!password) return PASSWORD_REQUIRED

  if (!validator.isLength(username, { min: 3, max: 30 })) {
    return USERNAME_LENGTH_INVALID
  }

  if (!validator.isAlphanumeric(username)) {
    return USERNAME_INVALID
  }
  
  if (!validator.isLength(email, { min: 5, max: 254 })) {
    return EMAIL_LENGTH_INVALID
  }
  
  if ( !validator.isEmail(email)) {
    return EMAIL_INVALID
  }

  if (!validator.isLength(password, { max: 128 })) {
    return PASSWORD_TOO_LONG
  }

  if (!validator.isStrongPassword(password, { 
    minLength: 7, 
    minNumbers: 1,
    minUppercase: 0,
    minSymbols: 0 
  })) {
    return PASSWORD_WEAK
  }

  return null
}

module.exports = {
  validateUserInput
}