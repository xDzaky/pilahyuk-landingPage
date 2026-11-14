# PilahYuk — Landing Page Prompt Pack

**Versi 1.0 · 14 November 2026**
**Tujuan halaman:** mempromosikan aplikasi mobile PilahYuk dan menjelaskan aplikasi ini tentang apa, untuk siapa, dan cara kerjanya, sampai pengunjung menekan **Unduh**.
**Isi file ini:** analisis referensi → strategi halaman → design system → master prompt agen → spesifikasi detail tiap section → prompt per fase → **prompt gambar terpisah untuk Google Flow / Gemini** → checklist.

Tag sumber: `[REF]` dari 3 gambar referensimu · `[RISET]` dari riset web · `[PRD]` dari PRD PilahYuk 2.0 · `[DESIGN]` dari `DESIGN.md` · `[USULAN]` keputusan saya yang bisa kamu ubah (dikumpulkan di §9).

---

## 0. Cara pakai

1. Simpan file ini sebagai `docs/LANDING_BRIEF.md` di repo landing.
2. Tempel **§4 Master Prompt** ke instruksi permanen agen (`CLAUDE.md` / `AGENTS.md`).
3. Jalankan **§6 Prompt per fase (L1–L6)** berurutan, satu fase = satu sesi = satu PR.
4. Generate semua gambar dari **§7** di Google Flow / Gemini lebih dulu atau paralel. Taruh hasilnya di `public/img/` memakai nama file dari tabel §7.2. Selama gambar belum ada, agen memakai placeholder bergradien hijau dengan nama slot.
5. **Screenshot aplikasi jangan digenerate AI.** Ambil dari aplikasi Flutter yang sudah dibuat tim (§8). Teks di gambar buatan AI hampir selalu rusak, dan pengunjung akan menilai aplikasimu dari layar yang mereka lihat di sini.
6. Jawab keputusan terbuka di §9, atau biarkan agen memakai default dan mencatatnya di `docs/DECISIONS.md`.

---

## 1. Analisis referensi

### 1.1 Tiga gambar yang kamu kirim `[REF]`

| Referensi | Yang kuat | Dipakai di PilahYuk | Tidak dipakai |
|---|---|---|---|
| **Doc Mo Farm** (hijau tua + kertas) | Latar putih-gading bertekstur kertas; foto dipotong bentuk poligon/organik; label kecil ("Who we are") di atas judul; kartu nilai berwarna bergantian (hijau tua / hijau muda / putih); cap bulat seperti stempel; kartu kegiatan foto-atas yang digeser horizontal; footer hijau lengkap | Tekstur kertas halus, label kecil di atas judul, bingkai foto bentuk dipotong **satu kali** (S10), stempel bulat untuk lencana "Terverifikasi ✓" | Banyak potongan poligon berserakan (ramai, sulit dibaca); font serif |
| **NavikX** (agritech) | Hero foto penuh dengan kartu pencarian yang menumpuk di tepi bawah hero; kartu foto-atas dengan ikon + tautan "Learn More"; blok "Why choose" dengan **kumpulan foto bulat** (1 besar + 2 kecil); pita statistik hijau tua dengan ikon garis; baris layanan 4 ikon dipisah garis tipis; banner CTA bergambar; footer 4 kolom | Pola **kartu yang menumpuk di tepi hero** (kartu "unduh"), kumpulan foto bulat di bagian Tentang, pita 4 butir dengan pemisah garis tipis, banner CTA bergambar | Angka statistik besar (10K+, 98%): kita belum punya data nyata, jadi **dilarang**; bintang ulasan dan testimoni palsu |
| **LawnBuster** (jasa kebun) | Navbar **pil melayang** di atas foto hero berbingkai membulat; chip rating dan baris kepercayaan; paragraf "tentang" berukuran besar; **kartu foto tinggi yang digeser** dengan teks di atas foto + ikon di lingkaran; langkah "How we work" dalam **bento** (kartu dengan ukuran berbeda, media campuran); tombol pil berpanah di lingkaran; latar halaman bergradien lembut | Navbar pil melayang, hero berbingkai membulat besar, paragraf Tentang besar, carousel kartu foto tinggi untuk fitur, bento untuk langkah, tombol pil + lingkaran panah | Chip rating Google/Facebook, logo klien, kata aksen miring serif |

### 1.2 Riset tambahan `[RISET]`

- Urutan section yang disarankan untuk app: **relevansi (untuk siapa) → mekanisme (cara kerja) → bukti → kejelasan onboarding → aksi utama**. Judul hero memuat satu hasil dan satu audiens, bukan klaim umum yang bisa dipakai app apa saja. Subjudul: masalah → manfaat alur → waktu menuju nilai. (unicornplatform.com)
- Satu aksi utama per tampilan halaman. Bukti ditaruh **dekat klaim yang didukungnya**, bukan satu blok di bawah. Angka unduhan tanpa konteks bisa berbalik merugikan. Janji di halaman harus cocok dengan pengalaman onboarding aplikasi, karena ketidakcocokan adalah penyebab terbesar orang batal memasang. (unicornplatform.com)
- Uji di perangkat Android nyata: ukuran target ketuk, keterbacaan tanpa zoom, waktu muat media di jaringan lambat. (unicornplatform.com)
- Hijau: pakai sebagai aksen/latar/sorotan sesuai intensitas, kontras minimal 4,5:1, tombol CTA harus kontras terhadap hijau, hindari hijau tren yang cepat usang. (lapa.ninja, kategori warna hijau)
- Galeri referensi app lingkungan (Dribbble/Contra: Eco Recycling App, Zero Waste App, Waste Recycling Platform) umumnya memakai hijau + putih, ilustrasi datar, dan mockup ponsel miring; kekurangannya generik. PilahYuk dibedakan oleh **foto dokumenter lingkungan RT/RW Indonesia** dan **layar aplikasi asli**.

### 1.3 Kesimpulan arah

Gabungan tiga referensimu: **foto dokumenter hangat** (bukan ilustrasi stok), **hijau tua + kanvas gading bertekstur**, bentuk membulat besar, satu aksen amber untuk CTA, mockup ponsel berisi **layar asli** aplikasi. Hindari "template AI": empat kartu fitur identik, ikon dekoratif di mana-mana, angka palsu, testimoni palsu, gradien neon.

---

## 2. Strategi halaman

**Pesan inti (satu kalimat):** PilahYuk adalah aplikasi untuk warga, pengurus RT/RW, bank sampah, dan pengumpul agar memilah, menyetor, dan mencatat sampah secara jujur dan terlacak, juga saat sinyal putus.

| Aspek | Keputusan |
|---|---|
| Audiens utama | Warga dan pengurus RT/RW yang ingin mulai memilah; operator bank sampah dan pengumpul yang butuh pencatatan rapi |
| Audiens kedua | Mitra pengolah, pengurus komunitas budaya, calon mitra/pendukung |
| Bahasa | Bahasa Indonesia sederhana, hangat, spesifik. Tanpa jargon "ekosistem sirkular" di hero |
| Aksi utama | **Unduh aplikasi** (Android APK dulu). Aksi sekunder: **Lihat cara kerja** (anchor ke S5). Hanya satu tombol primer per layar |
| Aksi di desktop | Kartu unduh dengan **QR code** ke halaman unduh, karena pemasangan terjadi di ponsel `[RISET]` |
| Bukti | Layar aplikasi asli, label kepercayaan data, kebijakan privasi, penjelasan perilaku offline. **Tidak ada** angka pengguna, rating, atau testimoni sebelum ada yang nyata |
| Klaim terlarang `[PRD §24]` | "Terdaur ulang" tanpa bukti penerima/pengolah; angka karbon/emisi; "sertifikat daur ulang"; janji penghasilan; angka unduhan/pengguna yang belum nyata |

### 2.1 Urutan section

| ID | Section | Pertanyaan pengunjung yang dijawab | Jenis visual |
|---|---|---|---|
| S1 | Navbar pil | Ini apa dan ke mana saya bisa pergi? | UI |
| S2 | Hero | Ini aplikasi apa, untuk siapa? | Foto penuh + ponsel + kartu unduh menumpuk |
| S3 | Untuk siapa | Apakah ini untuk saya? | Baris 5 peran, ikon garis |
| S4 | Tentang | Masalah apa yang diselesaikan? | Paragraf besar + kumpulan foto bulat |
| S5 | Cara kerja | Bagaimana mulai? | Bento 3 langkah + layar asli |
| S6 | Fitur | Apa saja yang bisa dilakukan? | Carousel kartu foto tinggi (7) |
| S7 | Layar aplikasi | Seperti apa tampilannya untuk peran saya? | Tab peran + mockup ponsel |
| S8 | Offline | Bagaimana kalau tidak ada sinyal? | Pita gelap + diagram status |
| S9 | Data jujur | Bisa dipercaya? | 4 label kepercayaan + stempel |
| S10 | Komunitas & budaya | Bukan cuma sampah? | Foto berbingkai dipotong |
| S11 | Janji data | Apakah data dan alamat saya aman? | Pita 4 butir bergaris tipis |
| S12 | Cerita komunitas | Siapa yang sudah pakai? | **Nonaktif sampai ada kutipan nyata** |
| S13 | FAQ | Keberatan terakhir | Akordeon |
| S14 | CTA unduh | Ayo pasang | Banner foto + QR + tombol |
| S15 | Footer | Kontak, kebijakan | 4 kolom |

---

## 3. Design system landing

Basis: `DESIGN.md` `[DESIGN]`. Landing boleh lebih ekspresif dari dashboard, tetapi tetap **satu keluarga**. Penyimpangan dari dashboard ditandai `[LANDING]`.

### 3.1 Warna

```css
:root {
  --brand-900:#173F35; --brand-700:#246B56; --brand-500:#3D9274;
  --teal-100:#DDF3EC;  --teal-200:#CBECE2;
  --canvas:#F6F8F5;    --paper:#F3F4EE;   /* [LANDING] kanvas bertekstur */
  --surface:#FFFFFF;   --ink:#1E2925;     --muted:#66736D; --border:#E1E8E3;
  --amber:#E7A34B;     --amber-hover:#D89339;  /* satu-satunya warna CTA */
  --warning:#A86712; --warning-bg:#FBF1DF;
}
```

| Pemakaian | Aturan |
|---|---|
| Hero, S8, S14, footer | `--brand-900` dengan foto di bawah overlay hijau; teks putih; kontras ≥ 4,5:1 |
| Latar halaman | `--paper` dengan tekstur kertas SVG noise opasitas 3–4% `[REF Doc Mo]`. Selang-seling dengan `--surface` putih untuk memberi ritme |
| Tombol primer | `--amber` latar, `--ink` teks, hover `--amber-hover`. Pada latar terang pakai `--brand-900` latar + teks putih. Maksimal satu tombol amber per layar |
| Aksen kecil (label atas judul) | `--brand-500` pada terang, `--teal-100` pada gelap |
| Peringatan | Hanya di FAQ/catatan, `--warning-bg` |
| Gradien | Hanya satu: overlay foto hero/banner dari `rgba(23,63,53,.88)` ke `rgba(23,63,53,.35)`. Tidak ada gradien dekoratif lain |
| Bayangan | **Tidak ada** `[DESIGN]`. Kedalaman dari border 1px dan kontras permukaan |

### 3.2 Tipografi

Hanya **Plus Jakarta Sans** `[DESIGN]` (`next/font/google`, variabel 400–800). `[LANDING]` ukuran lebih besar dari dashboard.

| Token | Desktop | Mobile | Bobot | Dipakai |
|---|---|---|---:|---|
| display | 64/72, ls −0.02em | 40/46 | 800 | Judul hero saja |
| h2 | 44/52, ls −0.015em | 30/38 | 700 | Judul section |
| h3 | 24/32 | 20/28 | 700 | Judul kartu |
| lead | 20/32 | 17/28 | 400 | Subjudul hero dan paragraf Tentang |
| body | 17/28 | 16/26 | 400 | Teks biasa |
| small | 14/22 | 14/22 | 500 | Keterangan |
| eyebrow | 13/18, uppercase, ls 0.08em | sama | 700 | Label kecil di atas judul section `[REF Doc Mo]` |

Satu kata kunci pada judul hero boleh diberi warna `--amber` pada latar gelap (mis. "tetangga"). Tidak ada font miring serif.

### 3.3 Layout

| Elemen | Aturan |
|---|---|
| Container | maks 1200px, padding sisi 24px (mobile 16px), grid 12 kolom, gutter 24px |
| Padding vertikal section | 120px desktop · 88px tablet · 64px mobile. Jarak judul→konten 48px |
| Radius | Bingkai gambar besar 32px `[LANDING]`, kartu 20px, ikon-lingkaran penuh, tombol pil 999px `[LANDING]` |
| Breakpoint | 1280 · 1024 · 768 · 390 (uji di 390 dan 1440) |
| Tinggi hero | 100svh maks 860px, min 640px |

### 3.4 Komponen dasar

| Komponen | Spesifikasi |
|---|---|
| **Tombol pil (CTA)** | Tinggi 56px, padding kiri 28px, kanan 8px; teks 16/600; di kanan **lingkaran 40px** berisi panah `arrow-up-right` Lucide (`--ink` pada amber; amber pada hijau) `[REF LawnBuster]`. Hover: lingkaran memutar 45° 200ms, tanpa bayangan. Fokus: outline 2px `--teal-100` + offset 2px |
| **Tombol sekunder** | Teks + garis bawah 1px, ikon panah kecil. Pada gelap: putih |
| **Label atas judul** | eyebrow + titik 8px `--brand-500` di kiri |
| **Kartu foto tinggi** | 296×440px, radius 20, foto penuh, overlay gradien bawah, ikon di lingkaran putih 40px kanan atas, judul 22/28 putih, 2 baris deskripsi 15/22 putih 85%, tautan "Pelajari" di bawah |
| **Kartu putih** | `--surface`, border 1px `--border`, radius 20, padding 28 |
| **Lencana stempel** | SVG bulat 96px bertulis melingkar "CATATAN TERVERIFIKASI ✓ · PILAHYUK ·", `--brand-700`, diputar −8° `[REF Doc Mo]`. Dipakai maksimal 2 kali |
| **Ponsel (mockup)** | Komponen `<PhoneFrame>`; bingkai 10px `#101614`, radius 44, rasio 390:844, layar berisi screenshot asli, tanpa logo merek ponsel, tanpa bayangan; boleh miring 6° di hero |
| **Kumpulan foto bulat** | 1 foto 420px + 2 foto 150px dan 120px yang menimpa tepi, border 6px `--paper` `[REF NavikX]` |
| **Pita butir** | Kartu `--brand-900` radius 28, 4 butir dipisah garis 1px putih 15%, ikon Lucide 28px `--teal-100` + judul + 1 baris `[REF NavikX]` |
| **Akordeon FAQ** | Pemisah hairline, judul 18/26 600, ikon `plus`/`minus`, buka 200ms, satu terbuka sekali |

### 3.5 Aturan gambar (image-driven)

1. Foto **dokumenter hangat**, cahaya alami, lingkungan RT/RW Indonesia nyata (gang, halaman rumah, balai warga, bank sampah). Bukan stok kantor, bukan ilustrasi 3D.
2. Penyuntingan warna seragam: bayangan hijau tua, tengah teal, sorotan hangat amber agar cocok dengan palet.
3. Wajah boleh ada tetapi **bukan tokoh nyata**; dibuat AI, jadi **jangan** diberi nama atau kutipan seolah orang sungguhan.
4. Tidak ada teks, logo, atau papan bertulisan terbaca di dalam foto.
5. Tiap foto: `alt` deskriptif Indonesia, rasio tetap, `next/image` dengan `sizes`, format AVIF/WebP, hero `priority`.
6. Maksimal **satu** bingkai dipotong poligon, yaitu foto `C1` di S10. Semua bingkai lain bulat atau persegi membulat.
7. Layar aplikasi selalu dari screenshot asli, bukan hasil generate.

### 3.6 Gerak

- Muncul saat scroll: naik 16px + fade, 400ms, `ease-out`, jeda antar-elemen 60ms, **sekali**.
- Hero: ponsel muncul dari bawah 600ms; foto latar zoom lambat 1.00→1.04 selama 20 detik (hanya bila `prefers-reduced-motion: no-preference`).
- Carousel: geser dengan *scroll-snap*, panah kiri/kanan, seret di desktop. Tanpa autoplay.
- Semua gerak dimatikan bila `prefers-reduced-motion: reduce`.

---

# 4. BAGIAN A — MASTER PROMPT (untuk agen)

Tempel blok ini ke instruksi permanen agen.

````markdown
# ROLE
You are a senior front-end engineer and designer building the marketing landing page for PilahYuk, an Indonesian community mobile app for waste sorting, pickup requests, waste-bank records, community activities, batch traceability and cultural knowledge. The page promotes the app and explains what it is. All visible copy is Bahasa Indonesia. Code, comments and commit messages are English.

# SOURCES OF TRUTH (priority order)
1. docs/LANDING_BRIEF.md (this brief) — design tokens §3, section specs §5, copy exactly as written.
2. docs/PRD.md and docs/DESIGN.md for product facts and brand tokens.
3. Real app screenshots in public/screens/ (never generated, never invented).
If you need a fact not in these files, do NOT invent it: use a visible placeholder `[ISI: ...]` in dev and list it in docs/DECISIONS.md.

# STACK
Next.js 16 (App Router, React 19, TypeScript strict, static export or ISR), Tailwind CSS v4, `motion` for subtle reveal only, lucide-react icons, qrcode.react for the QR, next/font (Plus Jakarta Sans), next/image. No UI kit beyond small hand-built components (Accordion, Carousel, Tabs built on Radix primitives or native elements). No CMS. Copy lives in `src/content/id.ts`. Analytics: privacy-friendly (Plausible or Umami), events listed in §5.16.

# HARD RULES
1. No fabricated numbers: no user counts, download counts, ratings, stars, partner logos, press logos, testimonials, awards. Section S12 (stories) stays disabled until real quotes exist.
2. Never claim material is "terdaur ulang" (recycled) without receiver/processor evidence; never show carbon/emission figures; never call a batch passport a "recycling certificate".
3. Never show real-looking personal data (phone numbers, home addresses). Use obviously generic sample names only where a screenshot requires it.
4. Download buttons: Android APK URL from `NEXT_PUBLIC_APK_URL`. Play Store and App Store badges render disabled with "Segera hadir"/"Belum tersedia" unless their env URL is set. Never link to a store listing that does not exist.
5. Design: follow tokens exactly (brief §3). Zero box-shadows. One amber CTA per viewport. Plus Jakarta Sans only. Lucide icons only, and only where the spec places them.
6. Phone mockups contain real screenshots only. If a screenshot file is missing, render a labelled placeholder (slot name + expected size) instead of drawing fake UI.
7. Every image has Indonesian descriptive alt text from the image table; decorative images use alt="".
8. Accessibility: AA contrast, visible focus, keyboard-operable carousel/tabs/accordion, `prefers-reduced-motion` respected, semantic landmarks, one h1.
9. Performance budget (mobile, 4G throttle): LCP < 2.5 s, CLS < 0.05, total JS < 170 KB gz on first load, hero image < 180 KB AVIF, all below-fold images lazy.
10. SEO: lang="id", unique title/description, canonical, Open Graph + Twitter card, JSON-LD `MobileApplication` WITHOUT aggregateRating, sitemap.xml, robots.txt.

# HOW TO WORK
For each phase: restate the goal, read the referenced brief sections, implement, run `pnpm lint && pnpm typecheck && pnpm build`, run Playwright screenshots at 1440, 1024, 390 px, self-review against brief §10 checklist, then report: what changed, how verified, what is placeholder, open questions. Prefer the simplest solution that matches the spec. Do not add sections, effects or copy that the brief does not contain.
````

---

# 5. BAGIAN B — SPESIFIKASI DETAIL PER SECTION

Format: **Tujuan · Layout · Elemen & ukuran · Copy final · Gambar · Interaksi · Responsif · Catatan.** Slot gambar mengacu ke tabel §7.2. Layar aplikasi mengacu ke §8.

## 5.0 Kerangka global

- `<body>` latar `--paper` + tekstur noise (SVG `feTurbulence` baseFrequency 0.8, opasitas 3.5%, `mix-blend-multiply`).
- Section berselang-seling: paper → putih → paper → gelap. Dua section gelap tidak boleh bersebelahan.
- Anchor: `#tentang`, `#cara-kerja`, `#fitur`, `#layar`, `#offline`, `#data-jujur`, `#faq`, `#unduh`. Scroll mulus dengan `scroll-margin-top: 96px`.
- Tombol "kembali ke atas" tidak diperlukan.

## 5.1 S1 — Navbar pil melayang `[REF LawnBuster]`

| Aspek | Spesifikasi |
|---|---|
| Posisi | `position: fixed`, atas 16px, tengah, lebar `min(1200px, 100% − 32px)`, tinggi 64px |
| Tampilan | Latar `rgba(255,255,255,.94)` + `backdrop-filter: blur(12px)`, border 1px `--border`, radius 999, **tanpa bayangan** |
| Kiri | Logo SVG inline `PilahYuk` (ikon daun/daur di kotak `--brand-900` radius 12, 36px + teks 18/800 `--ink`). Bukan file gambar |
| Tengah (≥1024px) | Tautan: Tentang · Cara Kerja · Fitur · Layar · Tanya Jawab. 15/600, `--ink`; aktif: latar `--teal-100` pil + `--brand-900`. Penyorot mengikuti scroll (IntersectionObserver) |
| Kanan | Tombol pil kecil (tinggi 44px) "Unduh" amber |
| Mobile (<1024) | Logo kiri, tombol "Unduh" 44px, ikon `menu` 44px membuka *sheet* penuh (latar `--brand-900`, tautan 28/700 putih, tombol unduh di bawah, tombol `x`) |
| Perilaku scroll | Setelah scroll 80px: tinggi menjadi 56px dan border menebal ke `--brand-500` 30% (bukan bayangan) |
| Aksesibilitas | `<nav aria-label="Utama">`, skip link "Lewati ke konten" muncul saat fokus |

## 5.2 S2 — Hero

**Tujuan:** dalam 5 detik pengunjung tahu: aplikasi, untuk siapa, apa hasilnya, dan tombol unduh.

**Layout desktop (1440):** bingkai hero di dalam container penuh-lebar dengan margin 16px, tinggi 100svh (maks 860), radius 32, latar foto `H1` + overlay hijau. Konten dalam grid 12 kolom:
- Kolom 1–6 (kiri, rata vertikal tengah): eyebrow, h1, lead, dua tombol, baris kepercayaan.
- Kolom 7–12 (kanan): dua `<PhoneFrame>` bertumpuk: depan 300px lebar (screenshot `beranda`), belakang 260px (screenshot `ajukan`) miring 6° dan bergeser 56px ke kanan-bawah; terpotong rapi oleh tepi bawah bingkai hero. Di belakang ponsel: lingkaran konsentris putih 6% (SVG `CirclesPattern`) `[DESIGN]`.
- **Kartu unduh menumpuk** `[REF NavikX]`: kartu putih radius 24, lebar 880px, tinggi 96px, **menimpa tepi bawah hero** sebesar 48px (separuh di dalam foto, separuh di atas kanvas). Isi: tiga sel dipisah garis tipis → (1) ikon `smartphone` + "Android · APK" + "Versi 2.0" (nomor versi dari env), (2) ikon `wifi-off` + "Tetap jalan tanpa sinyal", (3) tombol pil amber "Unduh Aplikasi". Di mobile kartu ini menjadi satu kolom penuh di bawah ponsel.

**Copy final:**
- Eyebrow: `APLIKASI KOMUNITAS PILAH SAMPAH`
- h1: `Pilah dari rumah, kumpul bersama tetangga.` (kata "tetangga" berwarna amber)
- Lead: `PilahYuk membantu warga memilah sampah, mengajukan penjemputan, dan mencatat setoran ke bank sampah. Pengurus RT/RW pun bisa mengatur kegiatan dalam satu aplikasi, dan tetap jalan walau sinyal putus.`
- Tombol primer: `Unduh Aplikasi` · tombol sekunder: `Lihat cara kerja ↓`
- Baris kepercayaan (3 butir kecil ikon+teks, tanpa angka): `Alamat rumah tidak dibuka ke publik` · `Harga tercatat saat setoran` · `Koreksi tanpa menghapus riwayat`

**Gambar:** `H1` latar (foto gang kampung pagi hari), screenshot `01-beranda`, `03-ajukan`. Opsi: video loop `H1v` (Flow, 6 detik, tanpa suara) menggantikan foto di desktop bila ≤ 1,2 MB; poster = `H1`.

**Interaksi:** ponsel masuk dari bawah 600ms; zoom lambat latar; tombol sekunder menggulir ke `#cara-kerja`.
**Mobile (390):** h1 40/46, bingkai hero tinggi otomatis, ponsel depan saja 240px di bawah teks, kartu unduh satu kolom.
**Catatan:** teks di atas foto harus lulus kontras 4,5:1 pada area paling terang foto; naikkan overlay bila tidak.

## 5.3 S3 — Untuk siapa

**Tujuan:** pengunjung menemukan dirinya. Menggantikan baris "logo klien" yang kita tidak punya.
**Layout:** latar `--paper`, padding 96/0 (lebih tipis dari section biasa). Judul kecil tengah: `Dibuat untuk orang-orang yang menjaga lingkungannya` (h3). Di bawahnya 5 item sejajar (grid 5, pemisah garis tipis vertikal), tiap item: ikon garis Lucide 32px `--brand-700`, nama peran 17/700, 1 baris 14/22 muted.

| Peran | Ikon | Baris |
|---|---|---|
| Warga | `house` | Pilah, ajukan jemput, pantau saldo |
| Pengurus RT/RW | `users` | Atur agenda, tugas, dan anggota |
| Bank sampah | `scale` | Timbang dan catat, juga offline |
| Pengumpul | `truck` | Tugas jemput dan serah terima |
| Mitra pengolah | `recycle` | Terima batch dan unggah bukti hasil |

Hover/fokus: latar `--teal-100` pada item, tanpa bayangan. Mobile: kartu horizontal bisa digeser (scroll-snap), 2,3 item terlihat.

## 5.4 S4 — Tentang PilahYuk (#tentang)

**Tujuan:** menjelaskan aplikasi ini tentang apa, dalam satu paragraf besar dan satu gambar.
**Layout:** latar `--surface` putih. Grid: kiri (kolom 1–5) **kumpulan foto bulat** (`A1` 420px, `A2` 150px, `A3` 120px menimpa tepi, border 6px `--paper`), kanan (kolom 6–12): eyebrow, paragraf besar, tiga butir bergaris, tombol.

**Copy final:**
- Eyebrow: `TENTANG PILAHYUK`
- Paragraf (lead 28/40 desktop, 22/32 mobile, `--ink`; frasa "cara yang jujur" tebal): `Banyak kampung sudah mau memilah, tetapi catatannya tercecer: siapa menyetor apa, berapa timbangannya, ke mana perginya. PilahYuk menyatukan semuanya, dari rumah warga sampai bank sampah dan pengolah, dalam satu aplikasi dengan cara yang jujur: yang diperkirakan ditandai perkiraan, yang ditimbang ditandai hasil timbang.`
- Tiga butir (ikon `check` di lingkaran `--teal-100`): `Mulai dari yang paling sederhana: pilah, lalu ajukan jemput` · `Satu catatan untuk warga, bank sampah, pengumpul, dan pengolah` · `Tumbuh bersama komunitas: agenda, tugas relawan, dan pengetahuan budaya`
- Tombol sekunder: `Lihat cara kerjanya`

**Interaksi:** foto bulat muncul bergantian 80ms. **Responsif:** foto di atas, teks di bawah; foto kecil tetap menimpa tepi.

## 5.5 S5 — Cara kerja (#cara-kerja) `[REF LawnBuster bento]`

**Tujuan:** menunjukkan bahwa mulai itu mudah (3 langkah).
**Layout:** latar `--paper`. Kepala: eyebrow `CARA KERJA`, h2 `Tiga langkah dari rumah sampai tercatat`, di kanan teks kecil muted `Semua langkah bisa dilakukan dari ponsel.` Di bawah: **bento 12 kolom, tinggi baris 320**:
- Kartu 1 (kolom 1–4, tinggi 2 baris): putih, `Langkah 01` · `Pilah sesuai aturan lokal`, deskripsi, lalu `<PhoneFrame>` terpotong di bawah dengan screenshot `02-pilah`.
- Kartu 2 (kolom 5–8, 1 baris): putih, `Langkah 02` · `Ajukan penjemputan`, deskripsi, dan baris status kecil seperti pada aplikasi (chip `Menunggu → Dikonfirmasi → Dalam Perjalanan`, ikon + teks).
- Kartu 3 (kolom 9–12, 1 baris): `Langkah 03` · `Setor dan lihat catatannya`, deskripsi, tampilan potongan screenshot `05-saldo` (hanya baris ringkasan).
- Kartu 4 (kolom 5–12, 1 baris, `--brand-900` + `CirclesPattern`): `Langkah 04 (opsional)` · `Ikut kegiatan komunitas`, deskripsi, foto kecil `F4` di kanan radius 20.

**Copy final deskripsi:** (1) `Cek bahan mana yang diterima bank sampah di sekitarmu dan cara menyiapkannya.` (2) `Pilih bahan, tanggal, dan titik jemput. Statusnya bisa kamu pantau.` (3) `Timbangan dicatat petugas, harga tersimpan saat itu juga, saldo mudah dilihat.` (4) `Agenda kerja bakti, tugas relawan, dan pengumuman RT/RW ada di tempat yang sama.`
**Interaksi:** kartu muncul berurutan. Tidak ada animasi berulang. **Mobile:** satu kolom, urutan 1→4, ponsel di kartu 1 lebar 220px.

## 5.6 S6 — Fitur (#fitur) `[REF LawnBuster carousel]`

**Tujuan:** daftar kemampuan konkret dengan foto, bukan daftar ikon.
**Layout:** latar `--surface`. Kepala: eyebrow `FITUR`, h2 `Semua yang dibutuhkan untuk menjaga lingkungan bersama`, kanan: dua tombol lingkaran 44px (`chevron-left`/`chevron-right`). Di bawah: lajur horizontal **7 kartu foto tinggi** 296×440 (jarak 20px), scroll-snap start, bagian kanan terpotong untuk memberi petunjuk geser. Kartu mengikuti §3.4. Indikator titik di bawah (7 titik).

| # | Judul | Ikon (lingkaran) | Deskripsi (maks 2 baris) | Gambar |
|---|---|---|---|---|
| 1 | Aturan material lokal | `list-checks` | Tahu bahan apa yang diterima dan cara menyiapkannya, sesuai bank sampah terdekat. | `F1` |
| 2 | Ajukan penjemputan | `truck` | Pilih bahan dan jadwal, lalu pantau statusnya sampai selesai. | `F2` |
| 3 | Bank sampah & saldo | `wallet` | Penimbangan, harga saat itu, dan saldo tercatat rapi per anggota. | `F3` |
| 4 | Agenda & tugas komunitas | `calendar-days` | Kerja bakti, pendaftaran peserta, tugas relawan, dan pengumuman. | `F4` |
| 5 | Jejak batch | `qr-code` | Ikuti perjalanan material dari titik kumpul sampai penerima, lengkap dengan bukti. | `F5` |
| 6 | Pengetahuan budaya | `book-open` | Simpan cerita dan keterampilan lokal dengan izin yang jelas dari pemiliknya. | `F6` |
| 7 | Tetap jalan offline | `wifi-off` | Catatan tersimpan di ponsel dan terkirim otomatis saat sinyal kembali. | `F7` |

Tautan "Pelajari" pada kartu menggulir ke section terkait (S8 untuk #7, S9 untuk #5, S10 untuk #6, S7 untuk lainnya). **Interaksi:** seret/geser, panah, keyboard (←/→ saat lajur fokus). **Mobile:** kartu 264×400, 1,3 kartu terlihat.

## 5.7 S7 — Layar aplikasi (#layar)

**Tujuan:** pengunjung melihat seperti apa aplikasinya **untuk perannya**.
**Layout:** latar `--paper`. Kepala: eyebrow `LIHAT LANGSUNG`, h2 `Satu aplikasi, tampilan sesuai perannya`. Di bawah: **tab pil** (Warga · Pengurus · Operator bank sampah · Pengumpul · Mitra pengolah). Konten tab: kiri (kolom 1–5) daftar 3 butir manfaat (judul 20/28 + 1 baris), kanan (kolom 6–12) tiga `<PhoneFrame>` sejajar (tengah lebih besar 280px, samping 240px, diberi jarak −24px agar menimpa) berisi screenshot sesuai tab. Di bawah ponsel, keterangan kecil `Tampilan dari aplikasi versi saat ini.`

Isi tab (copy final):

| Tab | Tiga butir | Screenshot |
|---|---|---|
| Warga | Ajukan jemput dalam hitungan ketukan · Lihat saldo dan riwayat setoran · Ikut agenda RT/RW | `01-beranda`, `03-ajukan`, `05-saldo` |
| Pengurus | Atur agenda dan kuota peserta · Bagi tugas relawan dan verifikasi · Kirim pengumuman ke anggota | `06-agenda`, `07-tugas`, `08-pengumuman` |
| Operator bank sampah | Cari anggota, pilih bahan, hitung berat bersih otomatis · Harga tersimpan saat transaksi · Antrean offline terlihat jelas | `09-timbang`, `05-saldo`, `10-sinkron` |
| Pengumpul | Lihat tugas yang ditugaskan padamu · Catat serah terima · Alamat lengkap hanya untuk tugasmu | `11-tugas-jemput`, `12-serah-terima`, `04-pelacakan` |
| Mitra pengolah | Terima atau tolak batch dengan alasan · Catat berat dan kualitas · Unggah bukti hasil | `13-batch`, `14-penerimaan`, `15-bukti-hasil` |

**Interaksi:** tab dapat dioperasikan keyboard (`role=tablist`), panah mengganti tab, konten berganti dengan fade 200ms. **Mobile:** tab bisa digeser, satu ponsel besar + dua kecil di belakang atau carousel 3 ponsel. Jika suatu screenshot belum ada, tampilkan placeholder berlabel (aturan keras #6).

## 5.8 S8 — Tetap jalan tanpa sinyal (#offline)

**Tujuan:** menjawab keberatan terbesar lapangan: "sinyal di tempat kami jelek".
**Layout:** pita gelap `--brand-900` radius 32 (margin 16px) dengan foto `O1` terang 25% di belakang + `CirclesPattern`. Grid: kiri (kolom 1–6) teks, kanan (kolom 7–12) **diagram status** horizontal.

**Copy final:**
- Eyebrow `OFFLINE-FIRST` (`--teal-100`)
- h2 putih: `Sinyal putus, catatan tetap aman.`
- Lead (`--teal-100`): `Penimbangan dan pengajuan disimpan dulu di ponsel. Saat sinyal kembali, PilahYuk mengirimnya otomatis tanpa membuat catatan ganda. Kalau ada yang bentrok, petugas yang memutuskan, bukan ditimpa diam-diam.`
- Tombol sekunder (putih): `Lihat tampilan antrean →` (menggulir ke S7 tab Operator)

**Diagram status:** 5 simpul horizontal (garis penghubung 2px `--teal-100` 40%) dengan ikon + label di bawah:
`Disimpan di ponsel` (`smartphone`) → `Menunggu kirim` (`cloud-off`) → `Mengirim` (`refresh-cw`) → `Tersinkron` (`cloud-check`) ; cabang ke bawah dari `Mengirim` → `Perlu ditinjau` (`circle-alert`, strip `--warning-bg`). Label tidak memakai warna sebagai satu-satunya pembeda. Mobile: diagram vertikal.
**Interaksi:** saat bagian terlihat, simpul menyala berurutan sekali (300ms antar-simpul). Reduced-motion: langsung tampil.

## 5.9 S9 — Data yang jujur (#data-jujur)

**Tujuan:** membedakan PilahYuk: tiap angka diberi label seberapa bisa dipercaya.
**Layout:** latar `--surface`. Kiri (kolom 1–5): eyebrow `DATA JUJUR`, h2 `Setiap angka tahu asalnya`, paragraf, **lencana stempel** `CATATAN TERVERIFIKASI ✓` (96px, −8°) di sudut. Kanan (kolom 6–12): **tangga 4 label** vertikal, tiap baris kartu putih border (tinggi 88) berisi `TrustBadge` kiri + 1 kalimat kanan.

**Copy final:**
- Paragraf: `Angka yang hanya perkiraan tidak boleh tampil seperti hasil timbangan. Jadi PilahYuk selalu memberi label, dan label itu mengikuti data paling lemah di dalamnya.`
- Baris: `Perkiraan` (outline putus-putus) — `Diisi warga sebelum ditimbang.` · `Input manual` — `Dicatat petugas tanpa bukti timbang.` · `Hasil Timbang` (tint biru) — `Berat dari timbangan, dikonfirmasi petugas.` · `Terverifikasi ✓` (tint teal + ikon `badge-check`) — `Sudah dikonfirmasi dan, bila relevan, ada bukti dari pihak penerima.`
- Catatan kecil bergaris atas: `Jejak batch adalah catatan digital perjalanan material, bukan sertifikat daur ulang. Label "terdaur ulang" hanya muncul bila ada bukti dari penerima atau pengolah.`

**Interaksi:** hover/fokus pada baris menampilkan teks contoh ("Contoh: 2,4 kg · Perkiraan") dengan badge yang sama seperti di aplikasi. Mobile: tangga di bawah teks.

## 5.10 S10 — Komunitas & budaya (#komunitas)

**Tujuan:** menunjukkan PilahYuk lebih dari sampah: komunitas dan pengetahuan lokal.
**Layout:** latar `--paper`. Dua baris zig-zag.
- Baris A: kiri foto `C1` (4:5, bingkai radius 32, **potongan poligon sudut kanan-atas**, satu-satunya bingkai poligon di halaman) + stempel kecil; kanan teks.
- Baris B: kiri teks, kanan foto `C2` (1:1 bulat, 420px) dengan chip melayang `Izin tercatat ✓`.

**Copy final:**
- A: eyebrow `KOMUNITAS`, h2 `Kerja bakti, tugas, dan pengumuman, tanpa grup yang tenggelam`, `Atur agenda, buka pendaftaran dengan kuota, bagi tugas relawan, dan lihat siapa yang hadir. Semua tercatat di satu tempat.`
- B: eyebrow `PENGETAHUAN BUDAYA`, h2 `Cerita dan keterampilan lokal, dengan izin yang jelas`, `Resep, kerajinan, dan cerita warga bisa disimpan. Izin wawancara dicatat terpisah dari izin menerbitkan, jadi tidak ada yang tampil lebih jauh dari yang diizinkan pemiliknya.`
- Dua tautan kecil di bawah B: `Untuk pengurus komunitas` · `Untuk kurator`

## 5.11 S11 — Janji data (pita 4 butir) `[REF NavikX stats band]`

**Layout:** pita `--brand-900` radius 28, padding 40, 4 butir dipisah garis 1px putih 15%. Tiap butir: ikon Lucide 28px `--teal-100`, judul 18/700 putih, 1 baris 14/22 `--teal-100`. **Tanpa angka besar.**

| Judul | Ikon | Baris |
|---|---|---|
| Alamat dilindungi | `map-pin-off` | Hanya petugas yang ditugaskan dan pengurus berwenang yang melihatnya |
| Harga tidak berubah diam-diam | `lock` | Harga tercatat saat setoran, perubahan harga tidak menyentuh catatan lama |
| Koreksi tanpa menghapus | `history` | Perubahan dicatat sebagai koreksi, riwayat tetap ada |
| Izin budaya terpisah | `shield-check` | Wawancara, terbit, komersial, dan AI dicatat sendiri-sendiri |

Mobile: 2×2 dengan garis horizontal.

## 5.12 S12 — Cerita komunitas (NONAKTIF)

Komponen dibangun, tetapi dirender hanya bila `content.stories.length >= 3`. Setiap cerita wajib: kutipan nyata, nama + peran + lokasi yang sudah disetujui orangnya, foto asli yang disetujui. Tidak ada bintang. Tampilan: tiga kartu putih (foto bulat 56px, kutipan 17/28, nama + peran), `Pelajari lebih lanjut` tidak diperlukan. Sebelum itu, **jangan** tampilkan judul section.

## 5.13 S13 — Tanya jawab (#faq)

**Layout:** latar `--surface`. Kiri (kolom 1–4): eyebrow `TANYA JAWAB`, h2 `Yang sering ditanyakan`, teks `Belum terjawab? [ISI: kontak]`. Kanan (kolom 5–12): akordeon.

| Pertanyaan | Jawaban (copy final) |
|---|---|
| Apa itu PilahYuk? | Aplikasi komunitas untuk memilah sampah, mengajukan penjemputan, mencatat setoran ke bank sampah, dan mengelola kegiatan RT/RW. |
| Siapa yang bisa memakai? | Warga, pengurus RT/RW, operator bank sampah, pengumpul, mitra pengolah, dan kurator pengetahuan budaya. Tampilannya menyesuaikan peran. |
| Apakah harus online terus? | Tidak. Penimbangan dan pengajuan disimpan di ponsel dan dikirim otomatis saat ada sinyal. Jika ada data yang bentrok, petugas meninjaunya. |
| Siapa yang bisa melihat alamat saya? | Alamat lengkap hanya terlihat oleh pengumpul yang ditugaskan dan pengurus yang berwenang. Halaman publik tidak menampilkan alamat atau nomor telepon. |
| Apakah sampah saya pasti didaur ulang? | PilahYuk mencatat perjalanan material. Label "terdaur ulang" hanya muncul bila ada bukti dari penerima atau pengolah. Jejak batch bukan sertifikat daur ulang. |
| Bagaimana saldo dihitung? | Setiap penimbangan memakai harga yang berlaku saat transaksi. Kalau ada kesalahan, petugas membuat koreksi yang tercatat tanpa menghapus catatan awal. |
| Bagaimana RT/RW saya bergabung? | Komunitas didaftarkan lalu diverifikasi. [ISI: alur pendaftaran komunitas dan kontak]. |
| Tersedia di ponsel apa? | Saat ini Android (APK). Versi untuk toko aplikasi dan iPhone [ISI: status]. |
| Bagaimana data budaya dilindungi? | Izin wawancara, penerbitan, penggunaan komersial, dan pelatihan AI dicatat terpisah, dan konten tidak diterbitkan melebihi izin. |

**Interaksi:** satu terbuka pada satu waktu, `aria-expanded`, tautan langsung `#faq-<slug>`. Sematkan JSON-LD `FAQPage` dari data yang sama.

## 5.14 S14 — CTA unduh (#unduh)

**Tujuan:** satu momen akhir yang jelas, dengan QR untuk desktop.
**Layout:** banner `--brand-900` radius 32 (margin 16px), foto `B1` di belakang dengan overlay 85→40%, tinggi 480. Kiri: h2 putih `Siap mulai memilah bersama?`, lead `Pasang PilahYuk di Android dan mulai dari rumah.`, tombol amber `Unduh Aplikasi` + di bawahnya dua lencana toko berukuran sama (disabled sesuai aturan keras #4), teks kecil `Android 8.0+ [ISI: versi minimum], ukuran [ISI: MB]`. Kanan: kartu putih radius 24 (padding 24) berisi **QR code 168px** (`qrcode.react`, level H, kontras tinggi, warna `--brand-900` di atas putih) + `Pindai dari ponselmu` + URL pendek. QR hanya tampil ≥ 1024px; di mobile diganti dengan tombol.

**Catatan keamanan:** URL APK hanya dari domain milikmu (HTTPS), tampilkan nomor versi dan checksum SHA-256 di bawah tombol (`[ISI]`), agar pengguna bisa memverifikasi berkas.

## 5.15 S15 — Footer

Latar `--brand-900` + `CirclesPattern` 6%, padding 72/32. 4 kolom (kolom 1 lebar 5, lainnya 2–3): (1) logo putih + 1 kalimat (`Aplikasi komunitas untuk memilah dan mencatat sampah bersama.`) + ikon sosial `[ISI]`; (2) **Halaman**: Tentang, Cara Kerja, Fitur, Layar, Tanya Jawab; (3) **Untuk**: Warga, Pengurus, Bank sampah, Pengumpul, Mitra pengolah (anchor ke tab S7); (4) **Kontak**: `[ISI: email]`, `[ISI: kota]`. Baris bawah: `© 2026 PilahYuk` · Kebijakan Privasi · Syarat Penggunaan (`[ISI: tautan]`; wajib ada sebelum APK dipublikasikan). Teks 14/22 `--teal-100`.

## 5.16 Event analitik

`nav_download_click`, `hero_download_click`, `hero_howitworks_click`, `feature_card_click{id}`, `role_tab_change{role}`, `faq_open{slug}`, `qr_view`, `cta_download_click`, `apk_checksum_copy`. Tanpa data pribadi, tanpa cookie pelacak lintas-situs.

---

# 6. BAGIAN C — PROMPT PER FASE (untuk agen)

Setiap fase: tempel Master Prompt (§4) lebih dulu, lalu blok fase. Selesai bila semua *acceptance criteria* lulus dan laporan dibuat.

### L1 — Fondasi
```text
Goal: scaffold the landing project and design foundation.
Read: brief §3, §4.
Do: create Next.js 16 + Tailwind v4 + TS strict project in `landing/`; define tokens from §3.1-3.3 in globals.css; load Plus Jakarta Sans; build primitives: Container, Section (with paper/surface/dark variants), Eyebrow, PillButton (+arrow circle), TextLink, PhoneFrame (with placeholder mode), CirclesPattern (SVG), PaperTexture, Reveal (motion, reduced-motion aware), TrustBadge (4 variants), Logo (inline SVG). Create `src/content/id.ts` with ALL copy from §5 as typed constants. Add a /styleguide route (noindex) showing every primitive.
Acceptance: pnpm lint/typecheck/build pass; /styleguide renders all primitives at 1440 and 390; no box-shadow anywhere (add a test that scans computed styles of all elements); contrast checks pass.
```

### L2 — Navbar, Hero, Untuk siapa, Tentang
```text
Goal: build S1, S2, S3, S4 exactly per brief §5.1-5.4.
Do: floating pill navbar with scroll-spy and mobile sheet; hero with image slot H1 (placeholder until provided), two PhoneFrames with screenshots 01-beranda and 03-ajukan, overlapping download card; audience strip; about section with the circular photo cluster (A1-A3). Wire download buttons to NEXT_PUBLIC_APK_URL; if unset, button is disabled with tooltip "Tautan unduhan belum diatur".
Acceptance: hero LCP < 2.5 s on throttled 4G in Lighthouse; one h1; card overlap correct at 1440/1024/390; keyboard navigation works for nav + sheet; screenshots taken at 3 widths saved to e2e/screens/.
```

### L3 — Cara kerja dan Fitur
```text
Goal: build S5 bento and S6 carousel per brief §5.5-5.6.
Do: bento with 4 cards and tall rows; carousel with scroll-snap, arrow buttons, drag on desktop, keyboard arrows, dots indicator, 7 cards using image slots F1-F7 and exact copy. Cards link to anchors listed in §5.6.
Acceptance: carousel usable with keyboard and touch; no layout shift when images load (fixed aspect ratios); axe has zero serious violations.
```

### L4 — Layar, Offline, Data jujur
```text
Goal: build S7 role tabs, S8 offline band, S9 trust ladder per brief §5.7-5.9.
Do: accessible tablist with 5 roles and 3 PhoneFrames per tab; missing screenshots show labelled placeholders; offline diagram with sequenced reveal and vertical mobile layout; trust ladder using TrustBadge exactly like in the app (dashed outline for Perkiraan, etc.) plus the stamp and the disclaimer note.
Acceptance: tabs operable by arrow keys; diagram readable without color; copy matches §5.7-5.9 verbatim; reduced-motion shows final state immediately.
```

### L5 — Komunitas, Janji data, FAQ, CTA, Footer
```text
Goal: build S10, S11, S12 (disabled component), S13, S14, S15 per brief §5.10-5.15.
Do: zig-zag community/culture rows (one polygon-clipped frame only); promise band without big numbers; stories component rendered only when >= 3 real stories exist; FAQ accordion with FAQPage JSON-LD; CTA banner with QR (qrcode.react, level H) shown >= 1024 px, store badges disabled unless env URLs set, APK version + SHA-256 text from env; footer with 4 columns and legal links.
Acceptance: QR scans correctly from a phone screen at 1440; no store link points to a non-existent listing; all [ISI] placeholders are listed in docs/DECISIONS.md.
```

### L6 — SEO, performa, aksesibilitas, QA
```text
Goal: finish and verify.
Do: metadata (title, description, canonical, OG/Twitter), OG image 1200x630 composed in code or from provided asset, JSON-LD MobileApplication (no ratings) and FAQPage, sitemap, robots, favicon set; image optimization pipeline (AVIF/WebP, sizes, priority on hero only); analytics events from §5.16; Playwright screenshots at 1440/1024/390; Lighthouse CI budgets (LCP < 2.5 s, CLS < 0.05, JS < 170 KB gz); axe on every section; run the checklist in brief §10 and fix failures.
Acceptance: all budgets met; zero serious axe violations; checklist 100% ticked or explicitly waived in docs/DECISIONS.md; report lists remaining placeholders.
```

---

# 7. BAGIAN D — PROMPT GAMBAR (Google Flow / Gemini)

Prompt gambar sengaja **terpisah** dan ditulis dalam bahasa Inggris karena hasilnya lebih stabil di Gemini (Imagen / generator gambar) dan Google Flow. Catatan singkat Indonesia ada di bawah tiap kelompok.

## 7.1 Cara pakai

1. Tempel **STYLE BLOCK** (§7.3) di awal setiap prompt, lalu tempel **prompt slot**, lalu **NEGATIVE BLOCK** (§7.4) di akhir. Dengan begitu semua foto punya gaya, warna, dan suasana yang sama.
2. Generate **4 variasi** per slot, pilih 1. Kalau wajah atau tangan aneh, ulangi; jangan diperbaiki dengan menambah kata.
3. Gunakan rasio yang tertulis. Di Gemini sebutkan rasio dalam kalimat ("wide 16:9"); di Flow pilih rasio di pengaturan.
4. Konsistensi antar-gambar: pada Gemini, lampirkan hasil foto pertama (`H1`) sebagai gambar acuan dan tulis `Match the color grade, lighting and photographic style of the attached reference image.`
5. Setelah jadi: ubah nama sesuai tabel, kompres ke AVIF/WebP (hero ≤ 180 KB, lainnya ≤ 90 KB), isi `alt` dari tabel.
6. **Jangan** meminta teks, logo, atau layar aplikasi di dalam gambar. Layar aplikasi diambil dari aplikasi asli (§8).
7. Orang di foto adalah hasil AI, bukan tokoh nyata. Jangan menamai mereka atau memberi kutipan seolah orang sungguhan.
8. Periksa setiap hasil: tidak ada teks terbaca, tidak ada logo, tangan wajar (5 jari), tidak ada sampah yang tampak "dibuang sembarangan" kecuali memang adegan memilah, tidak ada orang yang menyerupai tokoh publik.

## 7.2 Daftar slot

| Slot | Nama file | Rasio / ukuran | Dipakai di | `alt` (Indonesia) |
|---|---|---|---|---|
| H1 | `hero-gang-pagi.avif` | 16:9 · 2560×1440 | S2 latar | Gang kampung pada pagi hari, warga membawa wadah pilah sampah |
| H1v | `hero-loop.mp4` (opsional) | 16:9 · 6 dtk | S2 desktop | (dekoratif) |
| A1 | `tentang-memilah.avif` | 1:1 · 1200×1200 | S4 foto besar bulat | Seorang ibu memilah botol dan kardus di halaman rumah |
| A2 | `tentang-tangan.avif` | 1:1 · 600×600 | S4 foto kecil | Tangan memilah botol plastik bening ke dalam keranjang |
| A3 | `tentang-timbang.avif` | 1:1 · 600×600 | S4 foto kecil | Petugas bank sampah menimbang kardus dengan timbangan digital |
| F1 | `fitur-aturan.avif` | 3:4 · 1000×1333 | S6 kartu 1 | Deretan wadah sampah terpilah di teras rumah |
| F2 | `fitur-jemput.avif` | 3:4 | S6 kartu 2 | Pengumpul dengan motor roda tiga membawa karung bahan terpilah di gang |
| F3 | `fitur-bank.avif` | 3:4 | S6 kartu 3 | Timbangan dan karung di bank sampah warga |
| F4 | `fitur-agenda.avif` | 3:4 | S6 kartu 4, S5 | Warga kerja bakti membersihkan selokan bersama |
| F5 | `fitur-batch.avif` | 3:4 | S6 kartu 5 | Karung bahan yang disegel dan diberi label di gudang kecil |
| F6 | `fitur-budaya.avif` | 3:4 | S6 kartu 6 | Pengrajin lanjut usia menganyam bahan bekas di serambi |
| F7 | `fitur-offline.avif` | 3:4 | S6 kartu 7 | Petugas mencatat di meja balai warga dengan lampu sore |
| O1 | `offline-balai.avif` | 16:9 · 2400×1350 | S8 latar | Balai warga sederhana dengan timbangan dan keranjang di sore hari |
| C1 | `komunitas-kerja-bakti.avif` | 4:5 · 1200×1500 | S10 baris A | Warga dari berbagai usia membersihkan lingkungan bersama |
| C2 | `komunitas-budaya.avif` | 1:1 · 1000×1000 | S10 baris B | Tangan perajin memegang anyaman dari bahan daur ulang |
| B1 | `unduh-banner.avif` | 21:9 · 2400×1030 | S14 latar | Warga bergotong royong di halaman balai warga saat pagi |

## 7.3 STYLE BLOCK (tempel di awal setiap prompt)

```text
Documentary-style photograph, shot on a 35mm lens at f/2.8, natural available light, candid and unposed, real everyday Indonesian neighborhood (RT/RW kampung) setting: narrow concrete lanes (gang), tiled roofs, potted plants, tropical greenery, simple community hall. Ordinary people in everyday clothes (some wearing hijab, caps, simple batik or plain t-shirts), natural skin texture, relaxed genuine expressions. Color grade: deep forest-green shadows, teal mid-tones, warm amber highlights, slightly desaturated, soft contrast, gentle film grain. Calm, warm, hopeful, dignified mood. Composition leaves clean negative space for overlaid text where noted.
```

## 7.4 NEGATIVE BLOCK (tempel di akhir setiap prompt)

```text
No text, no letters, no numbers, no signage with readable words, no logos, no brand names, no watermarks, no phone screens showing UI, no stock-photo smiles looking at camera, no studio lighting, no CGI or 3D render look, no illustration or cartoon, no oversaturated neon green, no extra fingers or distorted hands, no garbage dumped carelessly, no recognizable public figures, no uniforms of real organizations.
```

## 7.5 Prompt per slot

**H1 — hero (16:9).** Ruang kosong di kiri 45% untuk teks.
```text
Wide 16:9 image of a narrow kampung lane in early morning, soft golden light filtering through trees. On the right half, a middle-aged woman and a teenage boy carry two neatly labeled-by-color plastic crates of sorted bottles and cardboard toward the lane's end; a neighbor waves from a doorway in the background. The left 45% of the frame is calm and uncluttered (blurred wall and greenery, darker tones) to hold headline text. Shallow depth of field, leading lines along the lane.
```

**H1v — loop video untuk Flow (opsional, 6 detik, tanpa suara).**
```text
Same scene as the attached still (kampung lane at early morning). Very subtle motion only: leaves swaying slightly, soft light shifting, the woman and boy walking slowly forward with crates, a neighbor in the doorway raising a hand. Locked-off camera, no zoom, no cuts, seamless loop feel, 6 seconds, no audio, no text.
```

**A1 — tentang, foto besar (1:1).**
```text
Square image of a woman in her forties sitting on a low stool in her home front yard, sorting clean plastic bottles and flattened cardboard into three woven baskets, a small plant-filled terrace behind her, morning light from the left. Medium shot, hands and baskets clearly visible, focus on calm concentration.
```

**A2 — foto kecil, tangan (1:1).**
```text
Close-up square of two hands placing a clear plastic bottle into a basket full of other clean bottles, soft window light, shallow depth of field, blurred green background.
```

**A3 — foto kecil, penimbangan (1:1).**
```text
Square medium shot of a waste-bank volunteer in a plain polo shirt weighing a bundle of flattened cardboard on a digital platform scale in a small community room, a neighbor waiting beside, the scale's display deliberately out of focus and not readable.
```

**F1 — aturan material (3:4).** Ruang bawah 35% lebih gelap untuk teks kartu.
```text
Portrait 3:4 image of a row of four plain crates on a home terrace, each holding a different sorted material (bottles, paper, cans, glass), shot from a slight high angle, soft morning light, lower third of the frame darker and less detailed for text overlay.
```

**F2 — penjemputan (3:4).**
```text
Portrait 3:4 image of a collector on a three-wheeled cargo motorbike stopping in a gang, loading sealed sacks of sorted materials handed over by a resident, warm morning light, motion kept calm, lower third darker for text overlay.
```

**F3 — bank sampah (3:4).**
```text
Portrait 3:4 image inside a modest community waste bank room: a hanging spring scale and a digital scale, neatly stacked sacks, a wooden table with a plain paper notebook, a volunteer in a hijab arranging sacks, window light, lower third darker for text overlay.
```

**F4 — agenda (3:4).**
```text
Portrait 3:4 image of neighbors of different ages doing community clean-up together along a small drainage channel in a kampung, wearing plain green t-shirts without logos, carrying brooms and sacks, laughing, mid-morning light, lower third darker for text overlay.
```

**F5 — jejak batch (3:4).**
```text
Portrait 3:4 image in a small tidy storage room: several sealed sacks lined up on pallets, one worker tying a blank paper tag with string onto a sack, no readable writing, cool teal tones with a warm lamp, lower third darker for text overlay.
```

**F6 — budaya (3:4).**
```text
Portrait 3:4 image of an elderly woman on a veranda weaving a basket from reclaimed plastic strips and natural fibers, a younger girl watching and learning beside her, soft diffused daylight, respectful and warm, lower third darker for text overlay.
```

**F7 — offline (3:4).**
```text
Portrait 3:4 image of a volunteer writing on a clipboard and holding a phone with a dark, unreadable screen at a wooden table in a community hall during late afternoon, warm lamp glow and window light, subtle sense of patience and being offline, lower third darker for text overlay.
```

**O1 — latar section offline (16:9).** Gelap dan tenang; akan diberi overlay hijau.
```text
Wide 16:9 interior of a simple village community hall in the evening: a scale on a table, a few baskets and sacks, soft warm lamp light, windows with dusk blue light, no people or one distant figure, very low key and calm, large dark areas for text overlay.
```

**C1 — komunitas (4:5).**
```text
Portrait 4:5 group of neighbors of mixed ages gathered on a small community field after a clean-up, holding brooms and tied sacks, a few children, natural relaxed poses (not looking at camera), warm morning side light, trees behind.
```

**C2 — budaya (1:1).**
```text
Square close-up of an artisan's hands holding a woven coaster-sized piece made from reclaimed plastic strips and natural fiber, workshop table softly blurred, warm window light, rich texture detail.
```

**B1 — banner unduh (21:9).** Ruang kosong kiri 50% untuk teks.
```text
Ultra-wide 21:9 image of neighbors gathering in the yard of a community hall in the morning, some carrying sorted sacks, others setting up a table, warm low sun, the left 50% of the frame calmer and darker with blurred greenery to hold text and buttons.
```

## 7.6 Elemen non-foto (jangan digenerate, dibuat di kode)

| Elemen | Cara membuat |
|---|---|
| Logo PilahYuk | SVG inline; pakai logo asli tim bila ada |
| Lingkaran konsentris 6% | Komponen SVG `CirclesPattern` |
| Tekstur kertas | SVG `feTurbulence`, opasitas 3–4% |
| Stempel "Catatan terverifikasi ✓" | SVG teks melingkar (`<textPath>`) |
| Ikon | Lucide |
| Mockup ponsel | `<PhoneFrame>` + screenshot asli |
| OG image 1200×630 | Dikomposisi di kode/Figma: logo, h1 hero, 1 ponsel; tanpa foto AI berwajah |

---

# 8. Aset yang harus kamu siapkan (bukan dari AI)

### 8.1 Screenshot aplikasi (dari aplikasi Flutter yang sudah dibuat)

- Ambil dari **perangkat atau emulator** dengan data demo yang masuk akal dan **tanpa data pribadi**. Resolusi 1080×2400 atau 1170×2532, PNG, tanpa bilah status ponsel (atau bilah bersih: jam 09.41, baterai penuh, tanpa notifikasi).
- Simpan di `public/screens/` dengan nama di bawah. Layar yang belum ada pada aplikasi boleh dilewati; agen menampilkan placeholder berlabel.

| File | Layar |
|---|---|
| `01-beranda.png` | Beranda |
| `02-pilah.png` | Aturan material / panduan memilah |
| `03-ajukan.png` | Ajukan penjemputan |
| `04-pelacakan.png` | Pelacakan penjemputan |
| `05-saldo.png` | Saldo / riwayat bank sampah |
| `06-agenda.png` | Agenda komunitas |
| `07-tugas.png` | Tugas relawan |
| `08-pengumuman.png` | Pengumuman |
| `09-timbang.png` | Form penimbangan (operator) |
| `10-sinkron.png` | Antrean sinkronisasi / outbox |
| `11-tugas-jemput.png` | Tugas jemput (pengumpul) |
| `12-serah-terima.png` | Konfirmasi serah terima |
| `13-batch.png` | Detail batch |
| `14-penerimaan.png` | Penerimaan batch (mitra) |
| `15-bukti-hasil.png` | Unggah bukti hasil |

### 8.2 Informasi yang harus kamu isi (`[ISI]`)

URL APK (HTTPS, domain sendiri), nomor versi, ukuran berkas, versi Android minimum, SHA-256 berkas, email kontak, kota/alamat, akun sosial, tautan Kebijakan Privasi dan Syarat Penggunaan (wajib ada sebelum APK dipublikasikan), alur pendaftaran komunitas, status toko aplikasi dan iPhone.

---

# 9. Keputusan terbuka (default dipakai bila tidak dijawab)

| # | Keputusan | Default |
|---|---|---|
| 1 | Domain landing | Subdomain terpisah dari dashboard, mis. `pilahyuk.<domainmu>`; proyek `landing/` terpisah dari `web/` |
| 2 | Nama tagline | "Pilah dari rumah, kumpul bersama tetangga." `[USULAN]`; ganti bila ada tagline resmi di PRD |
| 3 | Tombol berbentuk pil + lingkaran panah | Dipakai di landing saja `[LANDING]` meski dashboard memakai radius 12 |
| 4 | Video hero (H1v) | Tidak dipakai; foto statis dulu agar muat cepat |
| 5 | Section cerita (S12) | Nonaktif sampai ada kutipan nyata yang disetujui |
| 6 | Bahasa lain | Hanya Indonesia di rilis pertama |
| 7 | Analitik | Plausible/Umami tanpa cookie |
| 8 | Distribusi APK | Berkas dari domain sendiri + checksum; Play Store menyusul |

---

# 10. Checklist kualitas (sebelum fase L6 dinyatakan selesai)

**Desain**
- [ ] Hero punya satu titik fokus; hanya satu tombol amber per layar
- [ ] Tidak ada `box-shadow`, gradien dekoratif, atau font selain Plus Jakarta Sans
- [ ] Hanya satu bingkai poligon (C1); lainnya bulat/membulat
- [ ] Tidak ada empat kartu identik berderet; ritme jarak bervariasi (rapat dalam grup, longgar antar-section)
- [ ] Dua section gelap tidak bersebelahan
- [ ] Ikon hanya di tempat yang ditentukan spesifikasi

**Konten dan kejujuran**
- [ ] Tidak ada angka pengguna/unduhan, rating, bintang, logo klien, atau testimoni
- [ ] Tidak ada klaim "terdaur ulang" tanpa bukti, tidak ada angka karbon, tidak ada kata "sertifikat daur ulang" selain sebagai penyangkalan
- [ ] Semua layar di mockup berasal dari aplikasi asli
- [ ] Semua `[ISI]` terdaftar di `docs/DECISIONS.md` atau terisi
- [ ] Tombol toko tidak menautkan ke listing yang belum ada

**Teknis**
- [ ] LCP < 2,5 dtk, CLS < 0,05, JS < 170 KB gz (mobile 4G throttle)
- [ ] Zero pelanggaran axe kategori serius/kritis; carousel, tab, akordeon bisa dengan keyboard
- [ ] `prefers-reduced-motion` mematikan semua gerak
- [ ] Diuji di 390, 768, 1024, 1440 px, dan di Android nyata (target ketuk ≥ 44px)
- [ ] Metadata, OG image, JSON-LD (tanpa aggregateRating), sitemap, robots
- [ ] QR code terbaca dari layar desktop

---

**Sumber riset:** [App Landing Pages for Mobile Products: A Practical 2026 Conversion Playbook](https://unicornplatform.com/blog/app-landing-pages-for-mobile-products-in-2026/) · [Best Green Landing Page Design Inspiration (Lapa Ninja)](https://www.lapa.ninja/color/green/page/21) · tiga gambar referensi dari pengguna (Doc Mo Farm, NavikX, LawnBuster).
