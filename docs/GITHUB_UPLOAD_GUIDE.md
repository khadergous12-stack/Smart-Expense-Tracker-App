# 🐙 GitHub Upload Guide

## Best Repository Details

- **Repo Name**: `Smart-Expense-Tracker-Web-App`
- **Description**: "Full-stack MERN expense tracker — track income/expenses, auto-categorize, set budgets, visualize with charts | React + Node.js + MongoDB + JWT"
- **Topics/Tags**: `mern-stack` `expense-tracker` `react` `nodejs` `mongodb` `personal-finance` `full-stack` `portfolio-project` `jwt-auth` `chart-js` `fintech` `open-source`
- **Visibility**: Public (for portfolio proof-of-work)

---

## Step-by-Step Upload

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `Smart-Expense-Tracker-Web-App`
3. Add description (from above)
4. Select **Public**
5. **Do NOT** initialize with README (we have one)
6. Click **Create repository**

### 2. Initialize & Push

```bash
cd Smart-Expense-Tracker-Web-App

# Initialize git
git init

# Add all files
git add .

# ⚠️ CHECK: Make sure .env files are NOT included
git status  # Verify no .env appears in the list

# First commit
git commit -m "feat: initial commit — Smart Expense Tracker full-stack MERN app"

# Link to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/Smart-Expense-Tracker-Web-App.git

# Push
git branch -M main
git push -u origin main
```

### 3. Recommended Commit Sequence (Day by Day)

```bash
# Day 1
git commit -m "feat: setup React app with routing and auth pages"

# Day 2  
git commit -m "feat: bootstrap Express server with JWT auth endpoints"

# Day 3
git commit -m "feat: add MongoDB schemas for User, Transaction, Budget"

# Day 4
git commit -m "feat: implement JWT authentication with bcrypt password hashing"

# Day 5
git commit -m "feat: add full CRUD for transactions with auto-categorization"

# Day 6
git commit -m "feat: add budget tracking with alerts and dashboard summary"

# Day 7
git commit -m "feat: integrate Chart.js charts and polish responsive UI"
git commit -m "docs: add README, interview prep, and GitHub setup guide"
```

---

## ⚠️ Critical: Never Upload .env

```bash
# Verify .env is ignored before pushing
cat .gitignore | grep .env

# If you accidentally committed .env:
git rm --cached server/.env
git rm --cached client/.env
git commit -m "chore: remove accidentally committed .env files"
```

Always provide `.env.example` files instead (already done in this project).

---

## Screenshots to Upload to /docs/

Take screenshots of these pages and save to `docs/` folder:

| File | Page to Screenshot |
|---|---|
| `docs/login.png` | Login page |
| `docs/register.png` | Register page |
| `docs/dashboard.png` | Dashboard (with charts) |
| `docs/transactions.png` | Transactions list |
| `docs/add-transaction.png` | Add transaction modal (open) |
| `docs/budgets.png` | Budgets page with progress bars |
| `docs/reports.png` | Reports/analytics page |
| `docs/budget-alert.png` | Dashboard with alert showing |
| `docs/mongodb.png` | MongoDB Compass screenshot of data |
| `docs/api-test.png` | Postman/Thunder Client API test |

---

## GitHub Profile Boost Tips

1. **Pin this repo** on your GitHub profile
2. Add a `CONTRIBUTING.md` to look professional
3. Enable **GitHub Pages** for frontend demo (optional)
4. Add **badges** to README (already included)
5. Keep commit history clean with clear messages
6. Respond to any issues to show engagement
