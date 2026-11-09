# TESTING AND QUALITY ASSURANCE SPECIFICATION

Dokumen Penanggung Jawab: PENGUJI & AUDITOR (Direktorat III: Mutu & Keamanan)
Target Pembaca AI: Claude Code, Cursor, Codex, dan seluruh instans agen koding MUALNURDARZA.
Status Spesifikasi: Draf Terkunci (Manual & Automated Field Scenarios)

---

## 01 Matriks Skenario Pengujian Fungsional

| ID Uji | Fitur / Alur | Kondisi Masukan | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| **TC-01** | Tampilan Awal AE Bebas Input Teknis | Buka web app pertama kali tanpa `#cfg=`, `?admin=1`, atau `localStorage` | Panel pengaturan tersembunyi, form kerja disembunyikan, kartu `#activationNotice` tampil ramah bagi AE, badge header `"Belum Aktif"`, dan tidak ada data dummy dimuat. | Wajib Lulus |
| **TC-01B** | Akses Mode Admin Tersembunyi | Buka web app dengan `?admin=1` atau `#admin` | Panel `Pengaturan Koneksi Spreadsheet (Mode Admin)` terbuka untuk input URL `/exec` dan Kode Akses secara manual. | Wajib Lulus |
| **TC-02** | Onboarding Link Otomatis (`#cfg=`) | Buka URL dengan hash `#cfg=<base64>` valid | Kredensial disimpan ke `localStorage`, hash `#cfg=` langsung terhapus dari URL bar, `#activationNotice` menutup, formulir langsung siap dipakai. | Wajib Lulus |
| **TC-03** | Penolakan Akses Ilegal | Kirim request `doGet` atau `doPost` tanpa kunci atau kunci salah | Backend membalas kode `401`; di peramban AE, `#setupPanel` tetap tidak dimunculkan. | Wajib Lulus |
| **TC-04** | Sinkronisasi Sheet Kosong (0 WO) | Hubungkan web app ke `TEMPLATE-SPREADSHEET-VISIT-AE.xlsx` baru | Badge menampilkan `0 WO Aktif`, sementara seluruh dropdown (Urutan Visit, Topik 1-7, Pain Point, Upaya) terisi penuh dari `MASTER_DROPDOWN`. | Wajib Lulus |
| **TC-05** | Sinkronisasi Otomatis Tanpa Tombol Refresh | Tambah/ubah baris di `MASTER_DROPDOWN` atau `MONITORING_CABANG`, lalu tunggu interval sinkronisasi / picu `visibilitychange` atau `online` | Data baru terperbarui otomatis di UI dan `syncStatusBadge` menunjukkan jam sinkron terbaru tanpa tombol `Refresh Data` dan tanpa menghapus isian form yang sedang aktif. | Wajib Lulus |
| **TC-06** | Dependent Detail Kendala | Pilih Pain Point lalu pilih Detail Kendala (atau "Lainnya") | Daftar sub-detail terfilter sesuai Pain Point; memilih "Lainnya" membuka input teks manual. | Wajib Lulus |
| **TC-07** | Filter Bertingkat Cabang -> AE -> WO | Isi >= 1 WO di `MONITORING_CABANG`, pilih Cabang -> AE -> WO | Filter berjenjang bekerja presisi dan memunculkan Kartu Konteks Pelanggan + tombol WhatsApp. | Wajib Lulus |
| **TC-08** | Penguncian Koordinat GPS | Klik tombol "Kunci Lokasi" | Koordinat `lat, lng` terisi otomatis; saat disimpan ke sheet tertulis `"Valid (lat, lng)"`. | Wajib Lulus |
| **TC-09** | Kompresi Foto & Upload Drive | Pilih foto kamera > 2 MB dan kirim laporan | Foto dikompresi `< 200 KB`, tersimpan di folder Drive dari `ScriptProperties` tanpa `ANYONE_WITH_LINK`. | Wajib Lulus |
| **TC-10** | Penyelarasan Kolom & XLOOKUP | Kirim 1 laporan visit lewat formulir | Baris tercatat tepat di kolom `A-T` `RESPON_FORM_VISIT`, kolom `L-T` & `W` di `MONITORING_CABANG` terisi/terbarui otomatis. | Wajib Lulus |

## 02 Kriteria Gerbang Mutu (Quality Gate Acceptance)
Aplikasi hanya boleh dinyatakan siap rilis ke GitHub Pages apabila:
1. Nol rahasia (`Drive Folder ID`, `Spreadsheet ID`, `Access Key`, `/exec` URL) dan nol `MOCK_DATA` dalam berkas repositori publik.
2. Template Excel terbukti kosong (`0` baris data WO, `0` baris respon visit, `0` nama AE dummy).
3. Bebas 100% dari karakter emoji dan emoticon.
4. Seluruh token warna heksadesimal patuh pada `docs/DESIGN-SYSTEM.md`.
