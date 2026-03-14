// src/models/HabitLog.js
const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    habitId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Habit',
      required: true,
    },
    // ISO date string YYYY-MM-DD stored as String for easy querying
    date:      { type: String, required: true },
    completed: { type: Boolean, default: false },
    quantity:  { type: Number,  default: null },
    mood:      { type: Number,  min: 1, max: 5, default: null },
    note:      { type: String,  default: '' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One log per habit per day per user
habitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);
