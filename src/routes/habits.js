// src/routes/habits.js
const express  = require('express');
const { body } = require('express-validator');
const {
  getHabits, createHabit, getHabit,
  updateHabit, deleteHabit, archiveHabit, reorderHabits,
} = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All habit routes are protected
router.use(protect);

const habitRules = [
  body('name').trim().notEmpty().withMessage('Habit name is required').isLength({ max: 60 }),
  body('category').optional().isIn(['health','fitness','learning','mindfulness','productivity','social','creative','finance','other']),
  body('color').optional().isIn(['emerald','sky','violet','rose','amber','teal','orange','pink']),
  body('frequency').optional().isIn(['daily','weekly','custom']),
];

router.get   ('/',             getHabits);
router.post  ('/',             habitRules, createHabit);
router.patch ('/reorder',      reorderHabits);
router.get   ('/:id',          getHabit);
router.put   ('/:id',          habitRules, updateHabit);
router.delete('/:id',          deleteHabit);
router.patch ('/:id/archive',  archiveHabit);

module.exports = router;
