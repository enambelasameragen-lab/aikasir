# 📋 PRD: POS UNIVERSAL + AI CONFIGURATOR
## Sistem Point of Sale untuk UMKM Indonesia

---

## 📌 INFORMASI DOKUMEN

| Item | Detail |
|------|--------|
| **Nama Proyek** | POS Universal UMKM |
| **Versi** | 1.0 |
| **Status** | Planning → Phase 1 |
| **Target User** | UMKM Indonesia (warung, toko, salon, laundry, dll) |

---

## 🎯 VISI & MISI

### Visi
**"Setiap UMKM Indonesia punya POS digital yang mudah dalam 2 menit"**

### Misi
1. Hilangkan kerumitan setup POS tradisional
2. Gunakan AI untuk setup otomatis sesuai jenis bisnis
3. Bahasa sehari-hari, bukan istilah teknis
4. 1 sistem untuk semua jenis UMKM

---

## 👤 TARGET USER: PERSONA

### Persona Utama: Bu Ani
```
Nama: Bu Ani
Usia: 35-50 tahun
Usaha: Warung kopi pinggir jalan
Tech skill: Bisa WhatsApp, kadang bingung pakai aplikasi baru

Masalah Sekarang:
- Catat penjualan masih di buku
- Sering lupa stok habis
- Tidak tahu untung berapa per hari
- Aplikasi POS yang ada terlalu ribet

Harapan:
- "Yang penting gampang"
- "Jangan ribet"
- "Bisa lihat untung hari ini"
```

---

## 🏗️ ARSITEKTUR SISTEM

### Konsep Utama: 1 Sistem, Banyak Config

```
┌─────────────────────────────────────────────────────┐
│            1 APLIKASI POS UNIVERSAL                 │
│                  (1 Codebase)                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│   🤖 AI CONFIGURATOR                                │
│   "Bisnis apa?" → Generate config → POS siap       │
│                                                     │
├──────────┬──────────┬──────────┬───────────────────┤
│  Config  │  Config  │  Config  │  Config           │
│  Warung  │  Salon   │  Laundry │  Toko Baju        │
└──────────┴──────────┴──────────┴───────────────────┘
```

### Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React + Tailwind CSS
- **Database**: MongoDB
- **AI**: OpenAI GPT

### Prinsip Arsitektur
| Prinsip | Penjelasan |
|---------|------------|
| **Core Engine** | Tidak tahu bisnis, hanya CRUD & hitung |
| **Config Driven** | Perilaku ditentukan oleh JSON config |
| **Module Optional** | Fitur tambahan bisa ON/OFF |
| **Multi-Tenant** | 1 sistem, data terpisah per toko |

---

## 🗺️ ROADMAP DEVELOPMENT

### Overview 6 Phase

```
PHASE 1: Bisa Jualan (3-5 hari)
    ↓ ✅ Bisa demo ke investor
PHASE 2: Toko Sendiri (1 minggu)
    ↓ ✅ Multi-tenant + subdomain
PHASE 3: Cara Bayar & Laporan (1 minggu)
    ↓ ✅ Payment lengkap + reporting
PHASE 4: Stok Barang (2 minggu)
    ↓ ✅ Inventory management
PHASE 5: Pelanggan & Promo (2 minggu)
    ↓ ✅ CRM + loyalty
PHASE 6: Booking & Jadwal (2 minggu)
    ↓ ✅ Untuk bisnis jasa
```

---

## 📱 PHASE 1: BISA JUALAN

### Goal
**Bu Ani bisa catat jualan hari ini dalam 2 menit**

### Fitur Phase 1

#### 1. AI Onboarding (Ngobrol Santai)
```
🤖 "Halo! Mau bikin toko apa nih?"
👤 "Warung kopi"

🤖 "Sip! Nama warungnya apa?"
👤 "Kopi Bang Jago"

🤖 "Terakhir, jualan apa aja? Sebutin beberapa"
👤 "Kopi susu, kopi hitam, gorengan"

🤖 "Mantap! Toko kamu sudah jadi ✅"
```

#### 2. Tambah Barang Jualan
- Input: Nama + Harga
- Tidak ada SKU, barcode, kategori kompleks

#### 3. Catat Penjualan
- Pilih barang → Masuk keranjang → Bayar
- Maksimal 3 tap untuk 1 transaksi

#### 4. Cetak/Kirim Struk
- Printer thermal
- Printer Bluetooth
- Kirim via WhatsApp (PDF/gambar)

#### 5. Lihat Hasil Hari Ini
- Total penjualan
- Jumlah transaksi
- Barang paling laku

### Database Phase 1
```
tenants
├── id (UUID)
├── name
├── subdomain
├── config_json
└── created_at

users
├── id (UUID)
├── tenant_id
├── email
├── password
├── name
└── role (pemilik/kasir)

items
├── id (UUID)
├── tenant_id
├── name
├── price
└── is_active

transactions
├── id (UUID)
├── tenant_id
├── items_json
├── total
├── payment_method
├── payment_amount
├── change_amount
├── status
├── created_by
└── created_at
```

### API Phase 1
```
POST /api/v1/ai/onboard          → AI interview & create tenant
POST /api/v1/auth/login          → Login user
GET  /api/v1/items               → List barang
POST /api/v1/items               → Tambah barang
PUT  /api/v1/items/{id}          → Edit barang
DELETE /api/v1/items/{id}        → Hapus barang
POST /api/v1/transactions        → Catat penjualan
GET  /api/v1/transactions        → Riwayat penjualan
GET  /api/v1/transactions/{id}   → Detail penjualan
GET  /api/v1/dashboard/today     → Ringkasan hari ini
```

### UI Screens Phase 1
1. **Halaman Onboarding** - Chat dengan AI
2. **Halaman Login** - Email + password
3. **Halaman Utama (POS)** - Catat penjualan
4. **Halaman Barang** - Kelola barang jualan
5. **Halaman Riwayat** - List transaksi
6. **Halaman Ringkasan** - Dashboard hari ini

### Kriteria Selesai Phase 1
- [ ] AI bisa tanya & generate tenant dalam 3 pertanyaan
- [ ] User bisa login
- [ ] Bisa tambah/edit/hapus barang
- [ ] Bisa catat penjualan (keranjang → bayar)
- [ ] Bisa lihat struk (print/WA)
- [ ] Bisa lihat ringkasan hari ini
- [ ] Bisa lihat riwayat transaksi

---

## 🏪 PHASE 2: TOKO SENDIRI

### Goal
**Setiap UMKM punya alamat toko sendiri (subdomain)**

### Fitur Phase 2
1. **Subdomain Routing** - kopibangbago.posmu.com
2. **Tambah Karyawan** - Invite kasir via email
3. **Hak Akses** - Pemilik vs Kasir
4. **Pengaturan Toko** - Edit profil bisnis

### Database Tambahan
```
-- Tambah kolom di users
invited_by (UUID)
status (active/invited/disabled)

-- Table baru
sessions
├── id
├── user_id
├── token
└── expires_at
```

### API Tambahan
```
POST /api/v1/auth/register       → Register owner baru
POST /api/v1/users/invite        → Invite kasir
GET  /api/v1/users               → List karyawan
PUT  /api/v1/users/{id}          → Edit karyawan
DELETE /api/v1/users/{id}        → Hapus karyawan
GET  /api/v1/settings            → Get settings
PUT  /api/v1/settings            → Update settings
```

### Kriteria Selesai Phase 2
- [ ] Subdomain routing berjalan
- [ ] Data antar tenant terpisah
- [ ] Pemilik bisa invite kasir
- [ ] Kasir hanya bisa catat jualan
- [ ] Settings toko bisa diedit

---

## 💳 PHASE 3: CARA BAYAR & LAPORAN

### Goal
**Terima berbagai pembayaran, lihat laporan lengkap**

### Fitur Phase 3
1. **Multi Payment** - Tunai, QRIS, Transfer
2. **Hitung Kembalian** - Otomatis
3. **Batalkan Transaksi** - Void
4. **Laporan** - Harian, mingguan, bulanan
5. **Export** - Download Excel

### Database Tambahan
```
payments
├── id (UUID)
├── transaction_id
├── method (tunai/qris/transfer)
├── amount
├── status
├── reference_number
└── created_at

-- Tambah kolom di transactions
payment_status
voided_at
voided_by
```

### API Tambahan
```
POST /api/v1/payments                    → Create payment
POST /api/v1/transactions/{id}/void      → Batalkan
GET  /api/v1/reports/daily               → Laporan harian
GET  /api/v1/reports/weekly              → Laporan mingguan
GET  /api/v1/reports/monthly             → Laporan bulanan
GET  /api/v1/reports/export              → Export Excel
```

### Kriteria Selesai Phase 3
- [ ] Support 3 cara bayar (tunai, QRIS, transfer)
- [ ] Kembalian otomatis untuk tunai
- [ ] Bisa batalkan transaksi
- [ ] Laporan per periode
- [ ] Export ke Excel

---

## 📦 PHASE 4: STOK BARANG

### Goal
**Tidak kehabisan stok lagi**

### Fitur Phase 4
1. **Catat Stok** - Jumlah per barang
2. **Otomatis Berkurang** - Saat ada penjualan
3. **Peringatan** - Notifikasi stok menipis
4. **Catat Belanja** - Pembelian stok baru
5. **Laporan Stok** - Keluar masuk barang

### Database Tambahan
```
stocks
├── id (UUID)
├── tenant_id
├── item_id
├── quantity
├── min_quantity
└── updated_at

stock_movements
├── id (UUID)
├── stock_id
├── type (in/out/adjustment)
├── quantity
├── reference_type
├── reference_id
├── notes
└── created_at
```

### API Tambahan
```
GET  /api/v1/stocks                      → List stok
PUT  /api/v1/stocks/{item_id}            → Update stok
POST /api/v1/stocks/purchase             → Catat belanja
GET  /api/v1/stocks/alerts               → Stok menipis
GET  /api/v1/stocks/movements            → Riwayat stok
```

### Kriteria Selesai Phase 4
- [ ] Stok tercatat per barang
- [ ] Otomatis berkurang saat jualan
- [ ] Ada peringatan stok menipis
- [ ] Bisa catat pembelian stok
- [ ] Laporan keluar masuk stok

---

## 👥 PHASE 5: PELANGGAN & PROMO

### Goal
**Pelanggan balik lagi**

### Fitur Phase 5
1. **Data Pelanggan** - Nama, HP, riwayat
2. **Poin Reward** - Otomatis dapat poin
3. **Tukar Poin** - Gratis/diskon
4. **Promo** - Beli 2 gratis 1, diskon %
5. **Member** - Harga khusus

### Database Tambahan
```
customers
├── id (UUID)
├── tenant_id
├── name
├── phone
├── email
├── points
└── created_at

promos
├── id (UUID)
├── tenant_id
├── name
├── type (discount_percent/discount_amount/buy_x_get_y)
├── value
├── conditions_json
├── start_date
├── end_date
├── is_active
└── created_at

-- Tambah kolom di transactions
customer_id
promo_id
discount_amount
points_earned
```

### API Tambahan
```
GET  /api/v1/customers                   → List pelanggan
POST /api/v1/customers                   → Tambah pelanggan
PUT  /api/v1/customers/{id}              → Edit pelanggan
GET  /api/v1/customers/{id}/history      → Riwayat belanja
POST /api/v1/customers/{id}/redeem       → Tukar poin
GET  /api/v1/promos                      → List promo
POST /api/v1/promos                      → Buat promo
PUT  /api/v1/promos/{id}                 → Edit promo
DELETE /api/v1/promos/{id}               → Hapus promo
```

### Kriteria Selesai Phase 5
- [ ] Bisa simpan data pelanggan
- [ ] Poin otomatis bertambah
- [ ] Bisa tukar poin
- [ ] Bisa buat promo
- [ ] Promo otomatis apply saat checkout

---

## 📅 PHASE 6: BOOKING & JADWAL

### Goal
**Untuk usaha yang perlu janji temu**

### Target Bisnis
- Barbershop, Salon, Spa
- Servis (AC, HP, Motor)
- Laundry
- Kursus/Les

### Fitur Phase 6
1. **Jadwal Buka** - Per hari
2. **Layanan** - Nama, durasi, harga
3. **Booking** - Pilih waktu
4. **Status Pesanan** - Untuk laundry/servis
5. **Pengingat** - Notifikasi WhatsApp

### Database Tambahan
```
schedules
├── id (UUID)
├── tenant_id
├── day_of_week
├── open_time
├── close_time
└── is_open

services
├── id (UUID)
├── tenant_id
├── name
├── duration_minutes
├── price
└── is_active

bookings
├── id (UUID)
├── tenant_id
├── service_id
├── customer_id
├── datetime
├── status (pending/confirmed/completed/cancelled)
├── notes
└── created_at

orders (untuk laundry/servis)
├── id (UUID)
├── tenant_id
├── customer_id
├── items_json
├── total
├── status (received/processing/ready/completed)
├── estimated_completion
├── notes
└── created_at
```

### API Tambahan
```
GET  /api/v1/schedules                   → Jadwal buka
PUT  /api/v1/schedules                   → Update jadwal
GET  /api/v1/services                    → List layanan
POST /api/v1/services                    → Tambah layanan
GET  /api/v1/bookings                    → List booking
POST /api/v1/bookings                    → Buat booking
PUT  /api/v1/bookings/{id}               → Update booking
GET  /api/v1/orders                      → List pesanan
POST /api/v1/orders                      → Buat pesanan
PUT  /api/v1/orders/{id}/status          → Update status
```

### Kriteria Selesai Phase 6
- [ ] Bisa atur jadwal buka
- [ ] Bisa tambah layanan dengan durasi
- [ ] Pelanggan bisa booking
- [ ] Ada status pesanan (untuk laundry/servis)
- [ ] Pengingat otomatis (optional)

---

## 🛡️ PRINSIP DEVELOPMENT

### Aturan "Tidak Boleh Break"
| Aturan | Penjelasan |
|--------|------------|
| ✅ API Versioning | `/v1/` tetap jalan selamanya |
| ✅ DB Migration Only ADD | Tidak pernah DROP atau RENAME |
| ✅ Feature Flag | Fitur baru default OFF |
| ✅ Backward Compatible | Request lama tetap valid |
| ✅ Test Before Deploy | Automated test wajib pass |

### Bahasa di Aplikasi
| ❌ Jangan Pakai | ✅ Pakai Ini |
|-----------------|--------------|
| Transaction | Penjualan |
| Item | Barang |
| Total Amount | Total |
| Payment | Bayar |
| Dashboard | Ringkasan |
| Submit | Simpan |
| Cancel | Batal |
| Inventory | Stok |
| Customer | Pelanggan |
| Report | Laporan |

### Prinsip UI/UX
| Prinsip | Implementasi |
|---------|--------------|
| Maksimal 3 tap | Dari buka app → selesai transaksi |
| Bahasa manusia | "Simpan" bukan "Submit" |
| Angka besar | Font besar untuk harga & total |
| Warna jelas | Hijau = bagus, Merah = perhatian |
| Konfirmasi penting | "Yakin hapus?" untuk aksi berbahaya |

---

## 🧪 TESTING STRATEGY

### Per Phase Testing
1. **Unit Test** - API endpoint
2. **Integration Test** - Flow lengkap
3. **UI Test** - Screenshot & interaction
4. **Manual Test** - User scenario

### Test Scenarios Phase 1
```
1. AI Onboarding
   - User bisa chat dengan AI
   - AI generate tenant & items
   - User langsung bisa login

2. Manajemen Barang
   - Tambah barang baru
   - Edit harga barang
   - Hapus barang
   - List barang muncul di POS

3. Transaksi
   - Pilih barang → masuk keranjang
   - Ubah quantity
   - Hapus dari keranjang
   - Proses bayar tunai
   - Hitung kembalian benar
   - Struk bisa dilihat

4. Dashboard
   - Total penjualan hari ini benar
   - Jumlah transaksi benar
   - Barang terlaris benar
```

---

## 📊 CONFIG JSON STRUCTURE

### Config per Jenis Bisnis

#### Warung/Kafe
```json
{
  "business_type": "food_beverage",
  "features": {
    "stock": true,
    "booking": false,
    "order_status": false,
    "variants": false
  },
  "payment": {
    "methods": ["tunai", "qris"],
    "allow_dp": false
  },
  "unit": "pcs"
}
```

#### Barbershop/Salon
```json
{
  "business_type": "service_appointment",
  "features": {
    "stock": false,
    "booking": true,
    "order_status": false,
    "variants": false
  },
  "payment": {
    "methods": ["tunai", "qris", "transfer"],
    "allow_dp": false
  },
  "unit": "layanan"
}
```

#### Laundry
```json
{
  "business_type": "service_order",
  "features": {
    "stock": false,
    "booking": false,
    "order_status": true,
    "variants": false
  },
  "payment": {
    "methods": ["tunai", "qris", "transfer"],
    "allow_dp": true
  },
  "unit": "kg",
  "order_statuses": ["diterima", "proses", "selesai", "diambil"]
}
```

#### Toko Retail (Baju, dll)
```json
{
  "business_type": "retail",
  "features": {
    "stock": true,
    "booking": false,
    "order_status": false,
    "variants": true
  },
  "payment": {
    "methods": ["tunai", "qris", "transfer"],
    "allow_dp": false
  },
  "unit": "pcs",
  "variant_types": ["ukuran", "warna"]
}
```

---

## 📅 TIMELINE

```
Minggu 1     : PHASE 1 - Bisa Jualan
Minggu 2     : PHASE 2 - Toko Sendiri
Minggu 3     : PHASE 3 - Cara Bayar & Laporan
Minggu 4-5   : PHASE 4 - Stok Barang
Minggu 6-7   : PHASE 5 - Pelanggan & Promo
Minggu 8-9   : PHASE 6 - Booking & Jadwal
```

---

## 🚀 NEXT STEPS

1. ✅ Dokumentasi PRD selesai
2. ⏳ Implementasi Phase 1
3. ⏳ Testing Phase 1
4. ⏳ Review & iterate

---

*Dokumen ini akan di-update seiring development*
