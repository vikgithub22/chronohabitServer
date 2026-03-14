// src/utils/seed.js
// Run with: node src/utils/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Habit    = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

const SEED_EMAIL    = 'demo@chronohabit.com';
const SEED_PASSWORD = 'demo1234';

const SEED_HABITS = [
  { name:'Morning Meditation', description:'10 minutes of mindfulness', category:'mindfulness', color:'violet', icon:'🧘', frequency:'daily', targetDays:[], targetCount:1, quantityTarget:10, quantityUnit:'minutes', reminderTime:'07:00', motivation:'Clear mind leads to better decisions' },
  { name:'Read Books',         description:'Read at least 20 pages',    category:'learning',    color:'amber',  icon:'📚', frequency:'daily', targetDays:[], targetCount:1, quantityTarget:20, quantityUnit:'pages',   reminderTime:'21:00', motivation:'A book a month = 12 books a year' },
  { name:'Exercise',           description:'30 min cardio or strength', category:'fitness',     color:'emerald',icon:'💪', frequency:'weekly',targetDays:[1,3,5], targetCount:3, quantityTarget:30, quantityUnit:'minutes', reminderTime:'06:30', motivation:'Strong body, strong mind' },
  { name:'Drink Water',        description:'Stay hydrated all day',     category:'health',      color:'sky',    icon:'💧', frequency:'daily', targetDays:[], targetCount:1, quantityTarget:8,  quantityUnit:'glasses', reminderTime:null,    motivation:'Hydration is the foundation of energy' },
  { name:'Journal',            description:'Write 3 gratitude items',   category:'mindfulness', color:'rose',   icon:'✍️', frequency:'daily', targetDays:[], targetCount:1, quantityTarget:null,quantityUnit:null,     reminderTime:'22:00', motivation:'Gratitude rewires the brain' },
  { name:'No Social Media',    description:'Avoid social media before noon', category:'productivity', color:'teal', icon:'📵', frequency:'weekly', targetDays:[1,2,3,4,5], targetCount:5, quantityTarget:null, quantityUnit:null, reminderTime:null, motivation:'Deep work requires protected mornings' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing demo user and their data
    const existingUser = await User.findOne({ email: SEED_EMAIL });
    if (existingUser) {
      await Habit.deleteMany({ userId: existingUser._id });
      await HabitLog.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
      console.log('🗑️  Cleared existing demo data');
    }

    // Create demo user
    const user = await User.create({ name: 'Demo User', email: SEED_EMAIL, password: SEED_PASSWORD });
    console.log(`👤 Created user: ${SEED_EMAIL} / ${SEED_PASSWORD}`);

    // Create habits
    const habits = await Habit.insertMany(
      SEED_HABITS.map((h, i) => ({ ...h, userId: user._id, order: i, isActive: true }))
    );
    console.log(`✓  Created ${habits.length} habits`);

    // Create 60 days of logs
    const logs = [];
    const today = new Date();

    for (let d = 59; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];

      for (const habit of habits) {
        const prob = { 'habit-0':0.7,'habit-1':0.6,'habit-2':0.75,'habit-3':0.85,'habit-4':0.5,'habit-5':0.65 };
        const baseProbability = 0.65 + Math.max(0, (60 - d) / 60) * 0.25;
        if (Math.random() < baseProbability) {
          logs.push({
            userId:      user._id,
            habitId:     habit._id,
            date:        dateStr,
            completed:   true,
            mood:        Math.floor(Math.random() * 3) + 3,
            completedAt: new Date(date),
          });
        }
      }
    }

    await HabitLog.insertMany(logs, { ordered: false });
    console.log(`📋 Created ${logs.length} log entries`);

    console.log('\n🎉 Seed complete!');
    console.log(`   Login: ${SEED_EMAIL}`);
    console.log(`   Password: ${SEED_PASSWORD}`);
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
