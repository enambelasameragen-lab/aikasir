# 📜 CHANGELOG - AIKasir

All notable changes to AIKasir will be documented in this file.

---

## [Unreleased]
### Phase 4: Stok Barang (In Progress)
- Stock tracking feature for items
- Auto-deduct stock on sale
- Stock return on void transaction

---

## [2026-01-20] - Phase 4 Implementation

### Added
- **Item Model Stock Fields**
  - `track_stock`: boolean - enable/disable stock tracking per item
  - `stock`: int - current stock quantity
  - `low_stock_threshold`: int - alert threshold

- **Stock Adjustment System**
  - New `stock_adjustments` collection
  - Auto-create adjustment records on stock changes
  - Types: add, subtract, set, sale, void_return

- **Stock Management APIs**
  - `GET /api/v1/stock` - Stock summary with counts
  - `GET /api/v1/stock/alerts` - Low stock and out of stock alerts
  - `POST /api/v1/stock/{item_id}/adjust` - Manual stock adjustment
  - `GET /api/v1/stock/{item_id}/history` - Stock change history

- **Stock Page (Frontend)**
  - Summary cards (total tracked, low stock, out of stock)
  - Items table with stock status badges
  - Adjust stock modal (add/subtract/set)
  - Stock history modal

- **Items Page Updates**
  - "Lacak Stok" toggle when creating/editing items
  - Stock column in items table
  - Stock status indicators

- **Transaction Stock Integration**
  - Auto-deduct stock on sale (for tracked items)
  - Stock validation prevents sale if insufficient
  - Return stock on transaction void

### Changed
- Updated `Layout.js` to include "Stok" menu (owner only)
- Updated `App.js` with `/stock` route
- Updated `api/index.js` with stock-related functions
- Updated create/update item APIs to support stock fields

---

## [2026-01-20] - Phase 3: Cara Bayar & Laporan

### Added
- **Multiple Payment Methods**
  - Tunai (cash) with change calculation
  - QRIS with reference number
  - Transfer with reference number

- **Void Transaction**
  - Owner-only feature to cancel transactions
  - Reason tracking required
  - Status changes to "void"

- **Reports Page**
  - Summary cards (total, transactions, items sold, average)
  - Payment breakdown by method (pie/donut chart concept)
  - Top selling items list
  - Date range filters (Today, 7 Days, 30 Days)

- **Export Feature**
  - Export to CSV format
  - Export to JSON format

- **APIs Added**
  - `POST /api/v1/transactions/{id}/void`
  - `GET /api/v1/reports/summary`
  - `GET /api/v1/reports/daily`
  - `GET /api/v1/reports/export`

### Changed
- Updated `PaymentModal.js` with 3 payment method tabs
- Updated `HistoryPage.js` with void button (owner only)
- Updated transaction model with `payment_reference`

---

## [2026-01-20] - Phase 2: Toko Sendiri

### Added
- **Multi-User System**
  - Owner (pemilik) and Kasir roles
  - User status: active, invited, disabled

- **Invite System**
  - Generate invite link for new users
  - Accept invite page with password setup
  - Invite token expiration

- **Role-Based Access Control**
  - Menu filtering based on role
  - API endpoint protection
  - `ownerOnly` route wrapper

- **User Management Page**
  - List all users in tenant
  - Invite modal with name, email, role
  - User status badges

- **APIs Added**
  - `GET /api/v1/users`
  - `POST /api/v1/users/invite`
  - `GET /api/v1/users/invite/{token}`
  - `POST /api/v1/users/accept-invite`
  - `PUT /api/v1/users/{id}`
  - `DELETE /api/v1/users/{id}`
  - `GET /api/v1/settings`
  - `PUT /api/v1/settings`

### Changed
- Updated `Layout.js` with role-based menu filtering
- Updated `App.js` with protected routes

---

## [2026-01-20] - Phase 1: Bisa Jualan

### Added
- **AI Onboarding**
  - Conversational setup with OpenAI GPT-4o-mini
  - Auto-generate tenant, user, and items
  - Session management for multi-turn conversation

- **Authentication**
  - JWT-based authentication
  - Login endpoint
  - Password hashing with bcrypt

- **Items Management**
  - Create, read, update, delete items
  - Price in Indonesian Rupiah
  - Soft delete (is_active flag)

- **POS/Kasir**
  - Item grid with prices
  - Shopping cart with quantity management
  - Payment processing with change calculation

- **Transactions**
  - Transaction number generation (YYYYMMDD-XXX)
  - Receipt data in response
  - Transaction history by date

- **Dashboard**
  - Daily sales summary
  - Total transactions count
  - Top selling items

- **Core APIs**
  - `POST /api/v1/ai/onboard`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
  - `GET /api/v1/items`
  - `POST /api/v1/items`
  - `PUT /api/v1/items/{id}`
  - `DELETE /api/v1/items/{id}`
  - `GET /api/v1/transactions`
  - `POST /api/v1/transactions`
  - `GET /api/v1/transactions/{id}`
  - `GET /api/v1/dashboard/today`

---

## Database Schema History

### Initial (Phase 1)
```
tenants, users, items, transactions, ai_sessions
```

### Phase 2
```
+ invites collection (merged into users)
+ users.status, users.invite_token
```

### Phase 3
```
+ transactions.payment_method, payment_reference
+ transactions.status (selesai/void)
+ transactions.voided_at, voided_by, void_reason
```

### Phase 4
```
+ items.track_stock, stock, low_stock_threshold
+ stock_adjustments collection
```

---

## Upcoming

### Phase 5: Pelanggan & Promo
- Customer database
- Loyalty points system
- Promo/discount management

### Phase 6: Booking & Jadwal
- Service scheduling
- Booking calendar
- Order status tracking

---

*Format: [Date] - Phase/Version Name*
