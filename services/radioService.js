const { LRUCache } = require('lru-cache')
const axios = require('axios')
const { getWorkingServers } = require('../utils/radioBrowser')
const RADIO_CONFIG = require('../utils/radioConfig')
const logger = require('../utils/logger')

const serverCache = new LRUCache({
  max: 50,      //* Maximum number of servers to cache
  ttl: 6 * 60 * 60 * 1000,      //* 6 Hours expiration
  allowStale: true,       //* Graceful degradation
  updateAgeOnGet: true      //* Optimal cache hits
})

//*====== Get servers with intelligent caching ======*//
const getServersWithCache = async () => {
  //* Try to get cached servers (even stale ones)
  const cachedServers = serverCache.get('radio-servers', { allowStale: true })

  if (cachedServers) {
    logger.info('Using cached radio servers')
    return cachedServers
  }

  //* No cache available, fetch fresh servers
  logger.info('Fetching fresh radio servers...')
  try {
    const freshServers = await getWorkingServers()
    serverCache.set('radio-servers', freshServers)
    return freshServers
  } catch (error) {
    logger.error('Failed to fetch servers:', error.message)
    throw new Error('Could not find working radio servers')
  }
}


//*====== Make API request with retry logic =======*//
const makeRadioRequest = async (endpoint, params = {}) => {
  const servers = await getServersWithCache()

  if (servers.length === 0) {
    throw new Error('No radio servers available')
  }

  for (const baseUrl of servers) {
    try {
      const url = `${baseUrl}/${endpoint}`
      logger.info(`Request to: ${url}`)

      const response = await axios.get(url, {
        params: { ...params, hidebroken: true },
        timeout: 8000,
        headers: {
          'User-Agent': `${RADIO_CONFIG.name}/${RADIO_CONFIG.version} (${RADIO_CONFIG.contact})`
        }
      })

      return response.data
    } catch (error) {
      console.warn(`Failed with ${baseUrl}:`, error.code)
      continue
    }
  }

  throw new Error('All radio servers failed')
}

//*====== Force refresh cache (optional) =======*//
const refreshCache = async () => {
  logger.info('Manually refreshing server cache...')
  try {
    const freshServers = await getWorkingServers()
    serverCache.set('radio-servers', freshServers)
    return freshServers
  } catch (error) {
    console.error('Manual refresh failed:', error.message)
    throw error
  }
}

module.exports = {
  getServersWithCache,
  makeRadioRequest,
  refreshCache
}