// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { getSummary, getBudgetAlerts } from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Filler
);

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Rent: '#8b5cf6',
  Travel: '#3b82f6',
  Shopping: '#ec4899',
  Bills: '#f43f5e',
  Education: '#06b6d4',
  Healthcare: '#10d884',
  Entertainment: '#ff6b35',
  Other: '#6b7280',
};

const formatCurrency = (amount, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] || currency} ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, alertsRes] = await Promise.all([
          getSummary(),
          getBudgetAlerts(),
        ]);
        setSummary(summaryRes.data.data);
        setAlerts(alertsRes.data.alerts || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: 'auto', padding: 48 }}>
        <div className="spinner" />
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (!summary) return null;

  // Category Doughnut Chart data
  const categoryLabels = Object.keys(summary.categoryBreakdown || {});
  const categoryValues = Object.values(summary.categoryBreakdown || {});
  const doughnutData = {
    labels: categoryLabels,
    datasets: [{
      data: categoryValues,
      backgroundColor: categoryLabels.map(l => CATEGORY_COLORS[l] || '#6b7280'),
      borderColor: 'var(--bg-card)',
      borderWidth: 3,
      hoverBorderWidth: 0,
    }],
  };

  // Monthly Trend Bar Chart data
  const trendMonths = Object.keys(summary.monthlyTrend || {}).sort();
  const trendLabels = trendMonths.map(m => {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'short' });
  });
  const barData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Income',
        data: trendMonths.map(m => summary.monthlyTrend[m]?.income || 0),
        backgroundColor: 'rgba(16, 216, 132, 0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Expense',
        data: trendMonths.map(m => summary.monthlyTrend[m]?.expense || 0),
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#8899b0', font: { family: 'DM Sans', size: 12 } },
      },
    },
    scales: {
      x: { ticks: { color: '#8899b0' }, grid: { color: 'rgba(255,255,255,0.03)' } },
      y: { ticks: { color: '#8899b0' }, grid: { color: 'rgba(255,255,255,0.03)' } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#8899b0', font: { family: 'DM Sans', size: 11 }, padding: 12 },
      },
    },
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">Here's your financial overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {alerts.map((alert, i) => (
            <div key={i} className={`alert ${alert.exceeded ? 'alert-danger' : 'alert-warning'}`}>
              <span>{alert.exceeded ? '🚨' : '⚠️'}</span>
              <strong>{alert.category}:</strong>{' '}
              {alert.exceeded
                ? `Budget exceeded! Spent ${formatCurrency(alert.spent, user?.currency)} of ${formatCurrency(alert.budgetAmount, user?.currency)}`
                : `${alert.percentage}% of budget used (${formatCurrency(alert.spent, user?.currency)} / ${formatCurrency(alert.budgetAmount, user?.currency)})`}
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="card-grid card-grid-4 mb-6">
        <div className="kpi-card green">
          <div className="kpi-label">This Month's Income</div>
          <div className="kpi-value green">{formatCurrency(summary.monthIncome, user?.currency)}</div>
          <span className="kpi-icon">📈</span>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">This Month's Expenses</div>
          <div className="kpi-value red">{formatCurrency(summary.monthExpense, user?.currency)}</div>
          <span className="kpi-icon">📉</span>
        </div>
        <div className={`kpi-card ${summary.monthBalance >= 0 ? 'blue' : 'red'}`}>
          <div className="kpi-label">Month Balance</div>
          <div className={`kpi-value ${summary.monthBalance >= 0 ? '' : 'red'}`}>
            {formatCurrency(summary.monthBalance, user?.currency)}
          </div>
          <span className="kpi-icon">⚖️</span>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-label">Total Net Worth</div>
          <div className="kpi-value">{formatCurrency(summary.totalBalance, user?.currency)}</div>
          <span className="kpi-icon">💰</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="card-grid card-grid-2 mb-6">
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
            📊 Monthly Income vs Expense
          </h3>
          {trendMonths.length > 0 ? (
            <Bar data={barData} options={chartOptions} />
          ) : (
            <div className="empty-state"><div className="icon">📊</div><p>No monthly data yet</p></div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
            🥧 Category Breakdown
          </h3>
          {categoryLabels.length > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div className="empty-state"><div className="icon">🥧</div><p>No category data yet</p></div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>🕐 Recent Transactions</h3>
        </div>
        {summary.recentTransactions?.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentTransactions.map((txn) => (
                  <tr key={txn._id}>
                    <td>{new Date(txn.date).toLocaleDateString('en-IN')}</td>
                    <td><strong>{txn.description || '—'}</strong></td>
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
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, user?.currency)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">💸</div>
            <p>No transactions yet. Add your first transaction!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
