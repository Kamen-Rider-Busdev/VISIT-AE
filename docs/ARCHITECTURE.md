# SYSTEM ARCHITECTURE SPECIFICATION

Dokumen Penanggung Jawab: PEREKAYASA (Direktorat II: Teknologi & Rekayasa)
Target Pembaca AI: Claude Code, Cursor, Codex, dan seluruh instans agen koding MUALNURDARZA.
Status Spesifikasi: Draf Terkunci (Zero Secret & Sheet-Driven Dropdowns)

---

## 01 High-Level Architecture Overview
Topologi hubungan sistem antara Frontend di GitHub Pages dan Backend di Google Workspace:

```text
+-----------------------------------------------------------------------------------+
|                        PONSEL PINTAR ACCOUNT EXECUTIVE (AE)                       |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |             Aplikasi Web PWA VISIT-AE (Hosting: GitHub Pages)               |  |
|  |  - Berkas: index.html (Single-File Mandiri + Tailwind CSS + Vengeance UI)  |  |
|  |  - Service Worker (sw.js Network-First) & Web Manifest (manifest.json)      |  |
|  |  - Onboarding Aman: #cfg= Hash Fragment -> localStorage (Tanpa Secret Repo) |  |
|  |  - Dynamic Dropdown Builder: Render form langsung dari MASTER_DROPDOWN      |  |
|  |  - Kompresi Gambar Klien (HTML Canvas API: Max 800px, JPEG 0.7)             |  |
|  |  - Sensor GPS Terkunci Otomatis (Browser Geolocation API)                   |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         |
                       HTTPS REST / JSON | (Simple Request, Anti-Preflight CORS)
                                         v
+-----------------------------------------------------------------------------------+
|                    GOOGLE APPS SCRIPT WEB APP (Backend Serverless API)            |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |  Keamanan & Konfigurasi:                                                    |  |
|  |  - Menu Spreadsheet "VISIT-AE Admin" -> PropertiesService (ScriptProperties)|  |
|  |  - Validasi Access Key pada setiap doGet(?key=...) dan doPost(accessKey)    |  |
|  +-----------------------------------------------------------------------------+  |
|  |  Fungsi doGet(e):                                                           |  |
|  |  - Baca Sheet MONITORING_CABANG (WO Aktif Status != CLOSED/TERMINATE)       |  |
|  |  - Baca Sheet MASTER_DROPDOWN (Dropdown Form, Mapping PainPoint & Upaya)    |  |
|  |  - Return JSON: { cabangList, pohonData, detailPelanggan, dropdownOptions } |  |
|  +-----------------------------------------------------------------------------+  |
|  |  Fungsi doPost(e) + LockService:                                            |  |
|  |  - Upload Foto Base64 ke Folder Drive (Folder ID dari ScriptProperties)     |  |
|  |  - Tulis 1 Baris ke RESPON_FORM_VISIT (20 Kolom A..T selaras XLOOKUP)       |  |
|  |  - Resolusi Target Status WO dari MASTER_DROPDOWN -> Update MONITORING_CABANG|  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         |
                                         +------------------+
                                         |                  |
                                         v                  v
                      +----------------------+   +---------------------+
                      | GOOGLE SPREADSHEET   |   | GOOGLE DRIVE        |
                      | - MONITORING_CABANG  |   | Folder Foto Visit   |
                      | - RESPON_FORM_VISIT  |   | (Izin Terbatas)     |
                      | - MASTER_DROPDOWN    |   +---------------------+
                      +----------------------+
```

## 02 Tech Stack
Dilarang memasang pustaka atau dependensi di luar daftar terotorisasi berikut:

| Lapisan Sistem         | Teknologi Terpilih           | Versi / Sumber           | Peran & Justifikasi |
|---|---|---|---|
| **Hosting Frontend**   | GitHub Pages                 | Static Site Hosting      | Zero server cost, CDN global, integrasi Git instan |
| **Pondasi Frontend**   | Single-File HTML5            | W3C Standard             | Zero build-step, langsung dieksekusi peramban |
| **CSS Framework**      | Tailwind CSS                 | CDN / Standalone Script  | Utilitas tata letak cepat dan responsif |
| **Design Tokens**      | Vengeance UI Tokens          | CSS Custom Properties    | Standar token tema terang, tactile button, motion |
| **Aplikasi Mobile**    | Progressive Web App (PWA)    | Manifest v2 + SW         | Dapat di-install di Homescreen ponsel AE |
| **Sensor Peramban**    | Geolocation API              | Native W3C Navigator     | Pembacaan titik koordinat latitude/longitude akurat |
| **Pemrosesan Citra**   | HTML Canvas API              | Native Browser Canvas    | Kompresi foto sebelum upload (< 200 KB) |
| **Backend API**        | Google Apps Script Web App   | V8 Runtime               | Penghubung resmi ke Google Sheets & Google Drive |
| **Penyimpanan Rahasia**| Apps Script ScriptProperties | PropertiesService        | Isolasi Folder ID, Spreadsheet ID, & Access Key |
| **Basis Data Tabular** | Google Sheets (3 Sheet)      | Template XLSX Kosong     | `MONITORING_CABANG`, `RESPON_FORM_VISIT`, `MASTER_DROPDOWN` |
| **Penyimpanan Objek**  | Google Drive                 | DriveApp Internal        | Folder penampungan foto bukti kunjungan AE |

## 03 Project Directory Structure

```text
VISIT-AE/
├── .git/                                 # Repositori Git mandiri (origin: GitHub Kamen-Rider-Busdev)
├── AGENTS.md                             # Aturan operasional multi-agen & rujukan spesifikasi
├── CLAUDE.md                             # Entrypoint konfigurasi agen (@AGENTS.md)
├── README.md                             # Panduan orientasi, tata cara deploy, dan arsitektur
├── index.html                            # Aplikasi web tunggal terpadu (UI, Logika, Kompresi, PWA)
├── manifest.json                         # Metadata PWA (nama aplikasi, tema warna, ikon homescreen)
├── sw.js                                 # Service worker Network-First untuk shell aplikasi
├── backend/                              # Kode sumber backend Google Apps Script
│   └── API-VISIT-ISOLIR.gs               # Endpoint doGet(), doPost(), & menu admin Spreadsheet
├── spreadsheet/                          # Template workbook kosong bebas data dummy
│   └── TEMPLATE-SPREADSHEET-VISIT-AE.xlsx
├── assets/                               # Ikon dan aset statis PWA
│   ├── icon-192.png                      # Ikon PWA resolusi standar
│   └── icon-512.png                      # Ikon PWA resolusi tinggi
└── docs/                                 # The 4 Files Framework + Dokumen Tata Kelola Sistem
    ├── PRD.md                            # Kebutuhan produk dan batasan Out of Scope (Frozen)
    ├── DESIGN-SYSTEM.md                  # Token Vengeance UI, warna hex, tipografi, dan komponen
    ├── ARCHITECTURE.md                   # Topologi sistem, diagram data flow, dan API contract
    ├── CODE-STYLE.md                     # Pedoman penulisan kode, penamaan, dan zero emoji
    ├── SECURITY.md                       # Keamanan kredensial, validasi akses, dan sanitasi
    └── TESTING.md                        # Rencana pengujian fungsional dan kriteria penerimaan
```

## 04 API Contracts & Data Payloads

### 4.1 Endpoint: GET Data Pohon WO Aktif & Master Dropdown (`doGet`)
- **Metode**: `GET`
- **Parameter Kueri**: `?key=<APP_ACCESS_KEY>&_t=<timestamp>`
- **Struktur Respon JSON**:
```json
{
  "sukses": true,
  "timestamp": "2026-11-09T08:00:00Z",
  "totalAktif": 0,
  "cabangList": [],
  "pohonData": {},
  "detailPelanggan": [],
  "dropdownOptions": {
    "cabang": ["Malang", "Batu", "..."],
    "urutanVisit": ["Visit 1 (Kunjungan Pertama)", "Visit 2 (Kunjungan Ulang / Follow-up)", "Re-visit (Janji Bayar Ulang)"],
    "topik1": ["..."],
    "topik2": ["..."],
    "topik3": ["..."],
    "topik4": ["..."],
    "topik5": ["..."],
    "topik6": ["..."],
    "topik7": ["..."],
    "kategoriUpaya": [
      { "label": "Akan lanjut, bayar lunas", "targetStatus": "CLOSED (Terselamatkan)" }
    ],
    "painPoint": ["Financial", "Waktu", "..."],
    "detailKendalaMap": {
      "Financial": ["Belum gajian / tanggal gajian mundur", "..."]
    }
  }
}
```

### 4.2 Endpoint: POST Laporan Hasil Visit (`doPost`)
- **Metode**: `POST`
- **Content-Type**: `text/plain;charset=utf-8` (JSON stringified, anti CORS preflight)
- **Payload Request JSON**: Menyertakan `accessKey`, identifikasi pelanggan (`cabang`, `namaAE`, `pppoe`, `namaPelanggan`), jawaban 7 topik (`topik1`..`topik7`), `painPoint`, `detailKendala`, `kategoriUpaya`, `tglBayar`, `catatan`, `gps`, dan `fotoBase64`.
- **Pemetaan 20 Kolom `RESPON_FORM_VISIT` (`A-T`)**:
  `A`: Timestamp, `B`: Cabang, `C`: Nama AE, `D`: PPPoE, `E`: Nama Pelanggan, `F`: Urutan Visit, `G`: URL Foto Drive, `H`: Validasi GPS, `I..O`: Topik 1..7, `P`: Catatan AE, `Q`: Kategori Pain Point, `R`: Kelompok Detail Kendala, `S`: Kategori Upaya, `T`: Rencana Tgl Bayar.
