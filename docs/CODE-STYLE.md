# CODE STYLE AND CONVENTIONS

Dokumen Penanggung Jawab: PEREKAYASA (Direktorat II: Teknologi & Rekayasa)
Target Pembaca AI: Claude Code, Cursor, Codex, dan seluruh instans agen koding MUALNURDARZA.
Status Spesifikasi: Draf Terkunci (Zero Emoji, Zero Secret, & Vengeance UI Standard)

---

## 01 General Principles
1. **Kejelasan di Atas Kepintaran (Clarity Over Cleverness)**: Tulis kode JavaScript murni dan markup HTML yang mudah dibaca, deterministik, dan bebas dari trik sintaks tersembunyi.
2. **Prinsip Mandiri Tanpa Build (Zero Build-Step)**: Berkas `index.html` dapat langsung disajikan di peramban dan GitHub Pages tanpa melalui kompilasi Node.js, Webpack, atau Vite.
3. **Pemisahan Rahasia & Kode Publik**: Seluruh URL deployment, ID folder, ID spreadsheet, dan Access Key dilarang ditulis sebagai konstanta di dalam `index.html` maupun `backend/API-VISIT-ISOLIR.gs`.
4. **Tanpa Karakter Emoji (Zero Emoji Policy)**: Dilarang keras menyematkan emoji dalam HTML, kode JavaScript, teks antarmuka, komentar, maupun log konsol.

## 02 Naming Conventions
- **Elemen DOM ID**: camelCase deskriptif, contoh: `selectCabang`, `selectAE`, `selectWO`, `syncStatusBadge`, `activationNotice`, `setupPanel`, `btnKunciGPS`, `btnSubmit`.
- **Fungsi JavaScript**: camelCase diawali kata kerja, contoh: `muatDataWO()`, `mulaiAutoSync()`, `renderSemuaDropdownForm()`, `handleCabangChange()`, `prosesOnboardingDariHash()`, `isAdminMode()`.
- **Variabel State**: camelCase deskriptif, contoh: `appData`, `dropdownOptions`, `selectedCustomer`, `fotoBase64Compressed`, `lastDropdownSignature`, `lastPohonSignature`.
- **Konstanta Konfigurasi**: UPPER_SNAKE_CASE di bagian atas skrip, contoh: `STORAGE_KEY_CFG`, `AUTO_SYNC_INTERVAL_MS`, `VISIBILITY_SYNC_COOLDOWN_MS`, `MAX_IMAGE_WIDTH`, `JPEG_QUALITY`.
- **Kelas CSS**: Mengikuti penamaan utilitas Tailwind CSS standar dengan token Vengeance UI.

## 03 State & Component Handling (Vanilla JavaScript)
Setiap interaksi data asinkron wajib memiliki penanganan status visual yang jelas:
1. **Status Belum Aktif (Unconfigured AE State)**: Saat konfigurasi belum ada di mode pengguna normal, `setupPanel` tetap tersembunyi di belakang layar; layar menampilkan kartu `activationNotice` dengan pesan non-teknis bagi AE dan badge header `"Belum Aktif"`. Panel setup manual hanya muncul apabila halaman dibuka dengan `?admin=1` atau `#admin`.
2. **Status Menyinkronkan (Syncing State)**: Badge status header menampilkan `"Menyinkronkan..."`; saat muat awal tampilkan banner pemuatan, sedangkan sinkronisasi latar belakang (`silent: true`) berjalan tanpa menghapus nilai formulir yang sedang diisi.
3. **Status Sukses / Kosong (Success / Empty State)**: Badge menampilkan `"Sinkron HH:MM"`; saat terhubung namun WO aktif berjumlah 0, tampilkan `"0 WO Aktif"` dan tetap sinkronkan seluruh dropdown formulir dari `MASTER_DROPDOWN`.
4. **Status Offline / Gangguan Sinyal (Degraded / Error State)**: Jika data sudah pernah termuat, gangguan jaringan sesaat hanya memperbarui badge ke `"Offline"` atau `"Sinyal Lemah"` tanpa menghapus formulir AE. Hanya bila belum ada data awal atau akses ditolak (`401`) maka tampilkan banner peringatan spesifik.

## 04 Client-Side Image Compression Guidelines
- Menggunakan elemen `<canvas>` HTML5 terisolasi di memori.
- Lebar maksimum dibatasi hingga 800 piksel dengan mempertahankan rasio aspek asli.
- Kompresi ke format `image/jpeg` dengan parameter kualitas `0.7`.
- Konversi blob hasil kompresi menjadi string Base64 bersih untuk ditransmisikan ke backend.
