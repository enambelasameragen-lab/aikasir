# 📁 STRUKTUR FOLDER & FILE

## Overview Struktur Project

```
/app
├── memory/
│   └── PRD.md                    # Product Requirements Document
│
├── backend/
│   ├── server.py                 # Main FastAPI application
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables
│   │
│   ├── config/
│   │   └── database.py           # MongoDB connection
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── tenant.py             # Tenant/Toko model
│   │   ├── user.py               # User model
│   │   ├── item.py               # Barang model
│   │   └── transaction.py        # Transaksi model
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── ai.py                 # AI onboarding endpoints
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── items.py              # Items CRUD endpoints
│   │   ├── transactions.py       # Transactions endpoints
│   │   └── dashboard.py          # Dashboard/ringkasan endpoints
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py         # OpenAI integration
│   │   └── auth_service.py       # JWT & password handling
│   │
│   └── utils/
│       ├── __init__.py
│       └── helpers.py            # Utility functions
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── .env
│   │
│   ├── public/
│   │   └── index.html
│   │
│   └── src/
│       ├── index.js              # Entry point
│       ├── index.css             # Global styles
│       ├── App.js                # Main App component
│       ├── App.css               # App styles
│       │
│       ├── api/
│       │   └── index.js          # API client & endpoints
│       │
│       ├── contexts/
│       │   ├── AuthContext.js    # Authentication state
│       │   └── CartContext.js    # Shopping cart state
│       │
│       ├── pages/
│       │   ├── OnboardingPage.js # AI chat onboarding
│       │   ├── LoginPage.js      # Login screen
│       │   ├── POSPage.js        # Main POS/kasir screen
│       │   ├── ItemsPage.js      # Manage items
│       │   ├── HistoryPage.js    # Transaction history
│       │   └── DashboardPage.js  # Daily summary
│       │
│       └── components/
│           ├── Layout/
│           │   ├── Navbar.js     # Navigation bar
│           │   └── Sidebar.js    # Side menu
│           │
│           ├── POS/
│           │   ├── ItemGrid.js   # Grid of items to sell
│           │   ├── Cart.js       # Shopping cart
│           │   ├── PaymentModal.js # Payment dialog
│           │   └── Receipt.js    # Receipt/struk display
│           │
│           ├── Items/
│           │   ├── ItemList.js   # List of items
│           │   ├── ItemForm.js   # Add/edit item form
│           │   └── ItemCard.js   # Single item card
│           │
│           ├── Dashboard/
│           │   ├── SummaryCard.js # Stats card
│           │   └── TopItems.js   # Best selling items
│           │
│           └── UI/
│               ├── Button.js     # Reusable button
│               ├── Input.js      # Reusable input
│               ├── Modal.js      # Reusable modal
│               ├── Card.js       # Reusable card
│               └── Loading.js    # Loading spinner
│
└── tests/
    ├── __init__.py
    └── test_phase1.py            # Phase 1 tests
```

---

## File yang Dibuat Per Phase

### ✅ PHASE 1: Bisa Jualan

#### Backend Files
```
backend/
├── config/database.py            # MongoDB setup
├── models/
│   ├── tenant.py                 # Tenant schema
│   ├── user.py                   # User schema
│   ├── item.py                   # Item schema
│   └── transaction.py            # Transaction schema
├── routes/
│   ├── ai.py                     # POST /api/v1/ai/onboard
│   ├── auth.py                   # POST /api/v1/auth/login
│   ├── items.py                  # CRUD /api/v1/items
│   ├── transactions.py           # /api/v1/transactions
│   └── dashboard.py              # GET /api/v1/dashboard/today
├── services/
│   ├── ai_service.py             # OpenAI chat
│   └── auth_service.py           # JWT handling
└── utils/helpers.py              # Format rupiah, dll
```

#### Frontend Files
```
frontend/src/
├── api/index.js                  # API client
├── contexts/
│   ├── AuthContext.js            # Auth state
│   └── CartContext.js            # Cart state
├── pages/
│   ├── OnboardingPage.js         # AI onboarding
│   ├── LoginPage.js              # Login
│   ├── POSPage.js                # Main POS
│   ├── ItemsPage.js              # Manage items
│   ├── HistoryPage.js            # History
│   └── DashboardPage.js          # Summary
└── components/
    ├── Layout/Navbar.js
    ├── POS/ItemGrid.js
    ├── POS/Cart.js
    ├── POS/PaymentModal.js
    ├── POS/Receipt.js
    └── UI/*.js
```

---

### 📌 PHASE 2: Toko Sendiri (Tambahan)

#### Backend Files Tambahan
```
backend/
├── middleware/
│   └── tenant.py                 # Subdomain middleware
├── routes/
│   ├── users.py                  # Invite & manage users
│   └── settings.py               # Tenant settings
```

#### Frontend Files Tambahan
```
frontend/src/
├── pages/
│   ├── SettingsPage.js           # Pengaturan toko
│   └── UsersPage.js              # Kelola karyawan
└── components/
    └── Users/
        ├── UserList.js
        └── InviteForm.js
```

---

### 📌 PHASE 3: Cara Bayar & Laporan (Tambahan)

#### Backend Files Tambahan
```
backend/
├── models/
│   └── payment.py                # Payment schema
├── routes/
│   └── reports.py                # Laporan endpoints
└── services/
    └── report_service.py         # Generate reports
```

#### Frontend Files Tambahan
```
frontend/src/
├── pages/
│   └── ReportsPage.js            # Halaman laporan
└── components/
    ├── Reports/
    │   ├── ReportFilter.js
    │   └── ReportTable.js
    └── POS/
        └── PaymentMethodSelect.js
```

---

### 📌 PHASE 4: Stok Barang (Tambahan)

#### Backend Files Tambahan
```
backend/
├── models/
│   ├── stock.py                  # Stock schema
│   └── stock_movement.py         # Movement schema
├── routes/
│   └── stocks.py                 # Stock endpoints
└── services/
    └── stock_service.py          # Stock logic
```

#### Frontend Files Tambahan
```
frontend/src/
├── pages/
│   └── StocksPage.js             # Halaman stok
└── components/
    └── Stocks/
        ├── StockList.js
        ├── StockAlert.js
        └── PurchaseForm.js
```

---

### 📌 PHASE 5: Pelanggan & Promo (Tambahan)

#### Backend Files Tambahan
```
backend/
├── models/
│   ├── customer.py               # Customer schema
│   └── promo.py                  # Promo schema
├── routes/
│   ├── customers.py              # Customer endpoints
│   └── promos.py                 # Promo endpoints
└── services/
    └── promo_service.py          # Promo calculation
```

#### Frontend Files Tambahan
```
frontend/src/
├── pages/
│   ├── CustomersPage.js          # Halaman pelanggan
│   └── PromosPage.js             # Halaman promo
└── components/
    ├── Customers/
    │   ├── CustomerList.js
    │   ├── CustomerForm.js
    │   └── PointsDisplay.js
    └── Promos/
        ├── PromoList.js
        └── PromoForm.js
```

---

### 📌 PHASE 6: Booking & Jadwal (Tambahan)

#### Backend Files Tambahan
```
backend/
├── models/
│   ├── schedule.py               # Schedule schema
│   ├── service.py                # Service schema
│   ├── booking.py                # Booking schema
│   └── order.py                  # Order schema (laundry)
├── routes/
│   ├── schedules.py              # Schedule endpoints
│   ├── services.py               # Service endpoints
│   ├── bookings.py               # Booking endpoints
│   └── orders.py                 # Order endpoints
```

#### Frontend Files Tambahan
```
frontend/src/
├── pages/
│   ├── SchedulesPage.js          # Jadwal buka
│   ├── ServicesPage.js           # Layanan
│   ├── BookingsPage.js           # Booking
│   └── OrdersPage.js             # Pesanan (laundry)
└── components/
    ├── Schedules/
    │   └── ScheduleForm.js
    ├── Bookings/
    │   ├── BookingCalendar.js
    │   └── BookingForm.js
    └── Orders/
        ├── OrderList.js
        └── OrderStatusUpdate.js
```

---

## Environment Variables

### Backend (.env)
```env
# Database
MONGO_URL=mongodb://...

# JWT
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# OpenAI
OPENAI_API_KEY=your-openai-key
```

### Frontend (.env)
```env
# API
REACT_APP_BACKEND_URL=https://...
```

---

## Dependencies

### Backend (requirements.txt)
```
fastapi
uvicorn
motor
pydantic
python-jose[cryptography]
passlib[bcrypt]
python-multipart
openai
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "tailwindcss": "^3.x"
  }
}
```
