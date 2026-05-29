# 🎤 Interview Preparation — Smart Expense Tracker

## 10 Interview Questions & Answers

---

### Q1. Explain your Smart Expense Tracker Web App project.

**HR / Simple Answer:**
"I built a full-stack web application called SpendWise that helps users manage their personal finances. Users can register, log in securely, and then track all their income and expenses in one place. The app categorizes spending automatically, allows setting monthly budgets with alerts when limits are crossed, and shows visual charts of spending patterns. It's similar to apps like Walnut or Mint."

**Technical Answer:**
"I built a MERN stack application — React.js on the frontend with React Router, Chart.js for visualization, and Axios for API calls. The backend is Express.js on Node.js, MongoDB with Mongoose for the database, and JWT for stateless authentication. Key features include full CRUD for transactions, keyword-based auto-categorization, budget tracking with real-time spending percentages, a cron worker for recurring transactions, and a dashboard with monthly KPIs and 6-month trend charts."

---

### Q2. What problem does this project solve?

**HR Answer:**
"Most people have no idea where their money goes each month. This app makes every transaction visible, organized, and easy to analyze — helping users control spending, stick to budgets, and build savings habits."

**Technical Answer:**
"The core problem is unstructured financial data. By normalizing transactions into typed records (income/expense) with categories and dates, we unlock aggregation queries — monthly summaries, category breakdowns, trend analysis — that turn raw data into actionable insights."

---

### Q3. What tech stack did you use and why?

**Answer:**
"I chose the MERN stack because:
- **MongoDB**: Flexible schema for financial records that may have different fields
- **Express.js**: Lightweight, unopinionated API framework perfect for REST APIs
- **React.js**: Component-based UI with Context API for state management
- **Node.js**: Same language front-to-back reduces context switching

I added Chart.js for data visualization, JWT for stateless auth (scales well), and node-cron for automated recurring entries."

---

### Q4. How did you implement JWT authentication?

**Technical Answer:**
"On registration/login, the backend hashes the password with bcryptjs (salt rounds: 10), then signs a JWT containing `{id, email}` with `JWT_SECRET` and 7-day expiry. The frontend stores this token in localStorage. Every Axios request attaches it via an interceptor as `Authorization: Bearer <token>`. The Express `protect` middleware verifies the token on every protected route and attaches the user object to `req.user`. On 401 responses, the Axios interceptor auto-clears localStorage and redirects to login."

---

### Q5. What database collections (schemas) did you design?

**Answer:**
"Three main schemas:
1. **User** — name, email, hashed password, currency preference. Email is unique-indexed.
2. **Transaction** — userId (ref), type (income/expense), amount, category (enum), description, date, currency, recurring flags. Indexed on `{user, date}` for fast dashboard queries.
3. **Budget** — userId, category, amount, month, year, alertThreshold. Compound unique index on `{user, category, month, year}` so we can upsert instead of checking existence."

---

### Q6. Explain your auto-categorization logic.

**Answer:**
"I implemented a keyword-rules engine in the transaction controller. When a user submits a transaction with a description but no category, the `suggestCategory()` function loops through a rules array like: `{keywords: ['zomato','swiggy','cafe'], category: 'Food'}`. It lowercases the description and checks for keyword inclusion. If matched, the category is auto-assigned and returned to the frontend as `autoCategory` in the response. It's simple but effective — covers 90% of common cases without any ML dependency. The next step would be a TF-IDF classifier on historical user data."

---

### Q7. How did you implement the budget alert system?

**Answer:**
"The `getBudgets` controller fetches all budgets for the current month, then queries all expense transactions in that date range. It builds a `spendingMap` — an object keyed by category summing amounts. Each budget is enriched with `spent`, `percentage`, `remaining`, `alert` (percentage >= threshold), and `exceeded` (spent > amount). The frontend renders color-coded progress bars and inline alert banners. The `/api/budgets/alerts` endpoint returns only triggered alerts, used by the dashboard header to show warnings immediately on login."

---

### Q8. What CRUD operations are in this project?

**Answer:**
"Full CRUD on both Transactions and Budgets:
- **Create**: `POST /api/transactions`, `POST /api/budgets`
- **Read**: `GET /api/transactions` (paginated, filtered), `GET /api/transactions/summary`, `GET /api/budgets`
- **Update**: `PUT /api/transactions/:id`, `POST /api/budgets` (upsert)
- **Delete**: `DELETE /api/transactions/:id`, `DELETE /api/budgets/:id`

Authorization is enforced: every write operation checks `transaction.user === req.user.id` before allowing edits/deletes."

---

### Q9. What challenges did you face?

**Answer:**
"Three main challenges:
1. **Monthly summary aggregation**: Computing income/expense totals and category breakdowns efficiently. Solved by fetching all month transactions once and reducing in memory rather than running multiple DB queries.
2. **Pagination + filters together**: Combining `type`, `category`, `startDate`, `endDate` filters with page/limit required building a dynamic filter object carefully.
3. **Avoiding token lock-out**: If the JWT expired during a session, every API call would fail silently. Solved with an Axios response interceptor that catches 401s globally and redirects to login."

---

### Q10. How would you improve or extend this project?

**Answer:**
"Several directions:
- **Bank CSV import**: Parse uploaded bank statements and auto-import transactions (multer + csv-parser)
- **Email alerts**: Nodemailer integration to send budget warnings via email
- **AI spending insights**: Use OpenAI API to give personalized saving tips based on spending patterns
- **OAuth login**: Google/GitHub login via Passport.js
- **Mobile app**: React Native version sharing the same backend
- **Docker deployment**: Containerize with docker-compose for easy hosting on AWS/GCP
- **Export reports**: PDF/Excel export of monthly statements"

---

## 💡 Quick Pitch (30 seconds for HR)

> "I built SpendWise, a full-stack expense tracking web app using React, Node.js, Express, and MongoDB. It lets users log income and expenses, auto-categorizes them using keyword rules, tracks monthly budgets with real-time alerts, and displays spending trends using Chart.js visualizations. I implemented JWT authentication, a REST API with full CRUD, and a cron job for recurring transactions. This project demonstrates my ability to build complete, production-ready web applications — frontend, backend, database, and deployment-ready."
