// src/routes/logs.js
const express = require('express');
const { getLogs, toggleLog, updateLog, getHabitStats } = require('../controllers/logController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get   ('/',              getLogs);
router.post  ('/toggle',        toggleLog);
router.put   ('/:id',           updateLog);
router.get   ('/stats/:habitId',getHabitStats);

module.exports = router;
