# 📡 API DOCUMENTATION - AIKasir

## Overview

| Item | Value |
|------|-------|
| **Base URL** | `{REACT_APP_BACKEND_URL}/api` |
| **API Version** | v1 |
| **Content-Type** | application/json |
| **Auth** | Bearer Token (JWT) |

---

## 🔐 Authentication

Semua endpoint (kecuali yang ditandai 🔓 Public) membutuhkan header:
```
Authorization: Bearer {token}
```

Token didapat dari response login dan disimpan di `localStorage.aikasir_token`.

---

## 🔓 PUBLIC ENDPOINTS

### Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "AIKasir API",
  "version": "1.0.0"
}
```

---

### AI Onboarding
```
POST /api/v1/ai/onboard
```
Memulai atau melanjutkan onboarding dengan AI.

**Request:**
```json
{
  "message": "Warung kopi",
  "session_id": "optional-uuid"  // null untuk session baru
}
```

**Response (AI masih tanya):**
```json
{
  "status": "continue",
  "message": "Sip! Nama warungnya apa?",
  "session_id": "abc-123-def"
}
```

**Response (Selesai):**
```json
{
  "status": "complete",
  "message": "Mantap! Toko kamu sudah jadi ✅",
  "session_id": "abc-123-def",
  "tenant": {
    "id": "uuid",
    "name": "Kopi Bang Jago",
    "subdomain": "kopibangjago"
  },
  "user": {
    "id": "uuid",
    "name": "Pemilik",
    "email": "kopibangjago@test.com",
    "password": "generated-password",  // Tampilkan ke user!
    "role": "pemilik"
  },
  "items": [
    {"id": "uuid", "name": "Kopi Susu", "price": 15000},
    {"id": "uuid", "name": "Kopi Hitam", "price": 10000}
  ]
}
```

---

### Login
```
POST /api/v1/auth/login
```
**Request:**
```json
{
  "email": "kopibangjago@test.com",
  "password": "98ecf367"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Pemilik",
    "email": "kopibangjago@test.com",
    "role": "pemilik",
    "tenant_id": "uuid"
  },
  "tenant": {
    "id": "uuid",
    "name": "Kopi Bang Jago",
    "subdomain": "kopibangjago"
  }
}
```

---

### Accept Invite
```
GET /api/v1/users/invite/{token}
```
Get info untuk halaman accept invite.

**Response:**
```json
{
  "email": "kasir@email.com",
  "name": "Dedi",
  "role": "kasir",
  "tenant_name": "Kopi Bang Jago"
}
```

```
POST /api/v1/users/accept-invite
```
**Request:**
```json
{
  "token": "invite-token-uuid",
  "password": "newpassword123"
}
```

---

## 🔒 AUTHENTICATED ENDPOINTS

### Get Current User
```
GET /api/v1/auth/me
```
**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "Pemilik",
    "email": "kopibangjago@test.com",
    "role": "pemilik"
  },
  "tenant": {
    "id": "uuid",
    "name": "Kopi Bang Jago",
    "subdomain": "kopibangjago"
  }
}
```

---

## 📦 ITEMS (Barang)

### List Items
```
GET /api/v1/items?active_only=true&search=kopi
```
**Query Params:**
- `active_only`: boolean (default: true)
- `search`: string (optional)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Kopi Susu",
      "price": 15000,
      "track_stock": true,
      "stock": 50,
      "low_stock_threshold": 10,
      "is_active": true,
      "created_at": "2026-01-20T10:00:00Z"
    }
  ],
  "total": 1
}
```

### Create Item
```
POST /api/v1/items
```
**Request:**
```json
{
  "name": "Kopi Susu",
  "price": 15000,
  "track_stock": true,       // optional, default: false
  "stock": 50,               // optional, default: 0
  "low_stock_threshold": 10  // optional, default: 10
}
```

### Update Item
```
PUT /api/v1/items/{item_id}
```
**Request:**
```json
{
  "name": "Kopi Susu Premium",
  "price": 18000,
  "track_stock": true,
  "stock": 100,
  "low_stock_threshold": 15
}
```

### Delete Item (Soft Delete)
```
DELETE /api/v1/items/{item_id}
```
**Response:**
```json
{
  "message": "Barang berhasil dihapus"
}
```

---

## 💰 TRANSACTIONS (Penjualan)

### List Transactions
```
GET /api/v1/transactions?date=2026-01-20&limit=50&offset=0
```
**Query Params:**
- `date`: YYYY-MM-DD (filter by date)
- `limit`: int (default: 50)
- `offset`: int (default: 0)

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "transaction_number": "20260120-001",
      "items": [
        {
          "item_id": "uuid",
          "name": "Kopi Susu",
          "qty": 2,
          "price": 15000,
          "subtotal": 30000
        }
      ],
      "total": 30000,
      "payment_method": "tunai",
      "payment_amount": 50000,
      "change_amount": 20000,
      "payment_reference": null,
      "status": "selesai",
      "created_by": "uuid",
      "created_by_name": "Dedi",
      "created_at": "2026-01-20T14:32:00Z"
    }
  ],
  "total": 47
}
```

### Get Transaction Detail
```
GET /api/v1/transactions/{transaction_id}
```
**Response:**
```json
{
  "transaction": { ... },
  "receipt": {
    "business_name": "Kopi Bang Jago",
    "address": "Jl. Merdeka No. 10",
    "phone": "0812-3456-7890"
  }
}
```

### Create Transaction
```
POST /api/v1/transactions
```
**Request:**
```json
{
  "items": [
    {"item_id": "uuid", "qty": 2},
    {"item_id": "uuid", "qty": 1}
  ],
  "payment_method": "tunai",  // tunai, qris, transfer
  "payment_amount": 50000,
  "payment_reference": null   // Required for qris/transfer
}
```

**Response:**
```json
{
  "id": "uuid",
  "transaction_number": "20260120-048",
  "items": [...],
  "total": 45000,
  "payment_method": "tunai",
  "payment_amount": 50000,
  "change_amount": 5000,
  "status": "selesai",
  "created_at": "2026-01-20T15:00:00Z",
  "receipt": {
    "business_name": "Kopi Bang Jago",
    "address": "...",
    "phone": "..."
  }
}
```

**⚠️ Stock Behavior:**
- Jika item memiliki `track_stock: true`, stok akan otomatis berkurang
- Jika stok tidak cukup, return error 400

### Void Transaction (Owner Only)
```
POST /api/v1/transactions/{transaction_id}/void
```
**Request:**
```json
{
  "reason": "Salah input barang"
}
```

**Response:**
```json
{
  "message": "Transaksi berhasil dibatalkan",
  "transaction_id": "uuid",
  "voided_by": "Pemilik",
  "reason": "Salah input barang"
}
```

**⚠️ Stock Behavior:**
- Stok akan dikembalikan untuk item dengan `track_stock: true`

---

## 📊 DASHBOARD

### Get Today's Summary
```
GET /api/v1/dashboard/today
```
**Response:**
```json
{
  "date": "2026-01-20",
  "total_sales": 2500000,
  "total_sales_formatted": "Rp 2.500.000",
  "total_transactions": 47,
  "total_items_sold": 156,
  "top_items": [
    {"name": "Kopi Susu", "qty": 89, "revenue": 1335000},
    {"name": "Gorengan", "qty": 45, "revenue": 225000}
  ]
}
```

---

## 📈 REPORTS (Owner Only)

### Get Report Summary
```
GET /api/v1/reports/summary?start_date=2026-01-01&end_date=2026-01-20
```
**Response:**
```json
{
  "summary": {
    "total_sales": 25000000,
    "total_sales_formatted": "Rp 25.000.000",
    "total_transactions": 470,
    "total_items_sold": 1560,
    "avg_transaction": 53191
  },
  "payment_breakdown": {
    "tunai": {"count": 300, "amount": 15000000},
    "qris": {"count": 120, "amount": 7000000},
    "transfer": {"count": 50, "amount": 3000000}
  },
  "top_items": [
    {"name": "Kopi Susu", "qty": 890, "revenue": 13350000}
  ],
  "daily_sales": {
    "2026-01-19": {"amount": 1200000, "transactions": 25},
    "2026-01-20": {"amount": 1500000, "transactions": 30}
  }
}
```

### Export Report
```
GET /api/v1/reports/export?start_date=2026-01-01&end_date=2026-01-20&format=csv
```
**Query Params:**
- `format`: "csv" or "json"

**Response (CSV):**
```json
{
  "format": "csv",
  "data": "transaction_number,date,time,items,total,...",
  "filename": "laporan_2026-01-01_to_2026-01-20.csv"
}
```

---

## 📦 STOCK MANAGEMENT (Owner Only) - Phase 4

### Get Stock Summary
```
GET /api/v1/stock?low_stock_only=false
```
**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Kopi Susu",
      "price": 15000,
      "track_stock": true,
      "stock": 50,
      "low_stock_threshold": 10
    }
  ],
  "summary": {
    "total_tracked_items": 5,
    "low_stock_count": 2,
    "out_of_stock_count": 1
  },
  "low_stock_items": [...],
  "out_of_stock_items": [...]
}
```

### Get Stock Alerts
```
GET /api/v1/stock/alerts
```
**Response:**
```json
{
  "alerts": [
    {
      "type": "out_of_stock",
      "severity": "critical",
      "item_id": "uuid",
      "item_name": "Gula",
      "stock": 0,
      "message": "Gula sudah habis!"
    },
    {
      "type": "low_stock",
      "severity": "warning",
      "item_id": "uuid",
      "item_name": "Kopi Bubuk",
      "stock": 5,
      "threshold": 10,
      "message": "Stok Kopi Bubuk tinggal 5"
    }
  ],
  "total_alerts": 2,
  "critical_count": 1,
  "warning_count": 1
}
```

### Adjust Stock
```
POST /api/v1/stock/{item_id}/adjust
```
**Request:**
```json
{
  "adjustment_type": "add",  // add, subtract, set
  "quantity": 50,
  "reason": "Restok dari supplier"
}
```

**Response:**
```json
{
  "message": "Stok berhasil diperbarui",
  "item_id": "uuid",
  "item_name": "Kopi Susu",
  "stock_before": 10,
  "stock_after": 60,
  "adjustment_type": "add",
  "quantity": 50
}
```

### Get Stock History
```
GET /api/v1/stock/{item_id}/history?limit=50
```
**Response:**
```json
{
  "item": {
    "id": "uuid",
    "name": "Kopi Susu",
    "stock": 60
  },
  "history": [
    {
      "id": "uuid",
      "adjustment_type": "add",
      "quantity": 50,
      "stock_before": 10,
      "stock_after": 60,
      "reason": "Restok dari supplier",
      "created_by_name": "Pemilik",
      "created_at": "2026-01-20T10:00:00Z"
    },
    {
      "id": "uuid",
      "adjustment_type": "sale",
      "quantity": 2,
      "stock_before": 12,
      "stock_after": 10,
      "reason": "Penjualan #20260120-001",
      "transaction_id": "uuid",
      "created_at": "2026-01-20T09:30:00Z"
    }
  ],
  "total": 2
}
```

---

## 👥 USER MANAGEMENT (Owner Only)

### List Users
```
GET /api/v1/users
```
**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "Pemilik",
      "email": "owner@test.com",
      "role": "pemilik",
      "status": "active",
      "is_active": true,
      "created_at": "2026-01-20T08:00:00Z"
    },
    {
      "id": "uuid",
      "name": "Dedi",
      "email": "dedi@test.com",
      "role": "kasir",
      "status": "active",
      "is_active": true,
      "invited_by": "uuid"
    }
  ],
  "total": 2
}
```

### Invite User
```
POST /api/v1/users/invite
```
**Request:**
```json
{
  "name": "Budi",
  "email": "budi@email.com",
  "role": "kasir"
}
```

**Response:**
```json
{
  "message": "Undangan berhasil dikirim",
  "invite_url": "https://aikasir.com/invite/abc-123-def",
  "user": {
    "id": "uuid",
    "name": "Budi",
    "email": "budi@email.com",
    "role": "kasir",
    "status": "invited"
  }
}
```

### Update User
```
PUT /api/v1/users/{user_id}
```
**Request:**
```json
{
  "name": "Budi Updated",
  "role": "kasir",
  "is_active": true
}
```

### Delete User
```
DELETE /api/v1/users/{user_id}
```

---

## ⚙️ SETTINGS (Owner Only)

### Get Settings
```
GET /api/v1/settings
```
**Response:**
```json
{
  "id": "uuid",
  "name": "Kopi Bang Jago",
  "subdomain": "kopibangjago",
  "address": "Jl. Merdeka No. 10",
  "phone": "0812-3456-7890",
  "config": {
    "business_type": "food_beverage",
    "features": {"stock": true, "booking": false},
    "payment_methods": ["tunai", "qris", "transfer"]
  }
}
```

### Update Settings
```
PUT /api/v1/settings
```
**Request:**
```json
{
  "name": "Kopi Bang Jago Premium",
  "address": "Jl. Merdeka No. 10A",
  "phone": "0812-9999-8888"
}
```

---

## ⚠️ ERROR RESPONSES

### Format Error
```json
{
  "detail": "Pesan error yang mudah dipahami"
}
```

### HTTP Status Codes
| Code | Keterangan |
|------|------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (token invalid/expired) |
| 403 | Forbidden (tidak punya akses) |
| 404 | Not Found |
| 500 | Server Error |

### Contoh Error Messages
```json
// 400 - Validation
{"detail": "Nama barang harus diisi"}
{"detail": "Harga harus lebih dari 0"}
{"detail": "Stok Kopi Susu tidak cukup (tersedia: 5)"}
{"detail": "Metode pembayaran tidak valid"}
{"detail": "Pembayaran kurang dari total"}

// 401 - Auth
{"detail": "Token tidak valid"}
{"detail": "Token sudah expired"}

// 403 - Permission
{"detail": "Hanya pemilik yang bisa mengakses"}
{"detail": "Transaksi sudah dibatalkan"}

// 404 - Not Found
{"detail": "Barang tidak ditemukan"}
{"detail": "Transaksi tidak ditemukan"}
{"detail": "User tidak ditemukan"}
```

---

## 🧪 Testing dengan cURL

### Login
```bash
API_URL="https://tenant-pos-5.preview.emergentagent.com"

# Login dan simpan token
TOKEN=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"kopibangjago@test.com","password":"98ecf367"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

echo "Token: $TOKEN"
```

### Get Items
```bash
curl -s "$API_URL/api/v1/items" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Transaction
```bash
curl -s -X POST "$API_URL/api/v1/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{"item_id": "ITEM_UUID", "qty": 2}],
    "payment_method": "tunai",
    "payment_amount": 50000
  }'
```

---

*Last Updated: 2026-01-20*
