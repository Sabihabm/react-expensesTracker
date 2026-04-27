# 💰 Spendly — Expense Tracker

A clean, modern expense tracker built with React. Track your income and expenses, visualize spending by category, and stay on top of your finances — all in one place.

---

## 🚀 Features

### Dashboard
- Net balance, total income, and total expenses at a glance
- Donut chart showing spending breakdown by category
- Recent activity feed with the latest transactions

### Transactions
- Full list of all income and expense entries
- Search transactions by name
- Filter by type — All, Income, or Expense
- Filter by category (Food, Transport, Shopping, Health, Entertainment, Housing, Education, Other)
- Edit or delete any transaction

### Analytics
- Bar chart showing spending per category with percentage of total
- Financial summary: savings rate, largest expense, average transaction, top category
- Income vs. Expenses comparison panel

---

## 📂 Categories

| Icon | Category      |
|------|---------------|
| 🍜   | Food          |
| 🚗   | Transport     |
| 🛍️   | Shopping      |
| 💊   | Health        |
| 🎬   | Entertainment |
| 🏠   | Housing       |
| 📚   | Education     |
| 📦   | Other         |

---

## 🖥️ Tech Stack

- **React** — UI and state management
- **CSS-in-JS** — Inline styles with a global `<style>` tag for animations
- **Google Fonts** — Syne (headings) + Plus Jakarta Sans (body)
- **Custom SVG Donut Chart** — Built from scratch, no external chart library

---

## 📁 Project Structure

```
expense-tracker.jsx    # Single-file React component (all logic + UI)
README.md              # This file
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- A React project (Vite, Create React App, or Next.js)

### Installation

1. Copy `expense-tracker.jsx` into your project's `src/` folder.

2. Install dependencies (if not already present):

```bash
npm install react react-dom
```

3. Import and render the component in your entry file:

```jsx
// src/main.jsx or src/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import ExpenseTracker from "./expense-tracker";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ExpenseTracker />
  </React.StrictMode>
);
```

4. Start your dev server:

```bash
npm run dev
```

---

## 🧩 Adding a Transaction

1. Click the **+ Add Entry** button in the sidebar or top-right header.
2. Toggle between **Income** or **Expense**.
3. Fill in the fields:
   - **Label** — name of the transaction (required)
   - **Amount** — numeric value (required)
   - **Date** — defaults to today
   - **Category** — pick from 8 categories
   - **Note** — optional memo
4. Click **Add Income** or **Add Expense** to save.

---

## ✏️ Editing a Transaction

1. Go to the **Transactions** tab.
2. Click the **✎** (edit) icon on any transaction row.
3. Update the fields in the modal and click **Save Changes**.

---

## 🗑️ Deleting a Transaction

On the **Transactions** tab, click the **✕** (delete) icon on any row. The transaction is removed immediately.

---

## 📊 Understanding the Analytics Page

| Metric | Description |
|---|---|
| Savings Rate | `(Balance / Total Income) × 100` — how much of your income you're saving |
| Largest Expense | The single highest expense transaction |
| Avg Transaction | Total expenses divided by number of expense entries |
| Top Category | The category with the highest total spending |

---

## 🎨 Customization

### Change the currency

Find the `fmt` helper near the top of the file and update the `currency` option:

```js
const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // ← change to "EUR", "INR", "GBP", etc.
    minimumFractionDigits: 2,
  }).format(n);
```

### Add a new category

Add an entry to the `CATEGORIES` object:

```js
const CATEGORIES = {
  // existing categories...
  Fitness: { icon: "🏋️", color: "#84cc16" },
};
```

### Change the color theme

The red accent color (`#f43f5e` for expenses, `#10b981` for income) is used inline throughout. Search and replace these hex values to retheme the app.

---

## 📦 Data Persistence

By default, data lives in React component state and resets on page refresh. To persist data across sessions, connect to a storage layer:

**Option 1 — localStorage (simple)**
```js
const [transactions, setTransactions] = useState(() => {
  const saved = localStorage.getItem("spendly_transactions");
  return saved ? JSON.parse(saved) : INITIAL;
});

useEffect(() => {
  localStorage.setItem("spendly_transactions", JSON.stringify(transactions));
}, [transactions]);
```

**Option 2 — Backend API**
Replace `useState(INITIAL)` with a `useEffect` that fetches from your REST API, and update the `setTransactions` calls to also `POST`/`PUT`/`DELETE` to the server.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## 🙌 Credits

Built with React + Google Fonts (Syne & Plus Jakarta Sans). Designed for clarity and ease of use.
