# PRODUCT REQUIREMENTS DOCUMENT (PRD)

Dokumen Penanggung Jawab: ANALIS (Direktorat I: Bisnis & Pengetahuan)
Target Pembaca AI: Claude Code, Cursor, Codex, dan seluruh instans agen koding MUALNURDARZA.
Status Spesifikasi: Draf Terkunci (Frozen Specs Gate)

---

## 01 Product Overview
- **Product Name:** VISIT-AE (Aplikasi Lapangan Kunjungan Isolir & Retensi Pelanggan GriyaNet)
- **Tagline:** Solusi formulir cerdas lapangan berbasis Web PWA yang terintegrasi langsung dengan Spreadsheet monitoring retensi.
- **Description:** Aplikasi web mobile-first mandiri yang dipasang pada GitHub Pages untuk menggantikan Google Form konvensional. Aplikasi ini menyajikan filter bertingkat instan (Cabang -> AE -> WO Aktif), seluruh dropdown form dinamis langsung dari sheet `MASTER_DROPDOWN`, pembacaan koordinat GPS otomatis, kompresi foto di sisi klien, dan pencatatan hasil kunjungan secara realtime ke Google Sheets melalui backend Google Apps Script API dengan konfigurasi zero-secret.

## 02 Problem
1. **Keterbatasan Kaku Google Form**: Google Form tidak mendukung manipulasi DOM di sisi klien, sehingga hierarki pilihan Cabang -> AE -> WO harus direkayasa menggunakan puluhan halaman percabangan yang lambat dan rentan putus.
2. **Dropdown Statis Sulit Diperbarui**: Mengubah daftar kategori kendala atau opsi topik membutuhkan perubahan kode jika daftar tidak disinkronkan dari Google Sheets.
3. **Risiko Kebocoran Kredensial di Repositori Publik**: Menuliskan URL backend, Folder ID, atau kunci akses di kode GitHub Pages mengekspos sistem internal.
4. **Beban Kuota Foto & Ketiadaan Sensor GPS**: Foto kamera mentah 3-8 MB membebani kuota AE dan tanpa GPS terotomatisasi akurasi lokasi visit lemah.

## 03 Goal
Menyediakan antarmuka pengisian laporan visit isolir yang ringan, aman tanpa rahasia di kode publik, mudah dikustomisasi opsinya langsung dari `MASTER_DROPDOWN` di Spreadsheet, dapat di-install di layar utama ponsel AE (PWA), dan bebas data dummy.

## 04 Target Users
- **Account Executive (AE) Lapangan**: Pengguna utama di ponsel pintar untuk melihat WO aktif dan mengirim laporan kunjungan.
- **Branch Manager (BM) & Admin Retensi**: Pengelola Google Spreadsheet (`MONITORING_CABANG` dan `MASTER_DROPDOWN`), setup folder Drive via menu `VISIT-AE Admin`, dan penerbit link onboarding `#cfg=`.
- **Tim Retensi Pusat / Analis Bisnis**: Konsumen data yang mengevaluasi tren taksonomi kendala dan efektivitas penyelamatan kohort P1-P4.

## 05 Core Features (Version 1 MVP)
1. **Filter Bertingkat Instan 3 Tingkat (Cascading Select)**:
   - Level 1: Dropdown Cabang dengan indikator dinamis `[Nama Cabang] (N WO Aktif)`.
   - Level 2: Dropdown AE terfilter untuk cabang terpilih.
   - Level 3: Dropdown Work Order Aktif (`OPEN` / `SCHEDULED`).
2. **100% Dropdown Dinamis dari Sheet `MASTER_DROPDOWN`**:
   - Seluruh opsi Urutan Visit, Topik 1-7, Kategori Pain Point, Kelompok Detail Kendala berpasangan (plus opsi ketik manual fallback), dan Kategori Upaya Penyelamatan berikut pemetaan Target Status WO dibaca langsung melalui `doGet()`.
3. **Manajemen Koneksi Aman di Belakang Layar Tanpa Ekspos Rahasia**:
   - Backend menyimpan Folder Drive ID, Spreadsheet ID opsional, dan App Access Key di `PropertiesService`.
   - Admin menerbitkan tautan aktivasi `#cfg=` yang diproses otomatis di belakang layar ke `localStorage` dan langsung dihapus dari address bar; AE tidak mengisi URL `/exec` atau Access Key pada tampilan awal.
   - Panel pengaturan koneksi hanya dapat dibuka secara tersembunyi oleh Admin melalui parameter `?admin=1` atau `#admin`.
4. **Sinkronisasi Otomatis Tanpa Tombol Refresh Manual**:
   - Data WO aktif dan `MASTER_DROPDOWN` disinkronkan otomatis saat aplikasi dibuka, secara berkala saat aktif di layar, saat peramban kembali fokus (`visibilitychange` dengan jeda anti-spam) atau jaringan pulih (`online`), serta setelah laporan terkirim (`doPost`), tanpa memutus atau menghapus formulir yang sedang diisi AE.
   - Header hanya menampilkan indikator status sinkronisasi pasif (`Belum Aktif`, `Menyinkronkan...`, `Sinkron HH:MM`, `Offline`, `Sinyal Lemah`) tanpa tombol refresh manual.
5. **Template Spreadsheet Kosong (`TEMPLATE-SPREADSHEET-VISIT-AE.xlsx`)**:
   - Berisi 3 sheet terstruktur (`MONITORING_CABANG`, `RESPON_FORM_VISIT`, `MASTER_DROPDOWN`) dengan 0 data dummy WO dan 0 baris respon awal.
6. **Kartu Konteks Pelanggan, GPS Geolocation, Kompresi Foto (< 200 KB), & PWA Installable**:
   - Sama dengan spesifikasi inti, bebas dari data tiruan/mock di produksi.

## 06 Out of Scope (For Now)
- Gateway pembayaran online atau pemrosesan transaksi uang di aplikasi.
- Sistem otentikasi login multi-faktor berbasis akun individual (otorisasi menggunakan Access Key tim dari Admin).
- Tab riwayat kunjungan masa lalu atau dasbor analitik grafik multi-bulan di dalam web app.
- Fitur live chat internal antar karyawan di dalam aplikasi.
- Sinkronisasi basis data offline dua arah (IndexedDB background sync).

## 07 Success Metrics
- Zero hardcoded secret/ID/dummy data di seluruh file repositori publik.
- 100% perubahan teks dropdown pada `MASTER_DROPDOWN` tersinkron otomatis ke formulir PWA tanpa tombol refresh manual dan tanpa edit kode HTML/JS.
- Ukuran foto terkompresi di bawah 250 KB sebelum transmisi.

## 08 Acceptance Criteria
- Spreadsheet template benar-benar kosong dari data WO dan Visit Isolir AE.
- Aplikasi yang belum diaktivasi hanya menampilkan pemberitahuan ramah agar AE membuka tautan aktivasi dari Admin (tanpa kolom URL `/exec` atau Access Key di tampilan awal) dan tanpa memuat data tiruan.
- Saat terhubung ke sheet kosong (0 WO), seluruh opsi dropdown formulir tetap terbaca dan terisi penuh dari `MASTER_DROPDOWN`.
- Tidak ada tombol `Refresh Data` dan tidak ada karakter emoji pada antarmuka pengguna maupun file sistem.
