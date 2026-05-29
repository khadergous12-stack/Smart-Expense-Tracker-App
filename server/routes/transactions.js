// routes/transactions.js
const express = require('express');
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/summary', getSummary);        // GET /api/transactions/summary
router.get('/', getTransactions);          // GET /api/transactions
router.post('/', addTransaction);          // POST /api/transactions
router.put('/:id', updateTransaction);     // PUT /api/transactions/:id
router.delete('/:id', deleteTransaction);  // DELETE /api/transactions/:id

module.exports = router;
