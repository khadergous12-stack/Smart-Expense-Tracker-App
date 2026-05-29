// controllers/budgetController.js
// Manages monthly category budgets and tracks spending vs. limits
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets for current month
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const budgets = await Budget.find({ user: req.user.id, month, year });

    // Calculate spending for each budget category
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate },
    });

    // Build spending map
    const spendingMap = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      acc['Total'] = (acc['Total'] || 0) + t.amount;
      return acc;
    }, {});

    // Enrich budget data with spending and alert info
    const enrichedBudgets = budgets.map((budget) => {
      const spent = spendingMap[budget.category] || 0;
      const percentage = (spent / budget.amount) * 100;
      const remaining = budget.amount - spent;
      const alert = percentage >= budget.alertThreshold;
      const exceeded = spent > budget.amount;

      return {
        ...budget.toObject(),
        spent,
        percentage: Math.round(percentage),
        remaining,
        alert,
        exceeded,
      };
    });

    res.json({
      success: true,
      data: enrichedBudgets,
      spendingMap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update a budget
// @route   POST /api/budgets
// @access  Private
const createOrUpdateBudget = async (req, res, next) => {
  try {
    const { category, amount, alertThreshold } = req.body;
    const now = new Date();
    const month = parseInt(req.body.month) || now.getMonth() + 1;
    const year = parseInt(req.body.year) || now.getFullYear();

    // Upsert: update if exists, create if not
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, category, month, year },
      { amount: parseFloat(amount), alertThreshold: alertThreshold || 80 },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // Assign user if this is a new document
    if (!budget.user) {
      budget.user = req.user.id;
      await budget.save();
    }

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await budget.deleteOne();
    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget alerts (categories exceeding threshold)
// @route   GET /api/budgets/alerts
// @access  Private
const getBudgetAlerts = async (req, res, next) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({ user: req.user.id, month, year });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate },
    });

    const spendingMap = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      acc['Total'] = (acc['Total'] || 0) + t.amount;
      return acc;
    }, {});

    const alerts = budgets
      .map((budget) => {
        const spent = spendingMap[budget.category] || 0;
        const percentage = (spent / budget.amount) * 100;
        return {
          category: budget.category,
          budgetAmount: budget.amount,
          spent,
          percentage: Math.round(percentage),
          exceeded: spent > budget.amount,
          alert: percentage >= budget.alertThreshold,
        };
      })
      .filter((b) => b.alert);

    res.json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudgets, createOrUpdateBudget, deleteBudget, getBudgetAlerts };
