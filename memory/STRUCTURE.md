# 📁 STRUKTUR FOLDER & FILE - AIKasir

## Struktur Aktual Project

```
/app
├── memory/                       # Dokumentasi project
│   ├── PRD.md                    # Product Requirements Document
│   ├── STRUCTURE.md              # Dokumen ini - struktur folder
│   ├── API.md                    # API Documentation lengkap
│   ├── PROGRESS.md               # Progress tracker per phase
│   └── TESTING.md                # Testing documentation
│
├── backend/
│   ├── server.py                 # ⭐ MAIN: Semua backend logic dalam 1 file
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables
│   └── tests/                    # Test files (pytest)
│       └── test_phase*.py        # Test per phase
│
├── frontend/
│   ├── package.json              # Node dependencies
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── .env                      # Frontend env (REACT_APP_BACKEND_URL)
│   │
│   ├── public/
│   │   └── index.html
│   │
│   └── src/
│       ├── index.js              # Entry point
│       ├── index.css             # Global + Tailwind styles
│       ├── App.js                # ⭐ Main router dengan protected routes
│       ├── App.css
│       │
│       ├── api/
│       │   └── index.js          # ⭐ API client - semua endpoint functions
│       │
│       ├── contexts/
│       │   ├── AuthContext.js    # Auth state (user, tenant, token)
│       │   └── CartContext.js    # Shopping cart state
│       │
│       ├── pages/                # Halaman utama
│       │   ├── OnboardingPage.js # AI chat onboarding
│       │   ├── LoginPage.js      # Login screen
│       │   ├── POSPage.js        # Main POS/kasir screen
│       │   ├── ItemsPage.js      # Manage items + stock toggle
│       │   ├── HistoryPage.js    # Transaction history + void
│       │   ├── DashboardPage.js  # Daily summary
│       │   ├── ReportsPage.js    # Reports + export (Phase 3)
│       │   ├── StockPage.js      # Stock management (Phase 4)
│       │   ├── UsersPage.js      # User management
│       │   ├── InvitePage.js     # Accept invite page
│       │   └── SettingsPage.js   # Tenant settings
│       │
│       └── components/
│           ├── Layout.js         # ⭐ Sidebar + main layout, role-based menu
│           ├── PaymentModal.js   # Payment with 3 methods
│           └── ReceiptModal.js   # Digital receipt display
│
└── test_reports/                 # Test results dari testing agent
    ├── iteration_1.json          # Phase 1 test results
    ├── iteration_2.json          # Phase 2 test results
    └── iteration_3.json          # Phase 3 test results
```

---

## 📝 PENJELASAN FILE UTAMA

### Backend: `/app/backend/server.py`

File ini berisi SEMUA logic backend dalam 1 file (~1300 lines). Struktur internal:

```python
# === IMPORTS & CONFIG (Line 1-50) ===
# FastAPI, MongoDB, JWT, OpenAI setup

# === MODELS (Line 52-220) ===
# Pydantic models untuk semua entity:
# - TenantConfig, Tenant
# - User, UserCreate, UserLogin, UserResponse, UserInvite, UserUpdate
# - Item, ItemCreate, ItemUpdate (dengan stock fields)
# - StockAdjustment, StockAdjustmentRequest
# - Transaction, TransactionItem, TransactionCreate, TransactionVoid
# - AISession, AIOnboardMessage

# === HELPER FUNCTIONS (Line 220-350) ===
# - get_current_user() - JWT verification
# - require_owner() - Role check
# - generate_transaction_number() - Format: YYYYMMDD-XXX
# - format_rupiah() - "Rp 15.000"
# - process_ai_response() - Parse AI onboarding response

# === HEALTH & AI ROUTES (Line 350-500) ===
# - GET /api/health
# - POST /api/v1/ai/onboard

# === AUTH ROUTES (Line 500-600) ===
# - POST /api/v1/auth/login
# - GET /api/v1/auth/me
# - PUT /api/v1/auth/password

# === ITEMS ROUTES (Line 600-700) ===
# - GET /api/v1/items
# - POST /api/v1/items
# - PUT /api/v1/items/{id}
# - DELETE /api/v1/items/{id}

# === TRANSACTIONS ROUTES (Line 700-900) ===
# - GET /api/v1/transactions
# - GET /api/v1/transactions/{id}
# - POST /api/v1/transactions (with stock deduction)
# - POST /api/v1/transactions/{id}/void (with stock return)

# === REPORTS ROUTES (Line 900-1100) ===
# - GET /api/v1/reports/summary
# - GET /api/v1/reports/daily
# - GET /api/v1/reports/export

# === STOCK ROUTES - Phase 4 (Line 1100-1250) ===
# - GET /api/v1/stock
# - GET /api/v1/stock/alerts
# - POST /api/v1/stock/{item_id}/adjust
# - GET /api/v1/stock/{item_id}/history

# === DASHBOARD & SETTINGS ROUTES (Line 1250-1350) ===
# - GET /api/v1/dashboard/today
# - GET /api/v1/settings
# - PUT /api/v1/settings

# === USER MANAGEMENT ROUTES (Line 1350-1500) ===
# - GET /api/v1/users
# - POST /api/v1/users/invite
# - GET /api/v1/users/invite/{token}
# - POST /api/v1/users/accept-invite
# - PUT /api/v1/users/{id}
# - DELETE /api/v1/users/{id}

# === TENANT ROUTES (Line 1500-end) ===
# - GET /api/v1/tenant/check/{subdomain}
```

---

### Frontend: `/app/frontend/src/App.js`

Router utama dengan protected routes:

```jsx
// Public Routes (tanpa login)
<Route path="/" element={<OnboardingPage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/invite/:token" element={<InvitePage />} />

// Protected Routes - All Users
<Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
<Route path="/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
<Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

// Protected Routes - Owner Only
<Route path="/reports" element={<ProtectedRoute ownerOnly><ReportsPage /></ProtectedRoute>} />
<Route path="/stock" element={<ProtectedRoute ownerOnly><StockPage /></ProtectedRoute>} />
<Route path="/users" element={<ProtectedRoute ownerOnly><UsersPage /></ProtectedRoute>} />
<Route path="/settings" element={<ProtectedRoute ownerOnly><SettingsPage /></ProtectedRoute>} />
```

---

### Frontend: `/app/frontend/src/api/index.js`

Semua API calls dikumpulkan di sini:

```javascript
// AI Onboarding
export const aiOnboard = (message, sessionId) => ...

// Auth
export const login = (email, password) => ...
export const getMe = () => ...
export const changePassword = (newPassword) => ...

// Items
export const getItems = (activeOnly, search) => ...
export const createItem = (name, price, trackStock, stock, threshold) => ...
export const updateItem = (id, data) => ...
export const deleteItem = (id) => ...

// Transactions
export const getTransactions = (date, limit, offset) => ...
export const getTransaction = (id) => ...
export const createTransaction = (items, method, amount, reference) => ...
export const voidTransaction = (id, reason) => ...

// Dashboard
export const getDashboardToday = () => ...

// Reports
export const getReportSummary = (startDate, endDate) => ...
export const getDailyReport = (date) => ...
export const exportReport = (startDate, endDate, format) => ...

// Stock (Phase 4)
export const getStockSummary = (lowStockOnly) => ...
export const getStockAlerts = () => ...
export const adjustStock = (itemId, type, quantity, reason) => ...
export const getStockHistory = (itemId, limit) => ...

// Users
export const getUsers = () => ...
export const inviteUser = (name, email, role) => ...
export const getInviteInfo = (token) => ...
export const acceptInvite = (token, password) => ...
export const updateUser = (id, data) => ...
export const deleteUser = (id) => ...

// Settings & Tenant
export const getSettings = () => ...
export const updateSettings = (data) => ...
export const checkSubdomain = (subdomain) => ...
```

---

### Frontend: `/app/frontend/src/components/Layout.js`

Sidebar dengan menu berdasarkan role:

```javascript
const navItems = [
  { to: '/pos', icon: LayoutGrid, label: 'Kasir', roles: ['pemilik', 'kasir'] },
  { to: '/items', icon: Package, label: 'Barang', roles: ['pemilik', 'kasir'] },
  { to: '/history', icon: Receipt, label: 'Riwayat', roles: ['pemilik', 'kasir'] },
  { to: '/dashboard', icon: BarChart3, label: 'Ringkasan', roles: ['pemilik', 'kasir'] },
  { to: '/reports', icon: FileBarChart, label: 'Laporan', roles: ['pemilik'] },
  { to: '/stock', icon: Boxes, label: 'Stok', roles: ['pemilik'] },
  { to: '/users', icon: Users, label: 'Karyawan', roles: ['pemilik'] },
  { to: '/settings', icon: Settings, label: 'Pengaturan', roles: ['pemilik'] },
];
```

---

## 🔧 Environment Variables

### Backend `.env`
```env
MONGO_URL=mongodb://...
DB_NAME=aikasir_db
JWT_SECRET=aikasir-secret-key
JWT_ALGORITHM=HS256
OPENAI_API_KEY=sk-...
```

### Frontend `.env`
```env
REACT_APP_BACKEND_URL=https://tenant-pos-5.preview.emergentagent.com
```

---

## 📦 Dependencies

### Backend (`requirements.txt`)
```
fastapi
uvicorn
motor          # Async MongoDB driver
pydantic
python-jose[cryptography]  # JWT
passlib[bcrypt]  # Password hashing
python-multipart
python-dotenv
openai
httpx
```

### Frontend (`package.json` key dependencies)
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "lucide-react": "^0.x"
  }
}
```

---

## 🗄️ Database Collections (MongoDB)

```
aikasir_db/
├── tenants           # Data toko
├── users             # Users (owner & kasir)
├── items             # Barang jualan
├── transactions      # Transaksi/penjualan
├── ai_sessions       # AI onboarding sessions
└── stock_adjustments # Riwayat perubahan stok
```

---

## 📋 Tips untuk Developer Selanjutnya

### 1. Memulai Development
```bash
# Backend sudah running via supervisor
sudo supervisorctl status

# Jika perlu restart backend
sudo supervisorctl restart backend

# Check logs
tail -f /var/log/supervisor/backend.err.log
```

### 2. Menambah Endpoint Baru
1. Tambah model di section `MODELS` di `server.py`
2. Tambah route di section yang sesuai
3. Tambah function di `frontend/src/api/index.js`
4. Update halaman yang membutuhkan

### 3. Menambah Halaman Baru
1. Buat file di `frontend/src/pages/NewPage.js`
2. Import di `App.js`
3. Tambah Route (protected atau public)
4. Jika perlu di sidebar, update `Layout.js`

### 4. Testing
```bash
# Backend API testing
cd /app/backend
pytest tests/ -v

# Atau manual dengan curl
curl -X POST $API_URL/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{"email":"kopibangjago@test.com","password":"98ecf367"}'
```

---

*Last Updated: 2026-01-20*
