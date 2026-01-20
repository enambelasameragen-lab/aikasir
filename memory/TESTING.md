# 🧪 TESTING CHECKLIST

## Overview
Dokumen ini berisi checklist testing untuk setiap phase.
Setiap phase harus LULUS semua test sebelum lanjut ke phase berikutnya.

---

## ✅ PHASE 1: BISA JUALAN

### 1. AI Onboarding Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| AI-01 | Buka halaman onboarding | Chat AI muncul dengan sapaan | ⬜ |
| AI-02 | Jawab "warung kopi" | AI tanya nama warung | ⬜ |
| AI-03 | Jawab nama warung | AI tanya jualan apa | ⬜ |
| AI-04 | Jawab item jualan | Toko berhasil dibuat | ⬜ |
| AI-05 | Cek tenant tersimpan di DB | Data tenant ada | ⬜ |
| AI-06 | Cek user tersimpan di DB | Data user ada | ⬜ |
| AI-07 | Cek items tersimpan di DB | Items dari AI ada | ⬜ |

### 2. Authentication Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| AUTH-01 | Login dengan email & password benar | Dapat token, redirect ke POS | ⬜ |
| AUTH-02 | Login dengan password salah | Error "Password salah" | ⬜ |
| AUTH-03 | Login dengan email tidak terdaftar | Error "Email tidak ditemukan" | ⬜ |
| AUTH-04 | Akses halaman tanpa login | Redirect ke login | ⬜ |
| AUTH-05 | Logout | Token dihapus, redirect ke login | ⬜ |

### 3. Items Management Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| ITEM-01 | Lihat daftar barang | List barang muncul | ⬜ |
| ITEM-02 | Tambah barang baru | Barang tersimpan, muncul di list | ⬜ |
| ITEM-03 | Tambah barang tanpa nama | Error validasi | ⬜ |
| ITEM-04 | Tambah barang harga 0 | Error validasi | ⬜ |
| ITEM-05 | Edit nama barang | Nama terupdate | ⬜ |
| ITEM-06 | Edit harga barang | Harga terupdate | ⬜ |
| ITEM-07 | Hapus barang | Barang tidak muncul lagi | ⬜ |
| ITEM-08 | Search barang | Filter berjalan | ⬜ |

### 4. POS / Catat Penjualan Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| POS-01 | Klik barang di grid | Barang masuk keranjang | ⬜ |
| POS-02 | Tambah qty barang | Qty bertambah, subtotal update | ⬜ |
| POS-03 | Kurangi qty barang | Qty berkurang, subtotal update | ⬜ |
| POS-04 | Hapus barang dari keranjang | Barang hilang dari keranjang | ⬜ |
| POS-05 | Total dihitung benar | Sum semua subtotal | ⬜ |
| POS-06 | Klik bayar | Modal payment muncul | ⬜ |
| POS-07 | Input uang diterima | Kembalian dihitung otomatis | ⬜ |
| POS-08 | Uang kurang dari total | Tombol bayar disabled | ⬜ |
| POS-09 | Proses pembayaran | Transaksi tersimpan | ⬜ |
| POS-10 | Struk muncul setelah bayar | Data struk benar | ⬜ |
| POS-11 | Keranjang kosong setelah bayar | Reset ke awal | ⬜ |

### 5. Transaction History Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| HIST-01 | Lihat riwayat hari ini | List transaksi muncul | ⬜ |
| HIST-02 | Klik detail transaksi | Modal detail muncul | ⬜ |
| HIST-03 | Cetak ulang struk | Struk bisa ditampilkan | ⬜ |
| HIST-04 | Filter by tanggal | Filter berjalan | ⬜ |

### 6. Dashboard Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| DASH-01 | Lihat ringkasan hari ini | Data muncul | ⬜ |
| DASH-02 | Total penjualan benar | Sum semua transaksi | ⬜ |
| DASH-03 | Jumlah transaksi benar | Count transaksi | ⬜ |
| DASH-04 | Barang terlaris benar | Sorted by qty sold | ⬜ |

### 7. API Backend Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| API-01 | POST /api/v1/ai/onboard | 200 OK | ⬜ |
| API-02 | POST /api/v1/auth/login | 200 OK + token | ⬜ |
| API-03 | GET /api/v1/items | 200 OK + list | ⬜ |
| API-04 | POST /api/v1/items | 201 Created | ⬜ |
| API-05 | PUT /api/v1/items/{id} | 200 OK | ⬜ |
| API-06 | DELETE /api/v1/items/{id} | 200 OK | ⬜ |
| API-07 | POST /api/v1/transactions | 201 Created | ⬜ |
| API-08 | GET /api/v1/transactions | 200 OK + list | ⬜ |
| API-09 | GET /api/v1/dashboard/today | 200 OK + data | ⬜ |

---

## ✅ PHASE 2: TOKO SENDIRI

### 1. Subdomain Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SUB-01 | Akses via subdomain | Tenant terdeteksi | ⬜ |
| SUB-02 | Subdomain tidak ada | Error 404 | ⬜ |
| SUB-03 | Data tenant A tidak bocor ke B | Data terpisah | ⬜ |

### 2. User Management Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| USER-01 | Invite kasir baru | Email terkirim | ⬜ |
| USER-02 | Kasir login | Berhasil login | ⬜ |
| USER-03 | Kasir tidak bisa akses settings | Forbidden | ⬜ |
| USER-04 | Pemilik bisa hapus kasir | User dihapus | ⬜ |

### 3. Settings Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SET-01 | Edit nama toko | Tersimpan | ⬜ |
| SET-02 | Edit alamat | Tersimpan | ⬜ |
| SET-03 | Edit no WA | Tersimpan | ⬜ |

---

## ✅ PHASE 3: CARA BAYAR & LAPORAN

### 1. Payment Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| PAY-01 | Bayar tunai | Transaksi sukses | ⬜ |
| PAY-02 | Bayar QRIS | QR muncul, konfirmasi manual | ⬜ |
| PAY-03 | Bayar transfer | Input referensi, sukses | ⬜ |
| PAY-04 | Batalkan transaksi | Status void | ⬜ |

### 2. Report Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| REP-01 | Laporan harian | Data benar | ⬜ |
| REP-02 | Laporan mingguan | Data benar | ⬜ |
| REP-03 | Laporan bulanan | Data benar | ⬜ |
| REP-04 | Export Excel | File terdownload | ⬜ |

---

## ✅ PHASE 4: STOK BARANG

### 1. Stock Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| STK-01 | Set stok awal | Tersimpan | ⬜ |
| STK-02 | Stok berkurang saat jualan | Auto update | ⬜ |
| STK-03 | Peringatan stok menipis | Notif muncul | ⬜ |
| STK-04 | Catat pembelian stok | Stok bertambah | ⬜ |
| STK-05 | Riwayat stok | Data lengkap | ⬜ |

---

## ✅ PHASE 5: PELANGGAN & PROMO

### 1. Customer Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| CUS-01 | Tambah pelanggan | Tersimpan | ⬜ |
| CUS-02 | Poin bertambah saat belanja | Auto update | ⬜ |
| CUS-03 | Tukar poin | Poin berkurang, reward dapat | ⬜ |
| CUS-04 | Riwayat belanja pelanggan | Data lengkap | ⬜ |

### 2. Promo Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| PRO-01 | Buat promo diskon % | Tersimpan | ⬜ |
| PRO-02 | Buat promo beli X gratis Y | Tersimpan | ⬜ |
| PRO-03 | Promo auto apply saat checkout | Diskon terhitung | ⬜ |
| PRO-04 | Promo expired tidak berlaku | Tidak apply | ⬜ |

---

## ✅ PHASE 6: BOOKING & JADWAL

### 1. Schedule Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SCH-01 | Set jadwal buka | Tersimpan | ⬜ |
| SCH-02 | Set hari libur | Tersimpan | ⬜ |

### 2. Booking Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| BOK-01 | Buat booking | Tersimpan | ⬜ |
| BOK-02 | Slot terisi tidak bisa dipilih | Disabled | ⬜ |
| BOK-03 | Update status booking | Status update | ⬜ |

### 3. Order Tests (Laundry)

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| ORD-01 | Terima cucian baru | Order tersimpan | ⬜ |
| ORD-02 | Update status pesanan | Status update | ⬜ |
| ORD-03 | Selesai & bayar | Transaksi tercatat | ⬜ |

---

## 🔧 HOW TO RUN TESTS

### Backend Tests
```bash
cd /app/backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd /app/frontend
yarn test
```

### E2E Tests (via Testing Agent)
```
Gunakan testing_agent dengan task detail per phase
```

---

## 📝 TEST REPORT TEMPLATE

### Phase: [X]
### Date: [YYYY-MM-DD]
### Tester: [Name/Agent]

| Category | Total | Passed | Failed | Skipped |
|----------|-------|--------|--------|---------|
| AI Onboarding | 7 | 0 | 0 | 0 |
| Authentication | 5 | 0 | 0 | 0 |
| Items | 8 | 0 | 0 | 0 |
| POS | 11 | 0 | 0 | 0 |
| History | 4 | 0 | 0 | 0 |
| Dashboard | 4 | 0 | 0 | 0 |
| API | 9 | 0 | 0 | 0 |
| **TOTAL** | **48** | **0** | **0** | **0** |

### Failed Tests:
- [List failed tests here]

### Notes:
- [Any observations]
