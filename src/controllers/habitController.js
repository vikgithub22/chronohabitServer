// src/controllers/habitController.js
const { validationResult } = require('express-validator');
const Habit    = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// ── GET /api/habits ───────────────────────────────────────────────────────────
async function getHabits(req, res, next) {
  try {
    const habits = await Habit.find({ userId: req.user.id })
      .sort({ order: 1, createdAt: 1 });
    res.json({ habits });
  } catch (err) { next(err); }
}

// ── POST /api/habits ──────────────────────────────────────────────────────────
async function createHabit(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    // Determine order = count of existing habits
    const count = await Habit.countDocuments({ userId: req.user.id });

    const habit = await Habit.create({
      ...req.body,
      userId: req.user.id,
      order:  count,
    });
    res.status(201).json({ habit });
  } catch (err) { next(err); }
}

// ── GET /api/habits/:id ───────────────────────────────────────────────────────
async function getHabit(req, res, next) {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });
    res.json({ habit });
  } catch (err) { next(err); }
}

// ── PUT /api/habits/:id ───────────────────────────────────────────────────────
async function updateHabit(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });
    res.json({ habit });
  } catch (err) { next(err); }
}

// ── DELETE /api/habits/:id ────────────────────────────────────────────────────
async function deleteHabit(req, res, next) {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });

    // Also delete all logs for this habit
    await HabitLog.deleteMany({ habitId: req.params.id, userId: req.user.id });

    res.json({ message: 'Habit deleted successfully.' });
  } catch (err) { next(err); }
}

// ── PATCH /api/habits/:id/archive ─────────────────────────────────────────────
async function archiveHabit(req, res, next) {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });
    res.json({ habit });
  } catch (err) { next(err); }
}

// ── PATCH /api/habits/reorder ─────────────────────────────────────────────────
async function reorderHabits(req, res, next) {
  try {
    const { ids } = req.body; // array of habit ids in new order
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: 'ids must be an array.' });
    }

    const bulkOps = ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId: req.user.id },
        update: { $set: { order: index } },
      },
    }));

    await Habit.bulkWrite(bulkOps);
    res.json({ message: 'Habits reordered.' });
  } catch (err) { next(err); }
}

module.exports = { getHabits, createHabit, getHabit, updateHabit, deleteHabit, archiveHabit, reorderHabits };
