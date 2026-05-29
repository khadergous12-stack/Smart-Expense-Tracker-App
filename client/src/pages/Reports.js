// src/pages/Reports.js
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { getSummary, getTransactions } from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler);

const CATEGORY_COLORS = {
  Food:'#f59e0b', Rent:'#8b5cf6', Travel:'#3b82f6', Shopping:'#ec4899',
  Bills:'#f43f5e', Education:'#06b6d4', Healthcare:'#10d884', Entertainment:'#ff6b35',
  Salary:'#10d884', Freelance:'#3b82f6', Investment:'#8b5cf6', Other:'#6b7280',
};

const formatCurrency = (amount, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] || currency} ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const chartBaseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        color: '#e8edf5',
        font: { family: 'DM Sans', size: 12, weight: '500' },
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 16
      }
    },
    tooltip: {
      backgroundColor: '#151d2e',
      titleColor: '#e8edf5',
      bodyColor: '#8899b0',
      borderColor: '#1e2d45',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
      usePointStyle: true,
      boxWidth: 8,
      boxHeight: 8,
      bodyFont: { family: 'DM Sans', size: 13 },
      titleFont: { family: 'Syne', size: 13, weight: 'bold' }
    }
  },
  scales: {
    x: {
      ticks: { color: '#8899b0', font: { size: 11, family: 'DM Sans' } },
      grid: { display: false }
    },
    y: {
      ticks: {
        color: '#8899b0',
        font: { size: 11, family: 'DM Sans' },
        callback: (val) => '₹' + Number(val).toLocaleString('en-IN')
      },
      grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }
    },
  },
};

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSummary();
        setSummary(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!summary) return null;

  // Category Doughnut
  const catLabels = Object.keys(summary.categoryBreakdown || {});
  const catValues = Object.values(summary.categoryBreakdown || {});
  const doughnutData = {
    labels: catLabels,
    datasets: [{
      data: catValues,
      backgroundColor: catLabels.map(l => CATEGORY_COLORS[l] || '#6b7280'),
      borderColor: '#151d2e',
      borderWidth: 3,
    }],
  };

  // Monthly Trend
  const months = Object.keys(summary.monthlyTrend || {}).sort();
  const monthLabels = months.map(m => {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  });

  const trendBarData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Income',
        data: months.map(m => summary.monthlyTrend[m]?.income || 0),
        backgroundColor: 'rgba(16, 216, 132, 0.8)',
        borderColor: '#10d884',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
      },
      {
        label: 'Expense',
        data: months.map(m => summary.monthlyTrend[m]?.expense || 0),
        backgroundColor: 'rgba(244, 63, 94, 0.8)',
        borderColor: '#f43f5e',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
      },
    ],
  };

  const barData = {
    labels: monthLabels,
    datasets: [{
      label: 'Net Savings',
      data: months.map(m => (summary.monthlyTrend[m]?.income || 0) - (summary.monthlyTrend[m]?.expense || 0)),
      backgroundColor: months.map(m =>
        (summary.monthlyTrend[m]?.income || 0) - (summary.monthlyTrend[m]?.expense || 0) >= 0
          ? 'rgba(16,216,132,0.7)'
          : 'rgba(244,63,94,0.7)'
      ),
      borderRadius: 8,
    }],
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Your 6-month financial picture</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="card-grid card-grid-3 mb-6">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📥</div>
          <div className="kpi-label">Total Income (Ever)</div>
          <div className="kpi-value text-green" style={{ fontSize: 20 }}>
            {formatCurrency(summary.totalIncome, user?.currency)}
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📤</div>
          <div className="kpi-label">Total Expenses (Ever)</div>
          <div className="kpi-value text-red" style={{ fontSize: 20 }}>
            {formatCurrency(summary.totalExpense, user?.currency)}
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💼</div>
          <div className="kpi-label">Net Worth</div>
          <div className={`kpi-value ${summary.totalBalance >= 0 ? 'text-green' : 'text-red'}`} style={{ fontSize: 20 }}>
            {formatCurrency(summary.totalBalance, user?.currency)}
          </div>
        </div>
      </div>

      {/* Grouped Bar Chart */}
      <div className="card mb-6">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>📊 Income vs Expense Comparison</h3>
        {months.length > 0 ? (
          <div style={{ height: 350, position: 'relative' }}>
            <Bar data={trendBarData} options={chartBaseOptions} />
          </div>
        ) : (
          <div className="empty-state"><div className="icon">📊</div><p>No data to display yet</p></div>
        )}
      </div>

      <div className="card-grid card-grid-2 mb-6">
        {/* Bar Chart — Net Savings */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>💰 Monthly Savings</h3>
          {months.length > 0 ? (
            <div style={{ height: 260, position: 'relative' }}>
              <Bar data={barData} options={chartBaseOptions} />
            </div>
          ) : (
            <div className="empty-state"><div className="icon">💰</div><p>No data</p></div>
          )}
        </div>

        {/* Doughnut */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>🥧 This Month's Spending</h3>
          {catLabels.length > 0 ? (
            <div style={{ height: 260, position: 'relative' }}>
              <Doughnut data={doughnutData} options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#8899b0', font: { family: 'DM Sans', size: 11 }, padding: 10 },
                  },
                },
              }} />
            </div>
          ) : (
            <div className="empty-state"><div className="icon">🥧</div><p>No spending this month</p></div>
          )}
        </div>
      </div>

      {/* Category Table */}
      {catLabels.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📋 Category Breakdown (This Month)</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Amount Spent</th>
                  <th className="text-right">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {catLabels
                  .sort((a, b) => summary.categoryBreakdown[b] - summary.categoryBreakdown[a])
                  .map(cat => {
                    const pct = ((summary.categoryBreakdown[cat] / summary.monthExpense) * 100).toFixed(1);
                    return (
                      <tr key={cat}>
                        <td>
                          <span className="category-pill" style={{ color: CATEGORY_COLORS[cat] || 'var(--text-muted)' }}>
                            {cat}
                          </span>
                        </td>
                        <td className="text-right">
                          <strong>{formatCurrency(summary.categoryBreakdown[cat], user?.currency)}</strong>
                        </td>
                        <td className="text-right">
                          <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
