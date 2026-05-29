// src/pages/Transactions.js
import React, { useState, useEffect, useCallback } from 'react';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const CATEGORIES_EXPENSE = ['Food','Rent','Travel','Shopping','Bills','Education','Healthcare','Entertainment','Other'];
const CATEGORIES_INCOME = ['Salary','Freelance','Investment','Other'];

const formatCurrency = (amount, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] || currency} ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const CATEGORY_COLORS = {
  Food:'#f59e0b', Rent:'#8b5cf6', Travel:'#3b82f6', Shopping:'#ec4899',
  Bills:'#f43f5e', Education:'#06b6d4', Healthcare:'#10d884', Entertainment:'#ff6b35',
  Salary:'#10d884', Freelance:'#3b82f6', Investment:'#8b5cf6', Other:'#6b7280',
};

const EMPTY_FORM = {
  type: 'expense', amount: '', category: 'Food', description: '',
  date: new Date().toISOString().split('T')[0], currency: 'INR',
  isRecurring: false, recurringFrequency: '',
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: '' });
  const { user } = useAuth();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filters };
      const res = await getTransactions(params);
      setTransactions(res.data.data || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newForm = { ...form, [name]: type === 'checkbox' ? checked : value };
    // Auto-update category when type changes
    if (name === 'type') {
      newForm.category = value === 'income' ? 'Salary' : 'Food';
    }
    setForm(newForm);
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, currency: user?.currency || 'INR' });
    setShowModal(true);
  };

  const openEdit = (txn) => {
    setEditId(txn._id);
    setForm({
      type: txn.type, amount: txn.amount, category: txn.category,
      description: txn.description || '', currency: txn.currency,
      date: new Date(txn.date).toISOString().split('T')[0],
      isRecurring: txn.isRecurring || false,
      recurringFrequency: txn.recurringFrequency || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        recurringFrequency: form.isRecurring ? form.recurringFrequency : null,
      };
      if (editId) {
        await updateTransaction(editId, payload);
        toast.success('Transaction updated!');
      } else {
        const res = await addTransaction(payload);
        const autocat = res.data.autoCategory;
        toast.success(`Transaction added!${autocat ? ` Auto-categorized as "${autocat}"` : ''}`);
      }
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const categories = form.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{total} total transactions</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: 16 }}>
        <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
          <select
            className="form-select" style={{ width: 'auto', minWidth: 140 }}
            value={filters.type}
            onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            className="form-select" style={{ width: 'auto', minWidth: 160 }}
            value={filters.category}
            onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
          >
            <option value="">All Categories</option>
            {[...CATEGORIES_EXPENSE, ...CATEGORIES_INCOME].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {(filters.type || filters.category) && (
            <button className="btn btn-secondary btn-sm"
              onClick={() => { setFilters({ type: '', category: '' }); setPage(1); }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💸</div>
            <p>No transactions found. Add your first one!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn._id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(txn.date).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <strong>{txn.description || '—'}</strong>
                      {txn.isRecurring && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent-blue)' }}>
                          🔄 {txn.recurringFrequency}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="category-pill"
                        style={{ color: CATEGORY_COLORS[txn.category] || 'var(--text-secondary)' }}>
                        {txn.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${txn.type}`}>
                        {txn.type === 'income' ? '↑' : '↓'} {txn.type}
                      </span>
                    </td>
                    <td className="text-right">
                      <strong className={txn.type === 'income' ? 'text-green' : 'text-red'}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, txn.currency)}
                      </strong>
                    </td>
                    <td className="text-right">
                      <button className="btn btn-secondary btn-sm" style={{ marginRight: 6 }}
                        onClick={() => openEdit(txn)}>
                        ✏️
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(txn._id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-between items-center" style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <span className="text-sm text-muted">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page === pages}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2 className="modal-title">{editId ? '✏️ Edit Transaction' : '➕ Add Transaction'}</h2>
            <form onSubmit={handleSubmit}>
              {/* Income / Expense Toggle */}
              <div className="type-toggle mb-4">
                <button type="button"
                  className={`income ${form.type === 'income' ? 'active' : ''}`}
                  onClick={() => handleFormChange({ target: { name: 'type', value: 'income' } })}>
                  ↑ Income
                </button>
                <button type="button"
                  className={`expense ${form.type === 'expense' ? 'active' : ''}`}
                  onClick={() => handleFormChange({ target: { name: 'type', value: 'expense' } })}>
                  ↓ Expense
                </button>
              </div>

              <div className="card-grid card-grid-2">
                <div className="form-group">
                  <label className="form-label">Amount *</label>
                  <input type="number" name="amount" className="form-input" placeholder="0.00"
                    value={form.amount} onChange={handleFormChange} required min="0.01" step="0.01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select name="currency" className="form-select" value={form.currency} onChange={handleFormChange}>
                    <option value="INR">INR ₹</option>
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                    <option value="GBP">GBP £</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" className="form-select" value={form.category} onChange={handleFormChange} required>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" name="description" className="form-input"
                  placeholder="What was this for? (auto-categorizes)"
                  value={form.description} onChange={handleFormChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" name="date" className="form-input"
                  value={form.date} onChange={handleFormChange} required />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" name="isRecurring" checked={form.isRecurring}
                    onChange={handleFormChange} />
                  <span className="form-label" style={{ margin: 0 }}>Recurring Transaction</span>
                </label>
              </div>

              {form.isRecurring && (
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select name="recurringFrequency" className="form-select"
                    value={form.recurringFrequency} onChange={handleFormChange}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Update' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
