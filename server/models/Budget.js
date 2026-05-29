// models/Budget.js
// Mongoose schema for monthly category budgets
const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
        'Other',
        'Total', // Overall monthly budget
      ],
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [1, 'Budget must be at least 1'],
    },
    month: {
      type: Number, // 1-12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    alertThreshold: {
      type: Number,
      default: 80, // Alert when 80% of budget is used
      min: 1,
      max: 100,
    },
  },
  { timestamps: true }
);

// Unique budget per user per category per month/year
BudgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
