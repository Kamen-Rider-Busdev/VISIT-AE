# VISIT-AE: APLIKASI FORMULIR LAPANGAN RETENSI ISOLIR GRIYANET

Aplikasi Web Mobile-First (Progressive Web App) untuk Account Executive (AE) Lapangan GriyaNet dalam menjalankan kunjungan silaturahmi pelanggan isolir (Kohort P1 hingga P4) dan mencatatkan hasil visit secara realtime ke Google Sheets.

---

## 01 Keunggulan Utama

1. **Pilihan Bertingkat Instan (3-Tier Cascading Dropdown)**:
   - Level 1: Pilih Cabang Operasional dengan counter jumlah WO aktif.
   - Level 2: Pilih Nama AE Pelaksana terfilter untuk cabang terpilih.
   - Level 3: Pilih Work Order Aktif (hanya menampilkan WO berstatus `OPEN` atau `SCHEDULED`).
2. **Master Dropdown Dinamis dari Spreadsheet (`MASTER_DROPDOWN`)**:
   - Seluruh opsi formulir (Urutan Visit, Evaluasi 7 Topik, Taksonomi Pain Point, Detail Kendala berpasangan, dan Kategori Upaya) diambil langsung dari sheet `MASTER_DROPDOWN`. Admin dapat menambah atau mengubah daftar opsi langsung di Google Sheets tanpa menyentuh kode web.
3. **Zero-Exposure Credential Security**:
   - Repositori publik GitHub Pages tidak menyimpan URL Deployment, Folder Drive ID, Spreadsheet ID, maupun Kode Akses apa pun.
   - Kredensial backend disimpan di Google Apps Script `PropertiesService`, sedangkan browser AE menerima konfigurasi melalui URL hash fragment (`#cfg=`) atau panel Koneksi yang tersimpan lokal di `localStorage`.
4. **Kartu Konteks Pelanggan Otomatis & GPS/Foto Terkompresi**:
   - Pintasan WhatsApp `wa.me`, penguncian koordinat Geolocation API, dan kompresi foto kamera di sisi klien (< 200 KB) sebelum dikirim ke Google Drive.

---

## 02 Arsitektur Sistem & Alur Transmisi Data

```text
[ Ponsel AE (PWA di GitHub Pages) ]
                |  Simpan API URL & Access Key di localStorage
                |  (Onboarding aman via URL fragment #cfg=...)
                |
                | 1. GET ?key=... (WO Aktif + Opsi MASTER_DROPDOWN)
                v
[ Google Apps Script Web App API ] <----> [ PropertiesService (Folder ID & Key) ]
                |
                | 2. POST text/plain JSON (Laporan + accessKey + Foto Base64)
                +-----> [ Simpan Foto ke Google Drive Folder ]
                +-----> [ Tulis Baris ke Sheet RESPON_FORM_VISIT (20 Kolom A-T) ]
                +-----> [ Update Status WO di MONITORING_CABANG (Kolom W) ]
```

---

## 03 Struktur Direktori

```text
VISIT-AE/
├── AGENTS.md                             # Aturan operasional agen pengembang AI
├── CLAUDE.md                             # Entrypoint konfigurasi agen (@AGENTS.md)
├── README.md                             # Dokumentasi proyek dan panduan deployment
├── index.html                            # Aplikasi web tunggal terpadu (HTML5 + Tailwind + PWA)
├── manifest.json                         # Web App Manifest untuk PWA
├── sw.js                                 # Service Worker (Network-First shell caching)
├── backend/                              # Kode sumber Google Apps Script API
│   └── API-VISIT-ISOLIR.gs               # Endpoint doGet(), doPost(), dan menu VISIT-AE Admin
├── spreadsheet/                          # Template workbook kosong siap impor ke Google Sheets
│   └── TEMPLATE-SPREADSHEET-VISIT-AE.xlsx
├── assets/                               # Ikon dan aset statis PWA
│   ├── icon-192.png                      # Ikon PWA standar
│   └── icon-512.png                      # Ikon PWA resolusi tinggi
└── docs/                                 # The 4 Files Framework
    ├── PRD.md                            # Spesifikasi kebutuhan produk & Out of Scope terkunci
    ├── DESIGN-SYSTEM.md                  # Spesifikasi token warna Vengeance UI tema terang
    ├── ARCHITECTURE.md                   # Topologi arsitektur sistem dan kontrak API
    ├── CODE-STYLE.md                     # Pedoman gaya penulisan kode dan konvensi
    ├── SECURITY.md                       # Kebijakan keamanan, zero-secret, dan sanitasi
    └── TESTING.md                        # Rencana pengujian fungsional dan kriteria penerimaan
```

---

## 04 Panduan Penerapan & Deployment

### Langkah 1: Siapkan Google Spreadsheet Kosong dari Template
1. Buka Google Drive dan unggah berkas `spreadsheet/TEMPLATE-SPREADSHEET-VISIT-AE.xlsx`, lalu pilih **Open with Google Sheets** > **Save as Google Sheets**.
2. Template berisi 3 sheet kosong tanpa data dummy:
   - `MONITORING_CABANG` (23 kolom `A-W`, rumus terproteksi `=IF(D10="", "", ...)`).
   - `RESPON_FORM_VISIT` (20 kolom `A-T`, terhubung otomatis ke XLOOKUP).
   - `MASTER_DROPDOWN` (sumber kebenaran seluruh dropdown sheet dan formulir web).
3. Buat 1 folder kosong di Google Drive untuk menampung foto bukti kunjungan AE, lalu salin **Folder ID** dari URL browser (`drive.google.com/drive/folders/[ID_FOLDER]`).

### Langkah 2: Pasang Backend API & Amankan Kredensial di Google Apps Script
1. Di Google Sheets hasil impor tadi, buka menu **Extensions** > **Apps Script**.
2. Salin seluruh isi `backend/API-VISIT-ISOLIR.gs` ke editor Apps Script dan simpan (`Ctrl + S`).
3. Refresh tab Google Sheets hingga muncul menu baru **`VISIT-AE Admin`** di bilah atas.
4. Klik **`VISIT-AE Admin`** > **`1. Setup Kredensial & Folder Aman`**:
   - Tempelkan ID Folder Google Drive foto kunjungan.
   - Klik **Buat Acak** untuk membuat Kode Akses Aplikasi (App Access Key), lalu klik **Simpan Kredensial Aman**. Seluruh rahasia tersimpan di `PropertiesService`, bukan di kode sumber.
5. Kembali ke editor Apps Script, klik **Deploy** > **New deployment** > pilih **Web App**:
   - **Execute as**: `Me`.
   - **Who has access**: `Anyone`.
6. Salin URL deployment `/exec` yang dihasilkan (contoh: `https://script.google.com/macros/s/.../exec`).

### Langkah 3: Publikasikan Frontend ke GitHub Pages
1. Pastikan seluruh berkas di repositori `VISIT-AE` sudah ter-push ke branch `main`.
2. Di GitHub (`Kamen-Rider-Busdev/VISIT-AE`), buka **Settings** > **Pages**, pilih **Deploy from a branch** (`main` / `/(root)`).
3. Aplikasi aktif di `https://kamen-rider-busdev.github.io/VISIT-AE/`.

### Langkah 4: Bagikan Link Onboarding Aman ke Tim AE
1. Kembali ke Google Sheets, buka **`VISIT-AE Admin`** > **`2. Buat Link Onboarding AE`**.
2. Masukkan URL GitHub Pages dan URL Web App (`/exec`), lalu klik **Buat & Simpan Link Onboarding**.
3. Bagikan link berakhiran `#cfg=...` ke grup internal AE. Saat AE membuka link tersebut di ponsel, browser membaca fragment `#cfg=` secara lokal, menyimpannya ke `localStorage`, dan langsung menghapus `#cfg=` dari address bar.

---

## 05 Repositori Resmi
- **GitHub Remote:** `https://github.com/Kamen-Rider-Busdev/VISIT-AE.git`
- **Lisensi:** Milik Internal GriyaNet (All Rights Reserved).
