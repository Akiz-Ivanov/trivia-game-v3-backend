const mongoose = require('mongoose')

// const categoryStatsSchema = new mongoose.Schema({
//   category: { type: String, required: true },
//   correct: { type: Number, default: 0 },
//   wrong: { type: Number, default: 0 }
// }, { _id: false });

const userStatsSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  gamesPlayed: { 
    type: Number, 
    default: 0
  },
  questionsAnswered: {
    type: Number,
    default: 0
  },
  // categories: [categoryStatsSchema]
})

userStatsSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const UserStats = mongoose.model('UserStats', userStatsSchema)

module.exports = UserStats