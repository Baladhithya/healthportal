const mongoose = require('mongoose');

const wellnessGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalType: {
    type: String,
    enum: ['steps', 'water', 'sleep'],
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    required: true
  },
  met: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient per-user-per-date queries
wellnessGoalSchema.index({ userId: 1, date: 1 });
wellnessGoalSchema.index({ userId: 1, goalType: 1 });

module.exports = mongoose.model('WellnessGoal', wellnessGoalSchema);
