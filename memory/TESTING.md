# 🧪 TESTING DOCUMENTATION - AIKasir

## Overview

Dokumen ini berisi panduan testing untuk AIKasir, termasuk cara menjalankan test, test credentials, dan test scenarios per phase.

---

## 🔑 Test Credentials

```
=== OWNER ===
Email: kopibangjago@test.com
Password: 98ecf367
Role: pemilik
Tenant: Kopi Bang Jago

=== KASIR ===
Email: dedi@test.com
Password: kasir123
Role: kasir
Tenant: Kopi Bang Jago (same tenant as owner)
```

---

## 🛠️ Running Tests

### Backend Tests (pytest)

```bash
# Navigate to backend
cd /app/backend

# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_phase3_payment_void_reports.py -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html
```

### Manual API Testing (curl)

```bash
# Set API URL
API_URL="https://tenant-pos-5.preview.emergentagent.com"

# Login and get token
TOKEN=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"kopibangjago@test.com","password":"98ecf367"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

# Test authenticated endpoint
curl -s "$API_URL/api/v1/items" -H "Authorization: Bearer $TOKEN"
```

### Frontend Testing

Frontend testing dilakukan via Playwright (testing agent) atau manual screenshot verification.

```bash
# Screenshot testing via Playwright
# Handled by testing_agent_v3_fork
```

---

## 📋 Test Scenarios

### Phase 1: Bisa Jualan

#### 1.1 AI Onboarding
```
Scenario: User bisa chat dengan AI untuk setup toko
Given: User baru tanpa akun
When: User chat "Warung kopi" → "Kopi Bang Jago" → "Kopi susu, kopi hitam"
Then: 
  - Tenant dibuat dengan nama dan subdomain
  - User owner dibuat dengan email dan password
  - Items dibuat sesuai yang disebutkan
  - Response berisi kredensial login
```

#### 1.2 Login
```
Scenario: User bisa login
Given: User dengan email dan password valid
When: User submit login form
Then:
  - Response berisi JWT token
  - Response berisi user info dan tenant info
  - Redirect ke /pos
```

#### 1.3 Create Transaction
```
Scenario: User bisa membuat transaksi
Given: User logged in
When: User pilih items → masukkan payment → submit
Then:
  - Transaction tersimpan di database
  - Transaction number generated (YYYYMMDD-XXX)
  - Receipt data dikembalikan
```

---

### Phase 2: Toko Sendiri

#### 2.1 Role-Based Menu
```
Scenario: Menu berbeda berdasarkan role
Given: Two users - owner and kasir

When: Owner logged in
Then: Menu shows: Kasir, Barang, Riwayat, Ringkasan, Laporan, Stok, Karyawan, Pengaturan

When: Kasir logged in
Then: Menu shows: Kasir, Barang, Riwayat, Ringkasan (only)
```

#### 2.2 Invite User
```
Scenario: Owner bisa invite kasir
Given: Owner logged in
When: Owner submit invite form (name, email, role)
Then:
  - User dibuat dengan status "invited"
  - Invite URL dikembalikan
  - User bisa accept invite dengan set password
```

#### 2.3 RBAC Enforcement
```
Scenario: Kasir tidak bisa akses owner-only endpoints
Given: Kasir logged in

When: GET /api/v1/users
Then: 403 Forbidden

When: POST /api/v1/transactions/{id}/void
Then: 403 Forbidden

When: GET /api/v1/reports/summary
Then: 403 Forbidden
```

---

### Phase 3: Cara Bayar & Laporan

#### 3.1 Multiple Payment Methods
```
Scenario: Transaksi dengan berbagai metode bayar

Test Tunai:
  Given: Cart total = 30000
  When: payment_method = "tunai", payment_amount = 50000
  Then: change_amount = 20000

Test QRIS:
  Given: Cart total = 30000
  When: payment_method = "qris", payment_amount = 30000, reference = "QRIS-123"
  Then: change_amount = 0, reference saved

Test Transfer:
  Given: Cart total = 30000
  When: payment_method = "transfer", payment_amount = 30000, reference = "TRF-456"
  Then: change_amount = 0, reference saved

Test Invalid:
  When: payment_method = "bitcoin"
  Then: 400 Bad Request
```

#### 3.2 Void Transaction
```
Scenario: Owner bisa void transaksi
Given: Transaction exists with status "selesai"
When: Owner POST /transactions/{id}/void with reason
Then:
  - Transaction status = "void"
  - voided_at, voided_by, void_reason saved
  - If item has track_stock, stock returned
```

#### 3.3 Reports
```
Scenario: Owner bisa lihat laporan
Given: Multiple transactions exist
When: GET /api/v1/reports/summary with date range
Then:
  - Summary: total_sales, total_transactions, avg_transaction
  - Payment breakdown by method
  - Top selling items
  - Daily sales data
```

---

### Phase 4: Stok Barang

#### 4.1 Create Item with Stock Tracking
```
Scenario: Owner bisa buat item dengan stock tracking
Given: Owner logged in
When: POST /api/v1/items with track_stock=true, stock=50, threshold=10
Then:
  - Item dibuat dengan stock fields
  - Item muncul di Stock page
```

#### 4.2 Auto-Deduct Stock on Sale
```
Scenario: Stok berkurang otomatis saat penjualan
Given: Item with track_stock=true, stock=50
When: Transaction created with item qty=5
Then:
  - Item stock = 45
  - Stock adjustment record created (type: sale)
```

#### 4.3 Return Stock on Void
```
Scenario: Stok kembali saat transaksi di-void
Given: Transaction with items (stock was deducted)
When: Transaction voided
Then:
  - Item stock restored
  - Stock adjustment record created (type: void_return)
```

#### 4.4 Prevent Sale When Out of Stock
```
Scenario: Tidak bisa jual jika stok tidak cukup
Given: Item with track_stock=true, stock=3
When: Try to create transaction with qty=5
Then: 400 Bad Request "Stok tidak cukup"
```

#### 4.5 Stock Alerts
```
Scenario: Sistem menampilkan peringatan stok
Given: Items with various stock levels
When: GET /api/v1/stock/alerts
Then:
  - Items with stock=0 → severity: critical
  - Items with stock <= threshold → severity: warning
```

#### 4.6 Stock Adjustment
```
Scenario: Owner bisa adjust stock manual
Given: Item with stock=50

Test Add:
  When: adjust type=add, quantity=20
  Then: stock = 70

Test Subtract:
  When: adjust type=subtract, quantity=10
  Then: stock = 40

Test Set:
  When: adjust type=set, quantity=100
  Then: stock = 100
```

---

## 📊 Test Report Location

Test reports dari testing agent disimpan di:
```
/app/test_reports/
├── iteration_1.json    # Phase 1 results
├── iteration_2.json    # Phase 2 results
├── iteration_3.json    # Phase 3 results
└── pytest/
    └── pytest_results.xml
```

---

## 🔍 Common Test Commands

### Check Backend Status
```bash
# Check if backend is running
curl -s $API_URL/api/health

# Check supervisor status
sudo supervisorctl status

# View backend logs
tail -f /var/log/supervisor/backend.err.log
```

### Quick API Test Chain
```bash
API_URL="https://tenant-pos-5.preview.emergentagent.com"

# Login
TOKEN=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"kopibangjago@test.com","password":"98ecf367"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

# Get items
ITEMS=$(curl -s "$API_URL/api/v1/items" -H "Authorization: Bearer $TOKEN")
ITEM_ID=$(echo $ITEMS | python3 -c "import sys,json;print(json.load(sys.stdin)['items'][0]['id'])")

# Create transaction
curl -s -X POST "$API_URL/api/v1/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"items\":[{\"item_id\":\"$ITEM_ID\",\"qty\":1}],\"payment_method\":\"tunai\",\"payment_amount\":50000}"

# Get dashboard
curl -s "$API_URL/api/v1/dashboard/today" -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Writing New Tests

### Backend Test Template
```python
# /app/backend/tests/test_phase5_customers.py
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://...')
API_BASE = f"{BASE_URL}/api/v1"

OWNER_EMAIL = "kopibangjago@test.com"
OWNER_PASSWORD = "98ecf367"

class TestCustomers:
    @pytest.fixture
    def owner_token(self):
        response = requests.post(f"{API_BASE}/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json()["token"]
    
    def test_create_customer(self, owner_token):
        headers = {"Authorization": f"Bearer {owner_token}"}
        response = requests.post(f"{API_BASE}/customers", 
            headers=headers,
            json={"name": "John", "phone": "08123456789"}
        )
        assert response.status_code == 201
        assert response.json()["name"] == "John"
```

---

## ✅ Test Checklist per Phase

### Phase 1 ✅
- [x] Health check endpoint
- [x] AI onboarding creates tenant, user, items
- [x] Login returns token and user info
- [x] CRUD items works
- [x] Create transaction with change calculation
- [x] Get transactions by date
- [x] Dashboard today shows correct totals

### Phase 2 ✅
- [x] Owner can invite user
- [x] User can accept invite
- [x] Role-based menu filtering
- [x] Kasir blocked from owner endpoints
- [x] Settings CRUD works

### Phase 3 ✅
- [x] Transaction with Tunai (change calc)
- [x] Transaction with QRIS (reference)
- [x] Transaction with Transfer (reference)
- [x] Invalid payment method rejected
- [x] Owner can void transaction
- [x] Kasir blocked from void
- [x] Report summary with breakdown
- [x] Export CSV and JSON

### Phase 4 🔄
- [x] Create item with stock tracking
- [x] Stock summary API
- [x] Stock alerts API
- [x] Stock adjustment API
- [x] Stock history API
- [ ] Auto-deduct on sale (needs e2e test)
- [ ] Return stock on void (needs e2e test)
- [ ] Stock validation on sale (needs e2e test)

---

*Last Updated: 2026-01-20*
