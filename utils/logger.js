const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('[INFO]', new Date().toISOString(), ...params)
  }
}

const error = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[ERROR]', new Date().toISOString(), ...params)
  }
}

const debug = (...params) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG]', new Date().toISOString(), ...params)
  }
}

module.exports = { info, error, debug }