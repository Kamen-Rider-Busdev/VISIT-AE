# AGENT OPERATIONAL RULES AND CONTEXT LOADER

Dokumen Penanggung Jawab: ORKESTRATOR (Chief of Staff MUALNURDARZA)
Lokasi Berkas: Root Repositori Proyek (`AGENTS.md`)
Target Pembaca AI: Seluruh instans agen koding (Claude Code, Cursor, Codex, Windsurf).

---

## 01 Purpose
Berkas ini memuat instruksi operasional, batas kendali teknis, dan protokol wajib bagi seluruh agen kecerdasan buatan yang beroperasi di repositori `VISIT-AE`. Setiap sesi koding wajib mematuhi panduan ini secara disiplin.

## 02 Before You Start (Pre-Flight Checklist)
Sebelum menulis atau memodifikasi satu baris kode pun, agen AI wajib menjalankan pemeriksaan awal:
1. **Pahami Batasan Produk**: Baca `docs/PRD.md` untuk memahami visi produk, fitur inti, dan batasan `Out of Scope`. Jangan membangun fitur yang tidak diminta.
2. **Kunci Aturan Visual**: Baca `docs/DESIGN-SYSTEM.md` sebelum menyentuh antarmuka UI. Jangan gunakan warna, font, atau skala jarak arbitrer. Terapkan token Vengeance UI tema terang.
3. **Patuhi Denah Arsitektur**: Baca `docs/ARCHITECTURE.md` sebelum membuat berkas baru atau memasang pustaka luar. Arsitektur adalah Single-File PWA mandiri (`index.html`) yang didukung Google Apps Script Web App API (`doGet` / `doPost`).
4. **Verifikasi Standar Kode & Mutu**: Baca `docs/CODE-STYLE.md`, `docs/SECURITY.md`, dan `docs/TESTING.md`.
5. **Zero Emoji Policy**: Dilarang keras menyematkan karakter emoji atau emoticon apa pun dalam kode sumber, antarmuka, berkas dokumentasi, maupun pesan commit Git.

## 03 Multi-Agent Role Delegation (MUALNURDARZA Standard)
- **ANALIS (Direktorat I)**: Pengelola dokumen `docs/PRD.md`, perumusan taksonomi 10 pain point, dan kriteria penerimaan pengguna.
- **KURATOR (Direktorat I)**: Pengelola dokumen `README.md`, orientasi pengembang, dan panduan deployment GitHub Pages.
- **PERANCANG (Direktorat II)**: Pengelola `docs/DESIGN-SYSTEM.md`, kepatuhan token Vengeance UI tema terang, layout mobile-first, dan interaksi micro-animation.
- **PEREKAYASA (Direktorat II)**: Pengelola `docs/ARCHITECTURE.md` dan `docs/CODE-STYLE.md`, perakitan `index.html`, PWA service worker, kompresi foto klien, Geolocation API, dan backend Apps Script API.
- **PENGUJI (Direktorat III)**: Pengelola `docs/SECURITY.md` dan `docs/TESTING.md`, verifikasi sanitasi payload, penanganan kuota, dan validasi offline cache.
- **AUDITOR (Direktorat III)**: Verifikator kepatuhan gerbang mutu (quality gate) sebelum rilis resmi ke GitHub Pages.
- **ORKESTRATOR**: Koordinasi lintas agen, pembekuan spesifikasi, dan pelaporan status akhir ke pengguna.

## 04 General Engineering Rules
- **Bahasa & Struktur Utama**: Single-file PWA mandiri (`index.html`) dengan Tailwind CSS (CDN / Play) dan Vengeance UI token styling murni, didukung `manifest.json` dan `sw.js`.
- **Zero Build-Step**: Berkas dapat langsung disajikan oleh GitHub Pages tanpa kompilasi Node.js, Webpack, atau Vite yang rumit.
- **Mobile-First**: Seluruh tata letak diutamakan untuk layar peramban ponsel pintar (viewport 360px - 430px) milik Account Executive di lapangan.
- **Tanpa Emoji**: Dilarang keras menggunakan emoji di seluruh elemen web, tombol, label, pesan error, maupun alert konfirmasi.
- **Kepatuhan Desain Mutlak**: Hanya gunakan palet warna heksadesimal Vengeance UI terang yang tercantum dalam `docs/DESIGN-SYSTEM.md`.

## 05 Security Directives
- Dilarang keras menuliskan token akses pribadi atau kredensial rahasia di dalam kode klien `index.html`.
- Komunikasi dengan Google Sheets dilakukan melalui URL Google Apps Script Web App terenkripsi HTTPS (`doGet` dan `doPost`).
- Validasi data input form dilakukan secara ganda: di sisi peramban klien sebelum kirim dan di sisi Google Apps Script sebelum ditulis ke sel sheet.
- Payload gambar dikompresi di sisi klien menjadi WebP / JPEG teroptimasi (maksimal 800px lebar, kualitas 0.7) sebelum diunggah ke Google Drive.
