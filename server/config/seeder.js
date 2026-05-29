// server/config/seeder.js
// Run: node config/seeder.js
// Seeds the database with a developer user + sample transactions + budgets

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await Budget.deleteMany({});

  console.log('🗑️  Cleared existing data');

  // Create developer user
  const password = await bcrypt.hash('developer123', 10);
  const user = await User.create({
    name: 'Developer',
    email: 'developer@spendwise.com',
    password: 'developer123', // pre-save hook hashes this
    currency: 'INR',
  });

  console.log(`👤 Created user: ${user.email}`);

  const userId = user._id;
  const now = new Date();

  // Sample transactions for this month
  const transactions = [
    { type: 'income', amount: 45000, category: 'Salary', description: 'Monthly Salary - June 2026', date: new Date(now.getFullYear(), now.getMonth(), 1) },
    { type: 'income', amount: 8000, category: 'Freelance', description: 'Website Design Client', date: new Date(now.getFullYear(), now.getMonth(), 5) },
    { type: 'expense', amount: 12000, category: 'Rent', description: 'House Rent June', date: new Date(now.getFullYear(), now.getMonth(), 2) },
    { type: 'expense', amount: 3200, category: 'Food', description: 'Zomato + Groceries', date: new Date(now.getFullYear(), now.getMonth(), 8) },
    { type: 'expense', amount: 1500, category: 'Travel', description: 'Uber rides this week', date: new Date(now.getFullYear(), now.getMonth(), 10) },
    { type: 'expense', amount: 2200, category: 'Shopping', description: 'Amazon - Shoes & Books', date: new Date(now.getFullYear(), now.getMonth(), 12) },
    { type: 'expense', amount: 800, category: 'Bills', description: 'Electricity + Internet Bill', date: new Date(now.getFullYear(), now.getMonth(), 3) },
    { type: 'expense', amount: 1200, category: 'Education', description: 'Udemy Course - React + Node', date: new Date(now.getFullYear(), now.getMonth(), 7) },
    { type: 'expense', amount: 600, category: 'Entertainment', description: 'Netflix + Spotify Premium', date: new Date(now.getFullYear(), now.getMonth(), 1) },
    { type: 'expense', amount: 900, category: 'Healthcare', description: 'Doctor + Pharmacy', date: new Date(now.getFullYear(), now.getMonth(), 14) },
    // Last month data
    { type: 'income', amount: 45000, category: 'Salary', description: 'Monthly Salary - May 2026', date: new Date(now.getFullYear(), now.getMonth() - 1, 1) },
    { type: 'expense', amount: 12000, category: 'Rent', description: 'House Rent May', date: new Date(now.getFullYear(), now.getMonth() - 1, 2) },
    { type: 'expense', amount: 4100, category: 'Food', description: 'Food & Dining - May', date: new Date(now.getFullYear(), now.getMonth() - 1, 15) },
    { type: 'expense', amount: 5500, category: 'Shopping', description: 'Flipkart Sale', date: new Date(now.getFullYear(), now.getMonth() - 1, 20) },
    { type: 'income', amount: 5000, category: 'Investment', description: 'Mutual Fund Dividend', date: new Date(now.getFullYear(), now.getMonth() - 1, 25) },
  ];

  await Transaction.insertMany(transactions.map(t => ({ ...t, user: userId, currency: 'INR' })));
  console.log(`💸 Created ${transactions.length} sample transactions`);

  // Sample budgets
  const budgets = [
    { category: 'Total', amount: 35000, alertThreshold: 80 },
    { category: 'Food', amount: 5000, alertThreshold: 80 },
    { category: 'Travel', amount: 3000, alertThreshold: 75 },
    { category: 'Shopping', amount: 4000, alertThreshold: 80 },
    { category: 'Entertainment', amount: 1500, alertThreshold: 90 },
    { category: 'Bills', amount: 2000, alertThreshold: 85 },
  ];

  await Budget.insertMany(budgets.map(b => ({
    ...b,
    user: userId,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  })));
  console.log(`🎯 Created ${budgets.length} sample budgets`);

  console.log('\n✅ Seeding complete!');
  console.log('   Developer login → email: developer@spendwise.com | password: developer123');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seeder error:', err.message);
  process.exit(1);
});
