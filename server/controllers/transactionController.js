// controllers/transactionController.js
// Full CRUD for income/expense transactions
const Transaction = require('../models/Transaction');

// Auto-categorization based on description keywords
const suggestCategory = (description) => {
  const desc = (description || '').toLowerCase();
  const rules = [
    { keywords: ['uber', 'ola', 'taxi', 'bus', 'train', 'flight', 'metro', 'petrol', 'fuel'], category: 'Travel' },
    { keywords: ['zomato', 'swiggy', 'cafe', 'restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger'], category: 'Food' },
    { keywords: ['amazon', 'flipkart', 'myntra', 'shopping', 'clothes', 'shoes', 'mall'], category: 'Shopping' },
    { keywords: ['rent', 'house', 'apartment', 'pg', 'hostel'], category: 'Rent' },
    { keywords: ['electricity', 'water', 'internet', 'wifi', 'mobile', 'recharge', 'bill'], category: 'Bills' },
    { keywords: ['school', 'college', 'course', 'book', 'tuition', 'education', 'udemy', 'coursera'], category: 'Education' },
    { keywords: ['doctor', 'hospital', 'medicine', 'pharmacy', 'health', 'gym', 'fitness'], category: 'Healthcare' },
    { keywords: ['movie', 'netflix', 'spotify', 'prime', 'game', 'entertainment', 'concert'], category: 'Entertainment' },
    { keywords: ['salary', 'stipend', 'paycheck', 'wages'], category: 'Salary' },
    { keywords: ['freelance', 'project', 'client', 'invoice', 'consulting'], category: 'Freelance' },
    { keywords: ['dividend', 'interest', 'stock', 'mutual fund', 'investment', 'return'], category: 'Investment' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((kw) => desc.includes(kw))) {
      return rule.category;
    }
  }
  return null;
};

// @desc    Get all transactions for logged-in user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build filter object
    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res, next) => {
  try {
    let { type, amount, category, description, date, currency, isRecurring, recurringFrequency } = req.body;

    // Auto-suggest category if not provided
    if (!category && description) {
      const suggested = suggestCategory(description);
      if (suggested) category = suggested;
      else category = type === 'income' ? 'Salary' : 'Other';
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: date ? new Date(date) : Date.now(),
      currency: currency || req.user.currency || 'INR',
      isRecurring,
      recurringFrequency,
    });

    res.status(201).json({
      success: true,
      data: transaction,
      autoCategory: !req.body.category ? category : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Make sure the transaction belongs to the logged-in user
    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this transaction' });
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this transaction' });
    }

    await transaction.deleteOne();

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary (income, expense, balance, category breakdown)
// @route   GET /api/transactions/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // This month's transactions
    const monthTxns = await Transaction.find({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const monthIncome = monthTxns
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthExpense = monthTxns
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category-wise expense breakdown (this month)
    const categoryBreakdown = monthTxns
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const allTxns = await Transaction.find({
      user: userId,
      date: { $gte: sixMonthsAgo },
    });

    const monthlyTrend = {};
    allTxns.forEach((t) => {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyTrend[key]) monthlyTrend[key] = { income: 0, expense: 0 };
      monthlyTrend[key][t.type] += t.amount;
    });

    // All-time totals
    const allUserTxns = await Transaction.find({ user: userId });
    const totalIncome = allUserTxns.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = allUserTxns.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Recent transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        monthIncome,
        monthExpense,
        monthBalance: monthIncome - monthExpense,
        totalIncome,
        totalExpense,
        totalBalance: totalIncome - totalExpense,
        categoryBreakdown,
        monthlyTrend,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
