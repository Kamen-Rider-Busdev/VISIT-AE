# SECURITY AND COMPLIANCE SPECIFICATION

Dokumen Penanggung Jawab: PENGUJI (Direktorat III: Mutu & Keamanan)
Target Pembaca AI: Claude Code, Cursor, Codex, dan seluruh instans agen koding MUALNURDARZA.
Status Spesifikasi: Draf Terkunci (Zero Credential Leakage & Safe Transmission)

---

## 01 Ancaman Keamanan & Batas Kendali
Aplikasi `VISIT-AE` di-host pada repositori publik GitHub Pages dan terhubung ke Google Workspace internal GriyaNet. Seluruh komponen mematuhi prinsip zero-secret in source code dan fail-closed access control:

1. **Zero Secret in Source Code (Repositori Publik)**:
   - `index.html` dan `backend/API-VISIT-ISOLIR.gs` dilarang keras memuat URL deployment `/exec`, Folder ID Google Drive, Spreadsheet ID, OAuth secret, atau token akses apa pun.
   - Rahasia backend (`VISIT_AE_DRIVE_FOLDER_ID`, `VISIT_AE_APP_ACCESS_KEY`, `VISIT_AE_SPREADSHEET_ID`) disimpan terisolasi di Google Apps Script `PropertiesService.getScriptProperties()` melalui menu `VISIT-AE Admin > 1. Setup Kredensial & Folder Aman`.
2. **Otorisasi Fail-Closed pada Backend**:
   - Baik `doGet(e)` (`?key=...`) maupun `doPost(e)` (`payload.accessKey`) wajib memverifikasi kecocokan kunci akses menggunakan perbandingan waktu konstan terhadap `VISIT_AE_APP_ACCESS_KEY`.
   - Jika `VISIT_AE_APP_ACCESS_KEY` belum dipasang di `PropertiesService`, endpoint otomatis menolak seluruh permintaan (kode `503`).
3. **Onboarding Klien Tanpa Jejak Server (`#cfg=` + `localStorage`)**:
   - Tautan onboarding memakai URL hash fragment (`#cfg=...`) karena browser tidak pernah mengirimkan fragment `#` dalam permintaan HTTP ke server GitHub Pages.
   - Begitu fragment dibaca oleh `index.html`, URL divalidasi harus berdomain `https://script.google.com`, konfigurasi disimpan di `localStorage` perangkat AE, lalu fragment segera dihapus dari address bar melalui `history.replaceState`.
4. **Perlindungan Privasi Foto Bukti Drive**:
   - Foto yang diunggah lewat `simpanFotoKeDrive()` mengikuti perizinan folder Drive tujuan dan dilarang mengaktifkan `DriveApp.Access.ANYONE_WITH_LINK` secara sepihak.
5. **Sanitasi Formula Injection & Concurrency Lock**:
   - Input teks bebas (Catatan AE, Detail Kendala) disanitasi lewat `sanitasiSel()` dengan memberi prefiks apostrof `'` pada teks berawalan `=`, `+`, `@`, atau ekspresi minus formula agar spreadsheet aman dari CSV/Sheet Formula Injection.
   - `doPost(e)` memakai `LockService.getScriptLock()` agar pengiriman bersamaan dari beberapa AE di lapangan tidak menimbulkan kondisi balap (*race condition*).
6. **CORS & Pencegahan Quota Exhaustion**:
   - Permintaan `POST` memakai header `Content-Type: text/plain;charset=utf-8` untuk menghindari prefight CORS `OPTIONS` yang tidak didukung Google Apps Script.
   - Foto dikompresi di sisi peramban (`MAX_IMAGE_WIDTH = 800`, `JPEG_QUALITY = 0.7`, target `< 200 KB`) guna menjaga durasi eksekusi di bawah batas timeout Apps Script.
