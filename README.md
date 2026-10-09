# Xpense — Modern Personal Finance & Budgeting Frontend

<p align="center">
  <strong>A modern, responsive, and intuitive personal finance dashboard designed for students, freelancers, and professionals.</strong>
</p>

---

## 🚀 Overview

**Xpense Frontend** is a Single Page Application (SPA) built with **React 18** and **Vite 5**. It delivers an interactive personal finance experience featuring multi-wallet management, envelope budgeting, gamified savings milestones, simulated instant payments, and rich financial health analytics.

The application supports both a dedicated **Java Spring Boot backend** and a standalone **client-side demo mode** with multiple user personas, making it easy to test, showcase, and deploy.

---

## ✨ Features

- **📊 Comprehensive Financial Dashboard**
  - Live balance aggregation across all active accounts.
  - Financial health badge and dynamic safe-to-spend calculations.
  - Student & Freelancer smart metrics (daily recommended budget, runway projection).
  - Quick actions for quick money transfers and expense logging.

- **👛 Wallets & Budget Envelopes**
  - Manage multiple accounts (Main Checking, High-Yield Savings, UPI Cash, Emergency Fund).
  - Category budget tracking with visual progress indicators and over-budget warnings.
  - Interactive "Add Money to Budget" allocation modals.
  - Account Swapper to seamlessly toggle between accounts.

- **🎯 Savings Goals & Gamified Milestones**
  - Target tracking with progress bars and deadline timelines.
  - Confetti celebration (`canvas-confetti`) when completing savings milestones.
  - Quick deposit and withdrawal actions directly linked to goals.

- **💳 Payments & Transfers**
  - Simulated instant peer-to-peer and UPI transfers.
  - Dynamic QR code generation for receiving funds.
  - Interactive payment confirmation dialogs.

- **📝 Categorized Transaction Management**
  - Full transaction history with search, category filtering, and sorting.
  - Modal for logging income, expenses, and inter-wallet transfers.

- **📈 Analytics & Insights**
  - Monthly cashflow analysis (Income vs. Expenses).
  - Category breakdown with visual charts and percentage distributions.
  - Recurring payment detection and subscription monitoring.

- **🎭 Persona Switcher (Demo Ready)**
  - Pre-configured demo profiles:
    - *Alex Rivera* — College Student (budgeting allowances, campus expenses).
    - *Priya Sharma* — Freelance Designer (variable income, tax reserves).
    - *Jordan Lee* — Tech Professional (investments, high savings rate).

- **📱 Fully Responsive Design**
  - Desktop: Collapsible sidebar navigation and top bar quick actions.
  - Mobile: Bottom tab navigation (`MobileTabBar`) tailored for touch devices.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visuals & Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti), [qrcode](https://www.npmjs.com/package/qrcode)
- **Styling**: Vanilla CSS with custom design tokens, dark/light theme variables, and glassmorphism accents.
- **Backend Integration**: REST API client with configurable base URL and Supabase fallback support.

---

## 📂 Project Structure

```
frontend/
├── index.html              # HTML entry point with web font preloads
├── package.json            # Scripts and dependencies
├── vite.config.js          # Vite configuration (port 5173, host enabled)
├── .env.example            # Sample environment variables
└── src/
    ├── main.jsx            # Application root mount
    ├── App.jsx             # Main router & layout container
    ├── app.css             # Component-level styles & design tokens
    ├── styles.css          # Global typography and base utility classes
    ├── components/
    │   ├── AppSidebar.jsx           # Desktop navigation sidebar
    │   ├── AppTopbar.jsx            # Desktop top status bar
    │   ├── MobileTabBar.jsx         # Mobile navigation bar
    │   ├── DashboardView.jsx        # Dashboard overview screen
    │   ├── WalletsView.jsx          # Accounts & budget envelope view
    │   ├── GoalsView.jsx            # Savings milestones view
    │   ├── TransactionsView.jsx     # Transaction history & search
    │   ├── PaymentsView.jsx         # QR & transfer interface
    │   ├── AnalyticsView.jsx        # Charts & breakdown view
    │   ├── SettingsView.jsx         # Profile and settings view
    │   ├── AccountSwapperModal.jsx  # Modal to switch active wallets
    │   ├── AddMoneyToBudgetModal.jsx# Envelope top-up modal
    │   ├── AddTransactionModal.jsx  # Expense/income creation modal
    │   └── ui/                      # Reusable atom components
    │       ├── AmountField.jsx
    │       ├── CategoryIcon.jsx
    │       ├── EmptyState.jsx
    │       ├── HealthBadge.jsx
    │       ├── Modal.jsx
    │       ├── PageHeader.jsx
    │       └── ProgressBar.jsx
    ├── context/
    │   └── AuthContext.jsx          # Authentication and user state
    ├── data/
    │   ├── personas.js              # Demo personas and mocked data sets
    │   └── demo.js                  # Sample transaction seeds
    ├── hooks/
    │   └── useAsync.js              # Asynchronous operation hook
    ├── lib/
    │   ├── format.js                # Currency, dates, and number formatters
    │   ├── studentMetrics.js        # Allowance & runway calculator logic
    │   └── supabase.js              # Optional Supabase client initialization
    └── services/
        ├── apiClient.js             # Base fetch wrapper with error handling
        ├── authService.js           # Auth endpoints
        ├── walletService.js         # Wallet & balance operations
        ├── transactionService.js    # Transaction CRUD
        ├── savingsGoalService.js    # Goals & deposits
        ├── budgetService.js         # Category envelopes
        ├── analyticsService.js      # Aggregated metrics
        └── reportService.js         # Export and report generation
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** (v18.x or higher recommended)
- **npm** or **yarn** / **pnpm**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tanush091/Xpense-frontend.git
   cd Xpense-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` as needed:
   ```ini
   # Java Spring Boot API Base URL (default)
   VITE_API_BASE_URL=http://localhost:8080/api

   # Optional: Supabase configuration
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

4. Start Development Server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Production Build

To build the application for production:

```bash
npm run build
```

To preview the built production bundle locally:

```bash
npm run preview
```

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
