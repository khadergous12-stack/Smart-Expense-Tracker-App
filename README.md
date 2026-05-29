# 💰 SpendWise — Smart Expense Tracker Web App

![SpendWise Banner](https://via.placeholder.com/1200x400/0b0f1a/10d884?text=SpendWise+%E2%80%94+Smart+Expense+Tracker)

> A full-stack MERN personal finance tracker — track income, expenses, budgets, and visualize spending with beautiful charts.

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/Smart-Expense-Tracker-Web-App?style=flat-square&color=10d884)](https://github.com/yourusername/Smart-Expense-Tracker-Web-App)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](./CONTRIBUTING.md)

---

## 📖 Problem Statement

Most people don't know where their money goes. Without visibility into spending patterns, it's impossible to save, plan, or make informed financial decisions. **SpendWise** solves this by giving you a clean, organized dashboard of every rupee — categorized, visualized, and budget-tracked.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 JWT Authentication | Secure register/login with token-based auth |
| ➕ Add Transactions | Add income & expenses with category, date, description |
| ✏️ Edit / Delete | Full CRUD on all transactions |
| 🤖 Auto-Categorization | Keyword-based smart category suggestion |
| 🎯 Budget Tracking | Set monthly budgets per category with % tracking |
| 🚨 Budget Alerts | Warnings when spending approaches/exceeds limits |
| 📊 Dashboard KPIs | Monthly income, expense, balance, net worth |
| 🥧 Doughnut Charts | Category-wise spending breakdown |
| 📈 Trend Charts | 6-month income vs expense bar/line charts |
| 🔄 Recurring Expenses | Mark transactions as daily/weekly/monthly recurring |
| 💱 Multi-Currency | INR, USD, EUR, GBP support |
| 📱 Responsive UI | Works on desktop and mobile |
| ⏰ Cron Worker | Auto-creates recurring transactions daily at 6 AM |

---

## 🛠 Tech Stack

**Frontend:**
- React.js 18 with React Router v6
- Chart.js + react-chartjs-2 (Doughnut, Bar, Line charts)
- React Toastify for notifications
- Custom CSS design system (Dark fintech theme)
- Axios for API calls

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT Authentication (jsonwebtoken)
- bcryptjs for password hashing
- node-cron for recurring transaction jobs
- Morgan for HTTP logging

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React Frontend (Port 3000)                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Dashboard│ │Transactions│ │ Budgets  │ │   Reports    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│         │ Axios + JWT Bearer Token                           │
└─────────┼───────────────────────────────────────────────────┘
          ↓ REST API
┌─────────────────────────────────────────────────────────────┐
│  Express Backend (Port 5000)                                 │
│  ┌─────────────┐ ┌────────────────┐ ┌──────────────────┐   │
│  │ /api/auth   │ │/api/transactions│ │  /api/budgets    │   │
│  └─────────────┘ └────────────────┘ └──────────────────┘   │
│        │ Mongoose ODM                                         │
└────────┼────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  MongoDB                                                      │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  Users   │ │ Transactions │ │   Budgets    │            │
│  └──────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
Smart-Expense-Tracker-Web-App/
│
├── client/                         # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js          # Navigation sidebar
│   │   │   ├── AppLayout.js        # Layout wrapper
│   │   │   └── ProtectedRoute.js   # Auth guard
│   │   ├── context/
│   │   │   └── AuthContext.js      # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.js            # Sign in page
│   │   │   ├── Register.js         # Sign up page
│   │   │   ├── Dashboard.js        # KPIs + Charts
│   │   │   ├── Transactions.js     # CRUD transactions
│   │   │   ├── Budgets.js          # Budget management
│   │   │   └── Reports.js          # Analytics charts
│   │   ├── services/
│   │   │   └── api.js              # Axios API layer
│   │   ├── App.js                  # Router root
│   │   ├── index.js                # React entry
│   │   └── index.css               # Design system CSS
│   └── package.json
│
├── server/                         # Express Backend
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── seeder.js               # Demo data seeder
│   ├── controllers/
│   │   ├── authController.js       # Auth logic
│   │   ├── transactionController.js# Transaction CRUD + summary
│   │   └── budgetController.js     # Budget CRUD + alerts
│   ├── middleware/
│   │   ├── auth.js                 # JWT protection
│   │   └── errorHandler.js         # Global error handler
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   ├── Transaction.js          # Transaction schema
│   │   └── Budget.js               # Budget schema
│   ├── routes/
│   │   ├── auth.js                 # Auth endpoints
│   │   ├── transactions.js         # Transaction endpoints
│   │   └── budgets.js              # Budget endpoints
│   ├── server.js                   # Main Express server
│   ├── .env.example
│   └── package.json
│
├── docs/                           # Screenshots & docs
├── .gitignore
└── README.md
```

---

## 🚀 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth? |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login, get JWT token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |

### Transactions
| Method | Endpoint | Description | Auth? |
|---|---|---|---|
| GET | `/api/transactions` | Get all transactions (paginated, filterable) | Yes |
| POST | `/api/transactions` | Add new transaction | Yes |
| PUT | `/api/transactions/:id` | Update transaction | Yes |
| DELETE | `/api/transactions/:id` | Delete transaction | Yes |
| GET | `/api/transactions/summary` | Dashboard summary + charts data | Yes |

### Budgets
| Method | Endpoint | Description | Auth? |
|---|---|---|---|
| GET | `/api/budgets` | Get all budgets with spending % | Yes |
| POST | `/api/budgets` | Create/update a budget | Yes |
| DELETE | `/api/budgets/:id` | Delete a budget | Yes |
| GET | `/api/budgets/alerts` | Get triggered budget alerts | Yes |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+ — [Download](https://nodejs.org)
- MongoDB — [Download](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://www.mongodb.com/atlas)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/Smart-Expense-Tracker-Web-App.git
cd Smart-Expense-Tracker-Web-App
```

### 2. Backend Setup

```bash
cd server
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET

npm run dev     # Development with nodemon
# OR
npm start       # Production
```

### 3. Frontend Setup

```bash
cd client
npm install

cp .env.example .env
# Edit .env if your API is not on port 5000

npm start       # Opens at http://localhost:3000
```

### 4. (Optional) Seed Demo Data

```bash
cd server
node config/seeder.js
```

Demo credentials: `demo@spendwise.com` / `demo123`

### Environment Variables

**server/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-expense-tracker
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

**client/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🎓 Learning Outcomes

After building this project you will understand:
- Full-stack MERN development workflow
- JWT-based authentication (register → token → protected routes)
- RESTful API design and implementation
- MongoDB schema design with Mongoose
- React Context API for global state
- React Router v6 for client-side navigation
- Chart.js integration for data visualization
- Responsive CSS design system from scratch
- Auto-categorization with keyword matching
- Cron jobs for recurring automation
- Environment variable management
- GitHub project structure and documentation

---

## 🗓 7-Day Build Plan

| Day | Task | Commit Message |
|---|---|---|
| 1 | React setup + auth pages | `feat: setup React app with login/register UI` |
| 2 | Express server + routes | `feat: setup Express server with auth endpoints` |
| 3 | MongoDB models | `feat: add User, Transaction, Budget schemas` |
| 4 | JWT auth working | `feat: implement JWT authentication flow` |
| 5 | Transaction CRUD | `feat: add full CRUD for transactions with pagination` |
| 6 | Budgets + Dashboard | `feat: add budget tracking and dashboard summary` |
| 7 | Charts + Polish + GitHub | `feat: integrate Chart.js and finalize UI` |

---

## 📜 License

MIT © 2026 — Build freely, learn openly.

---

## ⭐ Show Support

If this project helped you, please give it a ⭐ on GitHub! It motivates continued improvement.

```
