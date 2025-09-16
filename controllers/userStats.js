const userStatsRouter = require('express').Router()
const UserStats = require('../models/userStats')
const { userExtractor } = require('../utils/middleware')

userStatsRouter.get('/', async (request, response) => {
  const userStats = await UserStats.find({})
  response.json(userStats.map(stats => stats.toJSON()))
})

userStatsRouter.post('/', userExtractor, async (request, response) => {
  const { gamesPlayed, questionsAnswered } = request.body

  const user = request.user

  const userStats = new UserStats({
    user,
    gamesPlayed,
    questionsAnswered
  })

  const savedUserStats = await userStats.save()

  response.json(savedUserStats.toJSON())
})

module.exports = userStatsRouter