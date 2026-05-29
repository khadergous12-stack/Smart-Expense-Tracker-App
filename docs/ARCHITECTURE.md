# 🏗 Architecture & Implementation Guide

## Text-Based Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════╗
║                    USER (Browser / Mobile)                       ║
╚══════════════════════════════════════════════════════════════════╝
                              │
                              │ HTTPS (localhost:3000 in dev)
                              ▼
╔══════════════════════════════════════════════════════════════════╗
║                   REACT FRONTEND (Port 3000)                     ║
║                                                                  ║
║  Pages:                     Components:                          ║
║  ┌─────────────┐            ┌─────────────┐                      ║
║  │  Login /    │            │   Sidebar   │ Navigation           ║
║  │  Register   │            │  AppLayout  │ Page shell           ║
║  ├─────────────┤            │ProtectedRoute│ Auth guard          ║
║  │  Dashboard  │            └─────────────┘                      ║
║  │  (KPIs +    │                                                  ║
║  │   Charts)   │  State: AuthContext (user, token)               ║
║  ├─────────────┤  Routing: React Router v6                       ║
║  │ Transactions│  HTTP: Axios (auto Bearer token injection)       ║
║  │ (CRUD)      │  Charts: Chart.js + react-chartjs-2             ║
║  ├─────────────┤  Notifications: React Toastify                  ║
║  │  Budgets    │                                                  ║
║  ├─────────────┤                                                  ║
║  │  Reports    │                                                  ║
║  └─────────────┘                                                  ║
╚══════════════════════════════════════════════════════════════════╝
                              │
                              │ REST API + JWT Bearer Token
                              │ JSON request/response
                              ▼
╔══════════════════════════════════════════════════════════════════╗
║               EXPRESS BACKEND (Port 5000)                        ║
║                                                                  ║
║  server.js → Routes → Middleware → Controllers → Models          ║
║                                                                  ║
║  Middleware:                                                      ║
║  ┌────────────────────┐  ┌──────────────────────────────────┐   ║
║  │  auth.js (protect) │  │  errorHandler.js (global errors) │   ║
║  └────────────────────┘  └──────────────────────────────────┘   ║
║                                                                  ║
║  Routes → Controllers:                                           ║
║  /api/auth        → authController     (register/login/me)       ║
║  /api/transactions→ transactionCtrl    (CRUD + summary)          ║
║  /api/budgets     → budgetController   (CRUD + alerts)           ║
║                                                                  ║
║  Workers:                                                        ║
║  ┌─────────────────────────────────────────────────────────┐    ║
║  │  node-cron (daily 6AM) → create recurring transactions  │    ║
║  └─────────────────────────────────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════╝
                              │
                              │ Mongoose ODM
                              ▼
╔══════════════════════════════════════════════════════════════════╗
║                      MONGODB DATABASE                            ║
║                                                                  ║
║  Collections:                                                    ║
║  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐  ║
║  │    users     │  │   transactions   │  │     budgets       │  ║
║  │              │  │                  │  │                   │  ║
║  │ _id          │  │ _id              │  │ _id               │  ║
║  │ name         │  │ user → users     │  │ user → users      │  ║
║  │ email        │  │ type (inc/exp)   │  │ category          │  ║
║  │ password     │  │ amount           │  │ amount            │  ║
║  │ currency     │  │ category         │  │ month             │  ║
║  │ createdAt    │  │ description      │  │ year              │  ║
║  └──────────────┘  │ date             │  │ alertThreshold    │  ║
║                    │ currency         │  └───────────────────┘  ║
║                    │ isRecurring      │                          ║
║                    │ recurringFreq    │                          ║
║                    └──────────────────┘                          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## API Flow (Request Lifecycle)

```
1. User clicks "Add Transaction" in React UI
   │
   ▼
2. React form submits → Axios POST /api/transactions
   Headers: { Authorization: "Bearer <jwt_token>" }
   Body: { type, amount, category, description, date }
   │
   ▼
3. Express receives request
   → CORS middleware ✓
   → express.json() parses body ✓
   → Router matches POST /api/transactions
   → auth middleware verifies JWT token
     → jwt.verify(token, JWT_SECRET)
     → Attaches user to req.user ✓
   │
   ▼
4. addTransaction controller runs
   → Validates input
   → suggestCategory(description) if no category
   → Transaction.create({ user: req.user.id, ... })
   │
   ▼
5. MongoDB writes document
   → Returns created document
   │
   ▼
6. Controller sends JSON response:
   { success: true, data: { ...transaction }, autoCategory: "Food" }
   │
   ▼
7. React receives response
   → Updates state via fetchTransactions()
   → Shows toast notification
   → Closes modal
```

---

## Database Flow (Dashboard Summary)

```
GET /api/transactions/summary

1. Find this month's transactions for user:
   Transaction.find({ user, date: { $gte: startOfMonth, $lte: endOfMonth } })

2. Compute in memory:
   monthIncome = sum(txns where type='income')
   monthExpense = sum(txns where type='expense')
   categoryBreakdown = { Food: 3200, Rent: 12000, ... }

3. Find last 6 months transactions:
   Transaction.find({ user, date: { $gte: sixMonthsAgo } })

4. Compute monthly trend:
   { "2026-01": { income: 45000, expense: 22000 }, ... }

5. Find all-time transactions:
   → totalIncome, totalExpense, totalBalance

6. Fetch recent 5 transactions

7. Return everything in one response
```

---

## Tech Stack Selection Rationale

### Option A: Easy
- Vanilla JS + PHP + MySQL
- ❌ Not industry-standard today

### Option B: Intermediate — ✅ SELECTED
- React + Node.js + Express + MongoDB + JWT
- ✅ Industry standard for startups & FinTech
- ✅ Hire-ready skills
- ✅ Beginner-accessible
- ✅ Great GitHub portfolio signal

### Option C: Advanced
- Next.js + tRPC + Prisma + PostgreSQL + Docker
- ❌ Steeper learning curve for beginners
- Good for senior-level portfolios

---

## Phase-Wise Implementation Plan

### Phase 1: Setup (Day 1 morning)
- Install Node.js, create-react-app
- Initialize Git repo
- Set up folder structure
- **Output**: Running blank React app + Node server

### Phase 2: Frontend Skeleton (Day 1 afternoon)
- Create all page components (empty)
- Set up React Router with all routes
- Create CSS design system (index.css)
- **Output**: Navigable app with empty pages

### Phase 3: Backend Bootstrap (Day 2 morning)
- Create Express server with CORS, Morgan
- Create .env and config/db.js
- Set up error handler middleware
- **Output**: Express server running on port 5000

### Phase 4: Database Models (Day 3)
- Write User, Transaction, Budget schemas
- Add validation, indexes, methods
- Run seeder to create demo data
- **Output**: MongoDB populated with test data

### Phase 5: Authentication (Day 4)
- Auth controller: register, login, getMe
- JWT generation and verification
- Auth middleware (protect)
- Login/Register pages connected to API
- **Output**: Working login flow with JWT

### Phase 6: Transaction CRUD (Day 5)
- Transaction controller with CRUD
- Auto-categorization logic
- Transaction routes connected to frontend
- Filter, pagination on list page
- **Output**: Full add/edit/delete working

### Phase 7: Budgets + Dashboard (Day 6)
- Budget controller with spending calculation
- Alert generation logic
- Dashboard summary endpoint
- Frontend dashboard KPIs
- Budget page with progress bars
- **Output**: Budgets working, dashboard showing data

### Phase 8: Charts + Polish (Day 7 morning)
- Chart.js integration
- Doughnut, Bar, Line charts on dashboard/reports
- Responsive mobile layout
- Toast notifications
- **Output**: Complete, polished app

### Phase 9: Testing (Day 7 afternoon)
- Test all API endpoints (Postman/Thunder Client)
- Test auth flow (register → login → protected routes → logout)
- Test budget alerts trigger correctly
- Verify on mobile screen
- **Output**: All features verified

### Phase 10: GitHub (Day 7 evening)
- Screenshot all pages
- Write commit history
- Push to GitHub
- Add repo description + topics
- **Output**: Live GitHub portfolio project

---

## Common Beginner Mistakes (and Fixes)

| Mistake | Fix |
|---|---|
| Committing `.env` to Git | Add to `.gitignore` before first commit |
| CORS errors | Add `proxy` in client `package.json` or configure CORS properly |
| MongoDB connection failing | Check MONGO_URI format, ensure MongoDB is running |
| JWT token not sent | Check Axios interceptor is set up, token is in localStorage |
| Chart.js blank on render | Ensure `ChartJS.register(...)` is called before usage |
| Budget alert not showing | Verify budget has same month/year as current date |
| Edit not working | Always check `transaction.user === req.user.id` authorization |
| Pagination broken | Make sure page resets to 1 when filters change |
