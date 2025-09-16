const radioRouter = require('express').Router()
const radioService = require('../services/radioService')

radioService.getServersWithCache()
  .then(servers => {
    console.log(`Radio service initialized with ${servers.length} servers`)
  })
  .catch(error => {
    console.error('Radio service initialization failed:', error.message)
  })

//*====== TOP STATIONS BY CLICKS ======*//
radioRouter.get('/stations/topclick', async (req, res) => {
  try {
    const { limit = 50 } = req.query
    const data = await radioService.makeRadioRequest('stations/topclick', {
      limit: parseInt(limit),
      hidebroken: true,
      reverse: true
    })
    res.json(data)
  } catch (error) {
    console.error('Failed to get top stations by clicks:', error.message)
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Please try again later'
    })
  }
})

//*====== TOP STATIONS BY VOTES ======*//
radioRouter.get('/stations/topvote', async (req, res) => {
  try {
    const { limit = 50 } = req.query
    const data = await radioService.makeRadioRequest('stations/topvote', {
      limit: parseInt(limit),
      hidebroken: true,
      reverse: true
    })
    res.json(data)
  } catch (error) {
    console.error('Failed to get top stations by votes:', error.message)
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Please try again later'
    })
  }
})

//*====== STATIONS BY TAG ======*//
radioRouter.get('/stations/bytag/:tag', async (req, res) => {
  try {
    const { tag } = req.params
    const { limit = 100 } = req.query
    const data = await radioService.makeRadioRequest(`stations/bytag/${encodeURIComponent(tag)}`, {
      order: 'clickcount',
      hidebroken: true,
      reverse: true,
      limit: parseInt(limit),
    })
    res.json(data)
  } catch (error) {
    console.error(`Failed to get stations by tag ${req.params.tag}:`, error.message)
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Please try again later'
    })
  }
})

//*====== STATIONS BY COUNTRY ======*//
radioRouter.get('/stations/bycountry/:country', async (req, res) => {
  try {
    const { country } = req.params
    const { limit = 100 } = req.query
    const data = await radioService.makeRadioRequest(`stations/bycountry/${encodeURIComponent(country)}`, {
      order: 'clickcount',
      hidebroken: true,
      reverse: true,
      limit: parseInt(limit),
    })
    res.json(data)
  } catch (error) {
    console.error(`Failed to get stations by country ${req.params.country}:`, error.message)
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Please try again later'
    })
  }
})

//*====== STATIONS BY NAME SEARCH ======*//
radioRouter.get('/stations/byname/:name', async (req, res) => {
  try {
    const { name } = req.params
    const { limit = 100 } = req.query

    const data = await radioService.makeRadioRequest(`stations/byname/${encodeURIComponent(name)}`, {
      order: 'clickcount',
      hidebroken: true,
      limit: parseInt(limit)
    })

    res.json(data)

  } catch (error) {
    console.error(`Failed to search stations by name ${req.params.name}:`, error.message)
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Please try again later'
    })
  }
})

//*====== GET COUNTRIES ======*//
radioRouter.get('/countries', async (req, res) => {

  const { limit = 100 } = req.query

  try {
    const data = await radioService.makeRadioRequest('countries', {
      order: 'stationcount',
      hidebroken: true,
      reverse: true,
      limit: parseInt(limit)
    })
    res.json(data)
  } catch (error) {
    console.error('Failed to get countries:', error.message)
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Please try again later'
    })
  }
})

//*====== GET TAGS ======*//
radioRouter.get('/tags', async (req, res) => {
  const { limit = 100 } = req.query

  try {
    const data = await radioService.makeRadioRequest('tags', {
      order: 'stationcount',
      hidebroken: true,
      reverse: true,
      limit: parseInt(limit)
    })

    res.json(data)

  } catch (error) {
    console.error('Failed to get tags:', error.message)
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Please try again later'
    })
  }
})

radioRouter.get('/tags/:tag', async (req, res) => {

  const { limit = 100 } = req.query
  const { tag } = req.params

  try {
    const data = await radioService.makeRadioRequest(`tags/${encodeURIComponent(tag)}`, {
      order: 'stationcount',
      hidebroken: true,
      reverse: true,
      limit: parseInt(limit)
    })

    res.json(data)
    
  } catch (error) {
    console.error('Failed to get tags:', error.message)
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Please try again later'
    })
  }
})


//*====== STATUS ENDPOINT (for debugging) ======*//
radioRouter.get('/status', async (req, res) => {
  try {
    const servers = await radioService.getServersWithCache()

    res.json({
      status: 'ok',
      serverCount: servers.length,
      servers: servers,
      message: `Radio service operational with ${servers.length} servers`
    })

  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Radio service unavailable',
      error: error.message
    })
  }
})

//*====== MANUAL REFRESH ENDPOINT (optional) ======*//
radioRouter.post('/refresh', async (req, res) => {
  try {
    const servers = await radioService.refreshCache()

    res.json({
      status: 'success',
      message: 'Server cache refreshed successfully',
      servers: servers,
      serverCount: servers.length
    })

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to refresh cache',
      error: error.message
    })
  }
})

//*====== SERVER HEALTH CHECK ENDPOINT ======*//
radioRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Backend server is operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

//*====== RADIO SERVICE HEALTH CHECK ======*//
radioRouter.get('/health/radio', async (req, res) => {
  try {
    const servers = await radioService.getServersWithCache()

    res.json({
      status: 'healthy',
      serverCount: servers.length,
      message: servers.length > 0
        ? `Radio service connected to ${servers.length} servers`
        : 'Radio service available but no servers connected',
      servers: servers
    })

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Radio service initialization failed',
      error: error.message
    })
  }
})

module.exports = radioRouter