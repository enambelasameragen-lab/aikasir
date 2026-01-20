# 📋 AIKasir - PRD (Product Requirements Document)
## Sistem Point of Sale Universal untuk UMKM Indonesia

---

## 📌 INFORMASI DOKUMEN

| Item | Detail |
|------|--------|
| **Nama Proyek** | AIKasir - POS Universal UMKM |
| **Versi** | 2.0 |
| **Status** | Phase 1-3 Complete, Phase 4 In Progress |
| **Target User** | UMKM Indonesia (warung, toko, salon, laundry, dll) |
| **Tech Stack** | FastAPI + React + MongoDB + OpenAI |
| **Last Updated** | 2026-01-20 |

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

### Tech Stack
| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| **Backend** | FastAPI (Python) | REST API, async support |
| **Frontend** | React + Tailwind CSS | SPA, responsive |
| **Database** | MongoDB | NoSQL, flexible schema |
| **AI** | OpenAI GPT-4o-mini | Onboarding conversation |
| **Auth** | JWT + bcrypt | Token-based authentication |

### Arsitektur Multi-Tenant
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
│  Tenant  │  Tenant  │  Tenant  │  Tenant           │
│  Warung  │  Salon   │  Laundry │  Toko Baju        │
│ (tenant_id: xxx)                                    │
└──────────┴──────────┴──────────┴───────────────────┘
```

### Prinsip Arsitektur
| Prinsip | Penjelasan |
|---------|------------|
| **Core Engine** | Tidak tahu bisnis, hanya CRUD & hitung |
| **Config Driven** | Perilaku ditentukan oleh JSON config |
| **Module Optional** | Fitur tambahan bisa ON/OFF |
| **Multi-Tenant** | 1 sistem, data terpisah per toko via `tenant_id` |

---

## 🗺️ ROADMAP & STATUS

```
PHASE 1: Bisa Jualan ✅ COMPLETE
    ↓ AI Onboarding, POS, Dashboard
PHASE 2: Toko Sendiri ✅ COMPLETE
    ↓ Multi-user, Role-Based Access
PHASE 3: Cara Bayar & Laporan ✅ COMPLETE
    ↓ Multi-payment, Void, Reports
PHASE 4: Stok Barang 🔄 IN PROGRESS
    ↓ Stock tracking, auto-deduct, alerts
PHASE 5: Pelanggan & Promo ⬜ TODO
    ↓ CRM, loyalty points, promo
PHASE 6: Booking & Jadwal ⬜ TODO
    ↓ Scheduling untuk bisnis jasa
```

---

## ✅ PHASE 1: BISA JUALAN (COMPLETE)

### Fitur yang Diimplementasi
1. **AI Onboarding** - Chat dengan AI untuk setup toko
2. **POS/Kasir** - Catat penjualan dengan keranjang
3. **Pembayaran** - Hitung kembalian otomatis
4. **Struk Digital** - Share/print struk
5. **Dashboard** - Ringkasan penjualan hari ini
6. **Manajemen Barang** - CRUD barang jualan
7. **Riwayat** - List semua transaksi

### Flow AI Onboarding
```
🤖 "Halo! Mau bikin toko apa nih?"
👤 "Warung kopi"
🤖 "Sip! Nama warungnya apa?"
👤 "Kopi Bang Jago"
🤖 "Terakhir, jualan apa aja? Sebutin beberapa"
👤 "Kopi susu, kopi hitam, gorengan"
🤖 "Mantap! Toko kamu sudah jadi ✅"
→ Auto-generate: tenant, user, items
```

---

## ✅ PHASE 2: TOKO SENDIRI (COMPLETE)

### Fitur yang Diimplementasi
1. **Multi-User** - Pemilik bisa invite Kasir
2. **Role-Based Access Control**:
   - **Pemilik**: Full access (semua menu)
   - **Kasir**: Limited (Kasir, Barang, Riwayat, Ringkasan)
3. **Invite System** - Generate link untuk kasir baru
4. **User Management** - List, edit, nonaktifkan user

### Hak Akses per Role
| Menu | Pemilik | Kasir |
|------|---------|-------|
| Kasir | ✅ | ✅ |
| Barang | ✅ | ✅ |
| Riwayat | ✅ | ✅ |
| Ringkasan | ✅ | ✅ |
| Laporan | ✅ | ❌ |
| Stok | ✅ | ❌ |
| Karyawan | ✅ | ❌ |
| Pengaturan | ✅ | ❌ |

---

## ✅ PHASE 3: CARA BAYAR & LAPORAN (COMPLETE)

### Fitur yang Diimplementasi
1. **Multi Payment Methods**:
   - Tunai (dengan hitung kembalian)
   - QRIS (dengan referensi)
   - Transfer (dengan referensi)
2. **Void Transaction** - Batalkan transaksi (owner only)
3. **Reports Page**:
   - Summary cards (Total, Transaksi, Items, Rata-rata)
   - Payment breakdown by method
   - Top selling items
   - Date range filters
   - Export CSV & JSON

### Catatan Mocked Features
- QRIS QR code adalah placeholder icon (belum integrasi payment gateway)
- Bank account info di Transfer hardcoded

---

## 🔄 PHASE 4: STOK BARANG (IN PROGRESS)

### Fitur yang Diimplementasi
1. ✅ **Item Model dengan Stock Fields**:
   - `track_stock`: boolean - aktifkan pelacakan stok
   - `stock`: int - jumlah stok saat ini
   - `low_stock_threshold`: int - batas peringatan stok rendah
2. ✅ **Auto-Deduct Stock** - Stok berkurang otomatis saat penjualan
3. ✅ **Return Stock on Void** - Stok kembali saat transaksi dibatalkan
4. ✅ **Stock Validation** - Cegah penjualan jika stok tidak cukup
5. ✅ **Stock Management UI**:
   - Halaman Stok dengan summary cards
   - Tabel barang dengan stok
   - Adjust stock modal (add/subtract/set)
   - Stock history per item
   - Stock alerts (low stock, out of stock)
6. ✅ **Items Page Update** - Toggle "Lacak Stok" saat add/edit barang

### Database: Stock Adjustments
```javascript
stock_adjustments: {
  id: "uuid",
  tenant_id: "uuid",
  item_id: "uuid",
  item_name: "string",
  adjustment_type: "add|subtract|set|sale|void_return",
  quantity: int,
  stock_before: int,
  stock_after: int,
  reason: "string (optional)",
  transaction_id: "uuid (optional)",
  created_by: "uuid",
  created_by_name: "string",
  created_at: "datetime"
}
```

---

## ⬜ PHASE 5: PELANGGAN & PROMO (TODO)

### Fitur yang Akan Diimplementasi
1. **Data Pelanggan** - Nama, HP, riwayat belanja
2. **Poin Reward** - Otomatis dapat poin per transaksi
3. **Tukar Poin** - Gratis/diskon menggunakan poin
4. **Promo** - Beli 2 gratis 1, diskon %, diskon nominal
5. **Member** - Harga khusus untuk member

---

## ⬜ PHASE 6: BOOKING & JADWAL (TODO)

### Target Bisnis
- Barbershop, Salon, Spa
- Servis (AC, HP, Motor)
- Laundry
- Kursus/Les

### Fitur yang Akan Diimplementasi
1. **Jadwal Buka** - Per hari
2. **Layanan** - Nama, durasi, harga
3. **Booking** - Pilih waktu, pelanggan
4. **Status Pesanan** - Untuk laundry/servis
5. **Pengingat** - Notifikasi WhatsApp

---

## 🔑 TEST CREDENTIALS

```
=== OWNER ===
Email: kopibangjago@test.com
Password: 98ecf367
Role: pemilik

=== KASIR ===
Email: dedi@test.com
Password: kasir123
Role: kasir
```

---

## 📊 METRICS

| Phase | Backend Lines | Frontend Files | Test Coverage |
|-------|---------------|----------------|---------------|
| Phase 1 | 750+ | 15 | 100% |
| Phase 2 | +200 | +2 | 100% |
| Phase 3 | +150 | +1 | 100% |
| Phase 4 | +200 | +1 | In Progress |
| **Total** | ~1300 | 19 | - |

---

## 🛡️ PRINSIP DEVELOPMENT

### Aturan Penting
| Aturan | Penjelasan |
|--------|------------|
| ✅ API Versioning | `/api/v1/` prefix untuk semua endpoint |
| ✅ Tenant Isolation | Semua data difilter by `tenant_id` |
| ✅ MongoDB ObjectId | Selalu exclude `_id` dari response |
| ✅ JWT Auth | Token required di header `Authorization: Bearer {token}` |
| ✅ Role Check | Gunakan `require_owner()` untuk endpoint owner-only |

### Bahasa di Aplikasi (Indonesia)
| ❌ Jangan Pakai | ✅ Pakai Ini |
|-----------------|--------------|
| Transaction | Penjualan/Transaksi |
| Item | Barang |
| Payment | Bayar/Pembayaran |
| Dashboard | Ringkasan |
| Submit | Simpan |
| Cancel | Batal |
| Inventory | Stok |
| Customer | Pelanggan |
| Report | Laporan |
| Void | Batalkan |

---

*Dokumen ini di-update seiring development*
