// src/models/Habit.js
const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,  // fast lookups per user
    },
    name: {
      type:      String,
      required:  [true, 'Habit name is required'],
      trim:      true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    description: { type: String, default: '', trim: true },
    category: {
      type:    String,
      enum:    ['health','fitness','learning','mindfulness','productivity','social','creative','finance','other'],
      default: 'other',
    },
    color: {
      type:    String,
      enum:    ['emerald','sky','violet','rose','amber','teal','orange','pink'],
      default: 'emerald',
    },
    icon:      { type: String, default: '🌿' },
    frequency: { type: String, enum: ['daily','weekly','custom'], default: 'daily' },
    targetDays:    { type: [Number], default: [] },   // 0=Sun … 6=Sat
    targetCount:   { type: Number,  default: 1 },
    quantityTarget:{ type: Number,  default: null },
    quantityUnit:  { type: String,  default: null },
    isActive:      { type: Boolean, default: true },
    reminderTime:  { type: String,  default: null },  // "HH:mm"
    motivation:    { type: String,  default: '' },
    order:         { type: Number,  default: 0 },
  },
  { timestamps: true }
);

// Compound index so per-user queries are fast
habitSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Habit', habitSchema);
