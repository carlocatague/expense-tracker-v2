# Expense Tracker 2.0 — React + Supabase

A full-featured personal expense tracker rebuilt from PHP/MySQL to **React + Supabase**.

---

## Tech Stack

| Layer    | Details                    |
| -------- | -------------------------- |
| Frontend | React 18 + Vite            |
| Auth     | Supabase Auth (JWT)        |
| Database | Supabase (PostgreSQL)      |
| Charts   | Chart.js + react-chartjs-2 |
| Styling  | CSS Variables + custom     |

---

## Features

- 🔐 **Auth** — Register / Login / Logout via Supabase Auth
- 💸 **Expense CRUD** — Add, edit, delete expenses with title, amount, category, datetime
- 📊 **Statistics** — Daily / Weekly / Monthly / Yearly totals
- 📈 **Charts** — Bar chart with daily / weekly / monthly views
- 🔍 **Search** — Filter expenses by title, category, or amount
- 💱 **20 Currencies** — Per-user currency preference saved to Supabase
- 🌙 **Dark / Light Theme** — Persisted to localStorage
- 🔔 **Toast Notifications** — Feedback for every action

---

## Project Structure

```
expense-tracker/
├── index.html
├── vite.config.js
├── package.json
├── schema.sql              ← Run in Supabase SQL Editor
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx             ← Root: auth routing + theme
    ├── supabase.js         ← Supabase client
    ├── index.css           ← Global styles & design tokens
    ├── hooks/
    │   ├── useExpenses.js  ← All CRUD + stats + chart data
    │   └── useToast.js
    ├── pages/
    │   ├── Auth.jsx        ← Login / Register
    │   └── Dashboard.jsx   ← Main app shell
    └── components/
        ├── StatsCards.jsx
        ├── ExpenseForm.jsx
        ├── ExpenseChart.jsx
        ├── ExpenseTable.jsx
        └── Toast.jsx
```
