// routes/budgets.js
const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createOrUpdateBudget,
  deleteBudget,
  getBudgetAlerts,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/alerts', getBudgetAlerts);     // GET /api/budgets/alerts
router.get('/', getBudgets);               // GET /api/budgets
router.post('/', createOrUpdateBudget);    // POST /api/budgets
router.delete('/:id', deleteBudget);       // DELETE /api/budgets/:id

module.exports = router;
