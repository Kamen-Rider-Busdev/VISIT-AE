# DESIGN SYSTEM SPECIFICATION

Dokumen Penanggung Jawab: PERANCANG (Direktorat II: Teknologi & Rekayasa)
Target Pembaca AI: Claude Code, Cursor, Codex, dan seluruh instans agen koding MUALNURDARZA.
Status Spesifikasi: Draf Terkunci (Vengeance UI Light Theme)

---

## 01 Brand Identity
Karakter visual VISIT-AE dirancang mengadopsi standar **Vengeance UI** dengan varian **Tema Terang (Light Mode)**:
- **Karakter**: Tajam, teknikal, presisi, bersih, dan berorientasi pada kemudahan keterbacaan di luar ruangan (*outdoor readability*).
- **Filosofi Interaksi**: Mikro-animasi yang bermakna (*motion with purpose*), umpan balik taktil saat ditekan (*subtle tactile button press*), dan kartu informasi berlapis (*clean layered cards*).
- **Larangan Mutlak Emoji**: Dilarang keras menyematkan karakter emoji pada seluruh komponen visual, tombol, status, maupun ikon.

## 02 Colour Palette (Vengeance UI Light Tokens)
Dilarang menggunakan nilai warna arbitrer di luar tabel heksadesimal resmi berikut:

| Token Desain               | Variabel CSS                  | Nilai Hex | Peruntukan Elemen Antarmuka |
|---|---|---|---|
| **Primary**                | `--vng-primary`               | `#2563EB` | Tombol aksi utama (CTA), header aktif, tab aktif |
| **Primary Hover**          | `--vng-primary-hover`         | `#1D4ED8` | Status hover dan fokus tombol utama |
| **Primary Foreground**     | `--vng-primary-foreground`    | `#FFFFFF` | Teks di atas warna primary |
| **Accent / Focus Ring**    | `--vng-accent`                | `#3B82F6` | Ring fokus input, sorotan garis aktif, toggle |
| **Background Canvas**      | `--vng-background`            | `#F8FAFC` | Latar belakang seluruh halaman kanvas mobile |
| **Surface Card**           | `--vng-surface`               | `#FFFFFF` | Latar belakang kartu kontainer, modul, dan dialog |
| **Border Normal**          | `--vng-border`                | `#E2E8F0` | Garis pembatas kartu, pemisah seksi, border input |
| **Border Focus**           | `--vng-border-focus`          | `#93C5FD` | Garis tepi saat elemen input dalam keadaan aktif |
| **Text Primary (Headings)**| `--vng-text-primary`          | `#0F172A` | Judul seksi, nama pelanggan, teks label utama |
| **Text Body**              | `--vng-text-body`             | `#334155` | Paragraf penjelasan, nilai isian, teks opsi |
| **Text Muted (Secondary)** | `--vng-text-muted`            | `#64748B` | Label pembantu, placeholder, teks metadata |
| **Success / Verified**     | `--vng-success`               | `#10B981` | Tombol WhatsApp, indikator GPS terkunci, status terselamatkan |
| **Warning / Pending**      | `--vng-warning`               | `#F59E0B` | Status janji bayar, indikator WO pending |
| **Error / Destructive**    | `--vng-error`                 | `#EF4444` | Validasi gagal, status gagal bayar, tombol reset |

## 03 Typography
- **Font Utama**: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Font Monospace**: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace (khusus PPPoE ID, koordinat GPS, dan token teknis).
- **Page Title**: 20px, Font-weight: 700 (Bold), Line-height: 1.25.
- **Section Heading**: 15px, Font-weight: 600 (Semibold), Line-height: 1.3, Text-transform: uppercase, Letter-spacing: 0.05em.
- **Card Title / Customer Name**: 16px, Font-weight: 700 (Bold), Line-height: 1.3.
- **Body Text**: 14px, Font-weight: 400 (Regular), Line-height: 1.45.
- **Input & Select Text**: 14px, Font-weight: 500 (Medium), Line-height: 1.4.
- **Caption / Meta**: 12px, Font-weight: 500 (Medium), Line-height: 1.35.
- **Badge / Micro Tag**: 11px, Font-weight: 600 (Semibold), Letter-spacing: 0.025em.

## 04 Spacing & Geometry
Mengikuti kelipatan skala 4px dan 8px:
- `gap-1` / `p-1`: 4px (Jarak mikro badge dan tombol kecil).
- `gap-2` / `p-2`: 8px (Jarak antar elemen kontrol sebaris).
- `gap-3` / `p-3`: 12px (Padding internal tombol dan field input).
- `gap-4` / `p-4`: 16px (Padding kartu dan margin antar seksi formulir).
- `gap-6` / `p-6`: 24px (Pemisah modul besar formulir).

## 05 Border Radius
Mengikuti token radius Vengeance UI:
- **Small (Badge, Tag, Checkbox)**: 6px (`rounded-md`).
- **Input Fields & Dropdown Select**: 10px (`--vng-radius-md: 10px`).
- **Buttons (Action CTA)**: 10px (`--vng-radius-md: 10px`).
- **Cards & Dialog Containers**: 14px (`rounded-xl`).

## 06 Component Patterns (Vengeance UI Motion & States)
1. **Pilihan Dropdown Bertingkat (Tiered Selects)**:
   - Kontainer `<select>` bergaya Vengeance UI dengan border `#E2E8F0`, padding `10px 14px`, dan transisi halus 200ms.
   - Status nonaktif (*disabled*): Latar `#F1F5F9`, border `#E2E8F0`, teks `#94A3B8`, kursor `not-allowed`.
   - Status aktif (*focus*): Border `#3B82F6`, bayangan cincin halus `box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15)`.
2. **Kartu Konteks Pelanggan (Intelligence Card)**:
   - Latar belakang `#FFFFFF` dengan garis tepi halus `border: 1px solid #E2E8F0`, bayangan `box-shadow: 0 1px 3px rgba(0,0,0,0.05)`.
   - Menampilkan badge status kohort (P1, P2, P3, P4) dengan warna latar `#DBEAFE` dan teks `#1E40AF`.
3. **Tombol Aksi Utama (Vengeance Tactile Button)**:
   - Latar belakang `#2563EB`, teks `#FFFFFF`, font-weight 600.
   - Transisi: `transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1)`.
   - Status tekan (*active*): `transform: scale(0.98); background-color: #1D4ED8`.
4. **Tombol WhatsApp Konsultatif**:
   - Latar belakang `#10B981`, teks `#FFFFFF`, hover `#059669`.
5. **Indikator Koordinat GPS**:
   - Kotak koordinat dengan latar `#F1F5F9`, font monospace, dan tombol "Kunci Lokasi Sekarang" beranimasi putar (*loading spinner*) saat mencari satelit.
6. **Kotak Unggah & Pratinjau Foto**:
   - Area seret/pilih foto dengan border putus-putus (`border-dashed`), menampilkan ukuran berkas asli vs ukuran terkompresi sebelum dikirim.
