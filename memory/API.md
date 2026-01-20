# 📡 API DOCUMENTATION

## Base URL
```
Production: {REACT_APP_BACKEND_URL}/api/v1
```

## Authentication
Semua endpoint (kecuali login & onboard) membutuhkan header:
```
Authorization: Bearer {token}
```

---

## 🤖 AI ENDPOINTS

### POST /api/v1/ai/onboard
Memulai onboarding dengan AI untuk membuat toko baru.

**Request:**
```json
{
  "message": "Warung kopi",
  "session_id": "optional-session-id"
}
```

**Response (AI masih tanya):**
```json
{
  "status": "continue",
  "message": "Sip! Nama warungnya apa?",
  "session_id": "abc123"
}
```

**Response (Selesai, toko jadi):**
```json
{
  "status": "complete",
  "message": "Mantap! Toko kamu sudah jadi ✅",
  "tenant": {
    "id": "uuid",
    "name": "Kopi Bang Jago",
    "subdomain": "kopibangbago"
  },
  "user": {
    "id": "uuid",
    "email": "auto-generated@email.com",
    "temp_password": "abc123"
  },
  "items": [
    {"name": "Kopi Susu", "price": 15000},
    {"name": "Kopi Hitam", "price": 10000}
  ]
}
```

---

## 🔐 AUTH ENDPOINTS

### POST /api/v1/auth/login
Login user.

**Request:**
```json
{
  "email": "user@email.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "name": "Bu Ani",
    "email": "user@email.com",
    "role": "pemilik"
  },
  "tenant": {
    "id": "uuid",
    "name": "Kopi Bang Jago",
    "subdomain": "kopibangbago"
  }
}
```

### POST /api/v1/auth/register (Phase 2)
Register owner baru.

**Request:**
```json
{
  "name": "Bu Ani",
  "email": "buani@email.com",
  "password": "password123",
  "business_name": "Warung Bu Ani"
}
```

---

## 📦 ITEMS ENDPOINTS

### GET /api/v1/items
List semua barang.

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
      "is_active": true,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 10
}
```

### POST /api/v1/items
Tambah barang baru.

**Request:**
```json
{
  "name": "Kopi Susu",
  "price": 15000
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Kopi Susu",
  "price": 15000,
  "is_active": true,
  "created_at": "2025-01-15T10:00:00Z"
}
```

### PUT /api/v1/items/{id}
Edit barang.

**Request:**
```json
{
  "name": "Kopi Susu Gula Aren",
  "price": 18000
}
```

### DELETE /api/v1/items/{id}
Hapus barang (soft delete).

**Response:**
```json
{
  "message": "Barang berhasil dihapus"
}
```

---

## 💰 TRANSACTIONS ENDPOINTS

### GET /api/v1/transactions
List transaksi/penjualan.

**Query Params:**
- `date`: string YYYY-MM-DD (default: today)
- `limit`: int (default: 50)
- `offset`: int (default: 0)

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "items": [
        {"name": "Kopi Susu", "qty": 2, "price": 15000, "subtotal": 30000}
      ],
      "total": 30000,
      "payment_method": "tunai",
      "payment_amount": 50000,
      "change_amount": 20000,
      "status": "selesai",
      "created_by": "Dedi",
      "created_at": "2025-01-15T14:32:00Z"
    }
  ],
  "total": 47
}
```

### POST /api/v1/transactions
Buat transaksi baru (catat penjualan).

**Request:**
```json
{
  "items": [
    {"item_id": "uuid", "qty": 2},
    {"item_id": "uuid", "qty": 3}
  ],
  "payment_method": "tunai",
  "payment_amount": 50000,
  "customer_id": "uuid (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "transaction_number": "#0047",
  "items": [
    {"name": "Kopi Susu", "qty": 2, "price": 15000, "subtotal": 30000},
    {"name": "Gorengan", "qty": 3, "price": 5000, "subtotal": 15000}
  ],
  "total": 45000,
  "payment_method": "tunai",
  "payment_amount": 50000,
  "change_amount": 5000,
  "status": "selesai",
  "created_at": "2025-01-15T14:32:00Z",
  "receipt": {
    "business_name": "Kopi Bang Jago",
    "address": "Jl. Merdeka No. 10",
    "phone": "0812-3456-7890"
  }
}
```

### GET /api/v1/transactions/{id}
Detail transaksi (untuk cetak ulang struk).

### POST /api/v1/transactions/{id}/void (Phase 3)
Batalkan transaksi.

**Request:**
```json
{
  "reason": "Salah input"
}
```

---

## 📊 DASHBOARD ENDPOINTS

### GET /api/v1/dashboard/today
Ringkasan hari ini.

**Response:**
```json
{
  "date": "2025-01-15",
  "total_sales": 2500000,
  "total_transactions": 47,
  "total_items_sold": 156,
  "top_items": [
    {"name": "Kopi Susu", "qty": 89, "revenue": 1335000},
    {"name": "Gorengan", "qty": 45, "revenue": 225000}
  ],
  "sales_by_hour": [
    {"hour": "08:00", "amount": 150000},
    {"hour": "09:00", "amount": 280000}
  ]
}
```

---

## 📈 REPORTS ENDPOINTS (Phase 3)

### GET /api/v1/reports/daily
**Query Params:**
- `date`: string YYYY-MM-DD

### GET /api/v1/reports/weekly
**Query Params:**
- `start_date`: string YYYY-MM-DD

### GET /api/v1/reports/monthly
**Query Params:**
- `month`: int (1-12)
- `year`: int

### GET /api/v1/reports/export
**Query Params:**
- `type`: daily|weekly|monthly
- `date`: string YYYY-MM-DD

**Response:** Excel file download

---

## 📦 STOCKS ENDPOINTS (Phase 4)

### GET /api/v1/stocks
List stok semua barang.

**Response:**
```json
{
  "stocks": [
    {
      "item_id": "uuid",
      "item_name": "Kopi Susu",
      "quantity": 89,
      "min_quantity": 20,
      "status": "aman"
    },
    {
      "item_id": "uuid",
      "item_name": "Gula",
      "quantity": 3,
      "min_quantity": 10,
      "status": "hampir_habis"
    }
  ]
}
```

### PUT /api/v1/stocks/{item_id}
Update stok manual.

**Request:**
```json
{
  "quantity": 100,
  "notes": "Restok dari supplier"
}
```

### POST /api/v1/stocks/purchase
Catat pembelian stok.

**Request:**
```json
{
  "items": [
    {"item_id": "uuid", "quantity": 10, "cost": 150000}
  ],
  "notes": "Beli dari Toko ABC"
}
```

### GET /api/v1/stocks/alerts
Stok yang perlu diperhatikan.

---

## 👥 CUSTOMERS ENDPOINTS (Phase 5)

### GET /api/v1/customers
### POST /api/v1/customers
### PUT /api/v1/customers/{id}
### GET /api/v1/customers/{id}/history
### POST /api/v1/customers/{id}/redeem

---

## 🏷️ PROMOS ENDPOINTS (Phase 5)

### GET /api/v1/promos
### POST /api/v1/promos
### PUT /api/v1/promos/{id}
### DELETE /api/v1/promos/{id}

---

## 📅 SCHEDULES & BOOKINGS ENDPOINTS (Phase 6)

### GET /api/v1/schedules
### PUT /api/v1/schedules
### GET /api/v1/services
### POST /api/v1/services
### GET /api/v1/bookings
### POST /api/v1/bookings
### PUT /api/v1/bookings/{id}

---

## ⚠️ ERROR RESPONSES

### Format Error
```json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "Pesan error yang mudah dibaca"
}
```

### Error Codes
| Code | HTTP Status | Keterangan |
|------|-------------|------------|
| UNAUTHORIZED | 401 | Token tidak valid |
| FORBIDDEN | 403 | Tidak punya akses |
| NOT_FOUND | 404 | Data tidak ditemukan |
| VALIDATION_ERROR | 422 | Input tidak valid |
| SERVER_ERROR | 500 | Error server |

### Contoh Error
```json
{
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Harga harus lebih dari 0"
}
```
