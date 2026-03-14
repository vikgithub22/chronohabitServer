// src/controllers/logController.js
const HabitLog = require('../models/HabitLog');
const Habit    = require('../models/Habit');

// ── GET /api/logs?habitId=&startDate=&endDate= ────────────────────────────────
async function getLogs(req, res, next) {
  try {
    const { habitId, startDate, endDate } = req.query;

    const filter = { userId: req.user.id };
    if (habitId)   filter.habitId   = habitId;
    if (startDate) filter.date = { $gte: startDate };
    if (endDate)   filter.date = { ...filter.date, $lte: endDate };

    const logs = await HabitLog.find(filter).sort({ date: -1 });
    res.json({ logs });
  } catch (err) { next(err); }
}

// ── POST /api/logs/toggle ─────────────────────────────────────────────────────
// Toggles completion for a habit on a given date (upsert pattern)
async function toggleLog(req, res, next) {
  try {
    const { habitId, date } = req.body;
    if (!habitId || !date) {
      return res.status(400).json({ message: 'habitId and date are required.' });
    }

    // Ensure habit belongs to this user
    const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });

    // Find existing log for that day
    const existing = await HabitLog.findOne({ habitId, date, userId: req.user.id });

    let log;
    if (existing) {
      // Toggle completed flag
      existing.completed   = !existing.completed;
      existing.completedAt = existing.completed ? new Date() : null;
      await existing.save();
      log = existing;
    } else {
      // Create new log as completed
      log = await HabitLog.create({
        userId:      req.user.id,
        habitId,
        date,
        completed:   true,
        completedAt: new Date(),
      });
    }

    res.json({ log });
  } catch (err) { next(err); }
}

// ── PUT /api/logs/:id ─────────────────────────────────────────────────────────
// Update mood / note / quantity on an existing log
async function updateLog(req, res, next) {
  try {
    const { mood, note, quantity } = req.body;

    const log = await HabitLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { mood, note, quantity } },
      { new: true, runValidators: true }
    );

    if (!log) return res.status(404).json({ message: 'Log not found.' });
    res.json({ log });
  } catch (err) { next(err); }
}

// ── GET /api/logs/stats/:habitId ──────────────────────────────────────────────
// Returns pre-computed stats for a single habit (completion rate, streak, etc.)
async function getHabitStats(req, res, next) {
  try {
    const { habitId } = req.params;

    // Ensure habit belongs to this user
    const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });

    // Get last 90 days of logs
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const startDate = ninetyDaysAgo.toISOString().split('T')[0];

    const logs = await HabitLog.find({
      habitId,
      userId:    req.user.id,
      completed: true,
      date:      { $gte: startDate },
    }).sort({ date: -1 });

    const completedDates = new Set(logs.map(l => l.date));

    // Build heatmap data
    const heatmapData = {};
    for (let i = 0; i < 91; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      heatmapData[dateStr] = completedDates.has(dateStr);
    }

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak    = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      if (completedDates.has(dateStr)) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        currentStreak = i <= 1 ? tempStreak : 0;
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Completion rate
    const completionRate = logs.length > 0 ? Math.min(logs.length / 90, 1) : 0;

    // Average mood
    const moodLogs = logs.filter(l => l.mood !== null);
    const averageMood = moodLogs.length > 0
      ? moodLogs.reduce((sum, l) => sum + l.mood, 0) / moodLogs.length
      : null;

    res.json({
      stats: {
        habitId,
        totalCompletions: logs.length,
        completionRate,
        averageMood,
        streak: { habitId, currentStreak, longestStreak, lastCompletedDate: logs[0]?.date ?? null },
        heatmapData,
      },
    });
  } catch (err) { next(err); }
}

module.exports = { getLogs, toggleLog, updateLog, getHabitStats };
