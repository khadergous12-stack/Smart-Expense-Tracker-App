// server.js
// Main Express server - entry point for the backend API
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const cron = require('node-cron');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Log HTTP requests in dev mode
}

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Expense Tracker API is running 🚀' });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Recurring Transactions Cron Job ─────────────────────────
// Runs every day at 6:00 AM to create recurring transaction entries
cron.schedule('0 6 * * *', async () => {
  console.log('⏰ Running recurring transactions cron job...');
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Find all recurring transactions that were created before today
    const recurringTxns = await Transaction.find({
      isRecurring: true,
      recurringFrequency: { $ne: null },
    });

    for (const txn of recurringTxns) {
      const lastDate = new Date(txn.date);
      let shouldCreate = false;

      if (txn.recurringFrequency === 'daily') {
        shouldCreate = lastDate < startOfDay;
      } else if (txn.recurringFrequency === 'weekly') {
        const daysDiff = (startOfDay - lastDate) / (1000 * 60 * 60 * 24);
        shouldCreate = daysDiff >= 7;
      } else if (txn.recurringFrequency === 'monthly') {
        shouldCreate =
          lastDate.getMonth() !== now.getMonth() ||
          lastDate.getFullYear() !== now.getFullYear();
      }

      if (shouldCreate) {
        await Transaction.create({
          user: txn.user,
          type: txn.type,
          amount: txn.amount,
          category: txn.category,
          description: `[Auto] ${txn.description}`,
          date: now,
          currency: txn.currency,
          isRecurring: false, // The copy itself isn't recurring
        });
        // Update original date to today to prevent duplicates
        txn.date = now;
        await txn.save();
      }
    }
    console.log('✅ Recurring transactions cron job complete');
  } catch (err) {
    console.error('❌ Cron job error:', err.message);
  }
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});

module.exports = app;
