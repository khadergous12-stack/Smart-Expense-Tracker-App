// src/pages/Budgets.js
import React, { useState, useEffect } from 'react';
import { getBudgets, createOrUpdateBudget, deleteBudget } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BUDGET_CATEGORIES = ['Total','Food','Rent','Travel','Shopping','Bills','Education','Healthcare','Entertainment','Other'];

const formatCurrency = (amount, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] || currency} ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: 'Food',
    amount: '',
    alertThreshold: 80,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const { user } = useAuth();

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await getBudgets({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
      setBudgets(res.data.data || []);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createOrUpdateBudget({ ...form, amount: parseFloat(form.amount) });
      toast.success('Budget saved!');
      setShowModal(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await deleteBudget(id);
      toast.success('Budget deleted');
      fetchBudgets();
    } catch {
      toast.error('Failed to delete budget');
    }
  };

  const getBarColor = (percentage) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'safe';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set limits and track spending by category</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Set Budget
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">🎯</div>
            <p>No budgets set yet. Click "Set Budget" to get started!</p>
          </div>
        </div>
      ) : (
        <div className="card-grid card-grid-2">
          {budgets.map((budget) => (
            <div key={budget._id} className="card">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                    {budget.category === 'Total' ? '💰 Total Spending' : `${budget.category}`}
                  </div>
                  <div className="text-sm text-muted">
                    Monthly Budget: {formatCurrency(budget.amount, user?.currency)}
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(budget._id)}>
                  🗑️
                </button>
              </div>

              {/* Progress */}
              <div className="progress-bar" style={{ marginBottom: 8 }}>
                <div
                  className={`progress-fill ${getBarColor(budget.percentage)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">
                  {formatCurrency(budget.spent, user?.currency)} spent
                </span>
                <span className={`text-sm ${budget.exceeded ? 'text-red' : budget.alert ? '' : 'text-green'}`}
                  style={{ fontWeight: 600, color: budget.exceeded ? 'var(--accent-red)' : budget.alert ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
                  {budget.percentage}%
                </span>
              </div>

              {budget.exceeded && (
                <div className="alert alert-danger mt-2" style={{ margin: '8px 0 0', padding: '6px 10px', fontSize: 12 }}>
                  🚨 Budget exceeded by {formatCurrency(budget.spent - budget.amount, user?.currency)}!
                </div>
              )}
              {!budget.exceeded && budget.alert && (
                <div className="alert alert-warning mt-2" style={{ margin: '8px 0 0', padding: '6px 10px', fontSize: 12 }}>
                  ⚠️ {formatCurrency(budget.remaining, user?.currency)} remaining
                </div>
              )}
              {!budget.exceeded && !budget.alert && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  ✅ {formatCurrency(budget.remaining, user?.currency)} remaining
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2 className="modal-title">🎯 Set Budget</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  {BUDGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Budget Amount ({user?.currency})</label>
                <input type="number" className="form-input" placeholder="e.g. 5000"
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  required min="1" step="1" />
              </div>

              <div className="form-group">
                <label className="form-label">Alert Threshold: {form.alertThreshold}%</label>
                <input type="range" min="50" max="100" step="5"
                  value={form.alertThreshold}
                  onChange={e => setForm({ ...form, alertThreshold: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent-green)' }} />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>50%</span><span>Alert at {form.alertThreshold}%</span><span>100%</span>
                </div>
              </div>

              <div className="card-grid card-grid-2">
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <select className="form-select" value={form.month}
                    onChange={e => setForm({ ...form, month: parseInt(e.target.value) })}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={form.year}
                    onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}>
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
