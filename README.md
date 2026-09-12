# LUFO Clothing CRM — Haute Couture & Boutique Management System

A CRM built specifically for **LUFO Clothing** with a luxury atelier dark-mode aesthetic, automatic tax bill/invoice generator, apparel-variant stock control, and real-time expense & profit analytics.

---

## 💎 Features & Capabilities

### 1. 📊 Executive Dashboard
- **Real-Time KPIs**: Total Gross Sales Revenue, Total Client Orders, Total Apparel Stock Value, Operating Overheads, Net Operating Profit & Profit Margin %.
- **Financial Trajectory**: Interactive monthly Revenue vs. Expense velocity area chart.
- **Cost Distribution**: Categorical donut chart breakdown for business expenditures.
- **Live Stock Alerts**: Instant alerts for inventory dipping below minimum threshold with 1-click restock.
- **Recent Orders Feed**: Quick view of latest boutique sales and instant printable bills.

### 2. 🛍️ Orders & Auto-Bill Generation
- **Auto Generated Bill Number**: Consecutive serial bills (e.g. `LUFO-ORD-2026-1001`).
- **Client Profile**: Full Name, Phone, Delivery/Billing Address, Email.
- **Stock-Linked Line Items**: Pick apparel directly from active inventory with live pricing, size/variant matrix, automatic stock deduction, and restock on order cancellation.
- **Luxury Tax Invoice**: Boutique printable bill template with LUFO branding, GST calculations, discounts, and print-to-PDF support.
- **Status Pipeline**: `Pending` ➔ `Processing` ➔ `Shipped` ➔ `Delivered` ➔ `Cancelled`.

### 3. 📦 Stock & Inventory Management
- **Clothing Attributes**: Name, SKU (with auto-generation), Category (Shirts, T-Shirts, Trousers, Denim, Blazers, Dresses, Hoodies, Accessories), Size (XS–3XL), Color, Fabric, Cost Price, Selling Price.
- **Profit Margin Tracking**: Real-time markup percentage preview per unit.
- **Fast Stock Adjustment**: Quick +/- inventory increments/deductions with reason logging.
- **Search & Filter**: Filter by category or search by SKU, fabric, and title.

### 4. 💸 Expense & Cost Management
- **Categorization**: Raw Materials & Fabric, Tailoring & Stitching, Logistics & Courier, Packaging & Luxury Tags, Marketing & Ads, Store Rent, Staff Salaries, Utilities.
- **Financial Visibility**: Live net profit margin deduction against sales.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Recharts, Canvas-Confetti, Vite
- **Backend**: Node.js, Express.js, Mongoose, CORS, Dotenv
- **Database**: MongoDB with built-in resilient in-memory fallback store

---

## 🚀 How to Run Locally

### 1. Start the Backend API Server
```bash
cd server
npm start
```
The server will run on **http://localhost:5000**.

### 2. Start the Frontend Client
In a separate terminal:
```bash
cd client
npm run dev
```
The client will launch at **http://localhost:5173**.

---

## 📡 API Endpoints

- `GET /api/dashboard/stats` — Summary KPIs, charts, low stock alerts, recent orders.
- `GET /api/orders` — Filterable orders list.
- `GET /api/orders/next-bill-number` — Fetch next sequential bill ID.
- `POST /api/orders` — Create new order and auto-allocate stock.
- `PATCH /api/orders/:id/status` — Update order progress or cancel (with restock).
- `GET /api/stocks` — Inventory list with size/category filters.
- `POST /api/stocks` — Create apparel item.
- `PATCH /api/stocks/:id/adjust` — Quick +/- stock quantity adjustment.
- `GET /api/expenses` — Expense registry.
- `POST /api/expenses` — Log new operating cost.
