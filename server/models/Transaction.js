// models/Transaction.js
// Mongoose schema for income/expense transactions
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Food',
        'Rent',
        'Travel',
        'Shopping',
        'Bills',
        'Education',
        'Healthcare',
        'Entertainment',
        'Salary',
        'Freelance',
        'Investment',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY'],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', null],
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
