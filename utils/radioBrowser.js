const axios = require('axios')
const dns = require('dns')
const util = require('util')
const RADIO_CONFIG = require('../utils/radioConfig')

const FALLBACK_SERVERS = [
  'https://de1.api.radio-browser.info/json',
  'https://nl1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/json',
  'https://fr1.api.radio-browser.info/json',
  'https://us1.api.radio-browser.info/json'
]

//* Promisify DNS functions
const resolveSrv = util.promisify(dns.resolveSrv)

/*
 * Get a list of base urls of all available radio-browser servers using DNS SRV lookup
 * Returns: array of strings - base urls of radio-browser servers
 */
const getRadioBrowserBaseUrls = async () => {
  try {
    const hosts = await resolveSrv("_api._tcp.radio-browser.info")

    //* Sort and format URLs (they recommend HTTPS)
    const urls = hosts
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(host => `https://${host.name.replace(/\.$/, '')}/json`) //* Remove trailing dot and add /json

    console.log('Discovered Radio Browser servers:', urls)
    return urls

  } catch (error) {
    console.error('DNS SRV lookup failed:', error.message)

    //* Fallback to hardcoded servers if DNS fails
    return FALLBACK_SERVERS
  }
}

//*====== Check which discovered servers are actually working ======*//
const checkServerHealth = async (servers) => {
  const workingServers = []

  for (const server of servers) {
    try {
      const response = await axios.get(`${server}/stations/topclick?limit=1`, {
        timeout: 3000,
        headers: {
          'User-Agent': `${RADIO_CONFIG.name}/${RADIO_CONFIG.version} (${RADIO_CONFIG.contact})`
        }
      })

      if (response.status === 200) {
        workingServers.push(server)
        console.log(`✓ ${server} is working`)
      }
    } catch (error) {
      console.log(`x Server ${server} is down: ${error.code || error.message}`)
    }
  }

  if (workingServers.length > 0) {
    console.log('Working servers:', workingServers)
    return workingServers
  } else {
    console.log('No servers working, using all discovered servers as fallback')
  }
}


//*====== Get working servers with health check =======*//
const getWorkingServers = async () => {
  try {
    const discovered = await getRadioBrowserBaseUrls()
    const healthy = await checkServerHealth(discovered)
    return healthy
  } catch (error) {
    console.error('Failed to get working servers:', error.message)
    return FALLBACK_SERVERS
  }
}

/*
 * Get a random available radio-browser server
 * Returns: string - base url for radio-browser api
 */
const getRandomServerBaseUrl = (availableServers) => {
  if (availableServers.length === 0) {
    throw new Error('No radio browser servers available')
  }
  return availableServers[Math.floor(Math.random() * availableServers.length)]
}

module.exports = {
  getRadioBrowserBaseUrls,
  getRandomServerBaseUrl,
  checkServerHealth,
  getWorkingServers
}