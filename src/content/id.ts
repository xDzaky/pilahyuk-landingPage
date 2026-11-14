/**
 * Seluruh copy landing page PilahYuk — Bahasa Indonesia.
 * Sumber: docs/LANDING_BRIEF.md §5. Jangan mengarang fakta di luar file ini.
 */

export const site = {
  name: "PilahYuk",
  tagline: "Pilah dari rumah, kumpul bersama tetangga.",
  description:
    "PilahYuk membantu warga memilah sampah, mengajukan penjemputan, dan mencatat setoran ke bank sampah — juga saat sinyal putus.",
  year: 2026,
} as const;

export const nav = {
  links: [
    { id: "tentang", label: "Tentang" },
    { id: "cara-kerja", label: "Cara Kerja" },
    { id: "fitur", label: "Fitur" },
    { id: "layar", label: "Layar" },
    { id: "faq", label: "Tanya Jawab" },
  ],
  download: "Unduh",
  login: "Masuk",
} as const;

export const hero = {
  eyebrow: "APLIKASI KOMUNITAS PILAH SAMPAH",
  titleBefore: "Pilah dari rumah, kumpul bersama ",
  titleAccent: "tetangga.",
  lead: "PilahYuk membantu warga memilah sampah, mengajukan penjemputan, dan mencatat setoran ke bank sampah. Pengurus RT/RW pun bisa mengatur kegiatan dalam satu aplikasi, dan tetap jalan walau sinyal putus.",
  primaryCta: "Unduh Aplikasi",
  secondaryCta: "Lihat cara kerja",
  trust: [
    { text: "Alamat rumah tidak dibuka ke publik", icon: "map-pin-off" },
    { text: "Harga tercatat saat setoran", icon: "tag" },
    { text: "Koreksi tanpa menghapus riwayat", icon: "history" },
  ],
  downloadCard: {
    android: "Android · APK",
    offline: "Tetap jalan tanpa sinyal",
    cta: "Unduh Aplikasi",
  },
} as const;

export const audience = {
  title: "Dibuat untuk orang-orang yang menjaga lingkungannya",
  roles: [
    { name: "Warga", line: "Pilah, ajukan jemput, pantau saldo", icon: "house" },
    { name: "Pengurus RT/RW", line: "Atur agenda, tugas, dan anggota", icon: "users" },
    { name: "Bank sampah", line: "Timbang dan catat, juga offline", icon: "scale" },
    { name: "Pengumpul", line: "Tugas jemput dan serah terima", icon: "truck" },
    { name: "Mitra pengolah", line: "Terima batch dan unggah bukti hasil", icon: "recycle" },
  ],
} as const;

export const about = {
  eyebrow: "TENTANG PILAHYUK",
  lead: "Banyak kampung sudah mau memilah, tetapi catatannya tercecer: siapa menyetor apa, berapa timbangannya, ke mana perginya. PilahYuk menyatukan semuanya, dari rumah warga sampai bank sampah dan pengolah, dalam satu aplikasi dengan cara yang jujur: yang diperkirakan ditandai perkiraan, yang ditimbang ditandai hasil timbang.",
  leadHighlight: "cara yang jujur",
  bullets: [
    "Mulai dari yang paling sederhana: pilah, lalu ajukan jemput",
    "Satu catatan untuk warga, bank sampah, pengumpul, dan pengolah",
    "Tumbuh bersama komunitas: agenda, tugas relawan, dan pengetahuan budaya",
  ],
  cta: "Lihat cara kerjanya",
} as const;

export const howItWorks = {
  eyebrow: "CARA KERJA",
  title: "Tiga langkah dari rumah sampai tercatat",
  aside: "Semua langkah bisa dilakukan dari ponsel.",
  steps: [
    {
      index: "01",
      title: "Pilah sesuai aturan lokal",
      description:
        "Cek bahan mana yang diterima bank sampah di sekitarmu dan cara menyiapkannya.",
    },
    {
      index: "02",
      title: "Ajukan penjemputan",
      description: "Pilih bahan, tanggal, dan titik jemput. Statusnya bisa kamu pantau.",
      statuses: ["Menunggu", "Dikonfirmasi", "Dalam Perjalanan"],
    },
    {
      index: "03",
      title: "Setor dan lihat catatannya",
      description:
        "Timbangan dicatat petugas, harga tersimpan saat itu juga, saldo mudah dilihat.",
    },
    {
      index: "04",
      title: "Ikut kegiatan komunitas",
      optional: true,
      description:
        "Agenda kerja bakti, tugas relawan, dan pengumuman RT/RW ada di tempat yang sama.",
    },
  ],
} as const;

export const features = {
  eyebrow: "FITUR",
  title: "Semua yang dibutuhkan untuk menjaga lingkungan bersama",
  items: [
    {
      id: "aturan",
      title: "Aturan material lokal",
      description:
        "Tahu bahan apa yang diterima dan cara menyiapkannya, sesuai bank sampah terdekat.",
      icon: "list-checks",
      href: "#layar",
      slot: "F1",
    },
    {
      id: "jemput",
      title: "Ajukan penjemputan",
      description: "Pilih bahan dan jadwal, lalu pantau statusnya sampai selesai.",
      icon: "truck",
      href: "#layar",
      slot: "F2",
    },
    {
      id: "bank",
      title: "Bank sampah & saldo",
      description: "Penimbangan, harga saat itu, dan saldo tercatat rapi per anggota.",
      icon: "wallet",
      href: "#layar",
      slot: "F3",
    },
    {
      id: "agenda",
      title: "Agenda & tugas komunitas",
      description: "Kerja bakti, pendaftaran peserta, tugas relawan, dan pengumuman.",
      icon: "calendar-days",
      href: "#layar",
      slot: "F4",
    },
    {
      id: "batch",
      title: "Jejak batch",
      description:
        "Ikuti perjalanan material dari titik kumpul sampai penerima, lengkap dengan bukti.",
      icon: "qr-code",
      href: "#data-jujur",
      slot: "F5",
    },
    {
      id: "budaya",
      title: "Pengetahuan budaya",
      description:
        "Simpan cerita dan keterampilan lokal dengan izin yang jelas dari pemiliknya.",
      icon: "book-open",
      href: "#komunitas",
      slot: "F6",
    },
    {
      id: "offline",
      title: "Tetap jalan offline",
      description: "Catatan tersimpan di ponsel dan terkirim otomatis saat sinyal kembali.",
      icon: "wifi-off",
      href: "#offline",
      slot: "F7",
    },
  ],
} as const;

export const appScreens = {
  eyebrow: "LIHAT LANGSUNG",
  title: "Satu aplikasi, tampilan sesuai perannya",
  note: "Tampilan dari aplikasi versi saat ini.",
  roles: [
    {
      id: "warga",
      label: "Warga",
      bullets: [
        "Ajukan jemput dalam hitungan ketukan",
        "Lihat saldo dan riwayat setoran",
        "Ikut agenda RT/RW",
      ],
      screens: ["01-beranda", "03-ajukan", "05-saldo"],
    },
    {
      id: "pengurus",
      label: "Pengurus",
      bullets: [
        "Atur agenda dan kuota peserta",
        "Bagi tugas relawan dan verifikasi",
        "Kirim pengumuman ke anggota",
      ],
      screens: ["06-agenda", "07-tugas", "08-pengumuman"],
    },
    {
      id: "operator",
      label: "Operator bank sampah",
      bullets: [
        "Cari anggota, pilih bahan, hitung berat bersih otomatis",
        "Harga tersimpan saat transaksi",
        "Antrean offline terlihat jelas",
      ],
      screens: ["09-timbang", "05-saldo", "10-sinkron"],
    },
    {
      id: "pengumpul",
      label: "Pengumpul",
      bullets: [
        "Lihat tugas yang ditugaskan padamu",
        "Catat serah terima",
        "Alamat lengkap hanya untuk tugasmu",
      ],
      screens: ["11-tugas-jemput", "12-serah-terima", "04-pelacakan"],
    },
    {
      id: "mitra",
      label: "Mitra pengolah",
      bullets: [
        "Terima atau tolak batch dengan alasan",
        "Catat berat dan kualitas",
        "Unggah bukti hasil",
      ],
      screens: ["13-batch", "14-penerimaan", "15-bukti-hasil"],
    },
  ],
} as const;

export const offline = {
  eyebrow: "OFFLINE-FIRST",
  title: "Sinyal putus, catatan tetap aman.",
  lead: "Penimbangan dan pengajuan disimpan dulu di ponsel. Saat sinyal kembali, PilahYuk mengirimnya otomatis tanpa membuat catatan ganda. Kalau ada yang bentrok, petugas yang memutuskan, bukan ditimpa diam-diam.",
  cta: "Lihat tampilan antrean",
  nodes: [
    { label: "Disimpan di ponsel", icon: "smartphone" },
    { label: "Menunggu kirim", icon: "cloud-off" },
    { label: "Mengirim", icon: "refresh-cw" },
    { label: "Tersinkron", icon: "cloud-check" },
  ],
  branch: { label: "Perlu ditinjau", icon: "circle-alert" },
} as const;

export const trust = {
  eyebrow: "DATA JUJUR",
  title: "Setiap angka tahu asalnya",
  paragraph:
    "Angka yang hanya perkiraan tidak boleh tampil seperti hasil timbangan. Jadi PilahYuk selalu memberi label, dan label itu mengikuti data paling lemah di dalamnya.",
  rows: [
    {
      variant: "estimated",
      label: "Perkiraan",
      description: "Diisi warga sebelum ditimbang.",
      example: "Contoh: 2,4 kg · Perkiraan",
    },
    {
      variant: "manual",
      label: "Input manual",
      description: "Dicatat petugas tanpa bukti timbang.",
      example: "Contoh: 2,4 kg · Input manual",
    },
    {
      variant: "weighed",
      label: "Hasil Timbang",
      description: "Berat dari timbangan, dikonfirmasi petugas.",
      example: "Contoh: 2,4 kg · Hasil Timbang",
    },
    {
      variant: "verified",
      label: "Terverifikasi",
      description:
        "Sudah dikonfirmasi dan, bila relevan, ada bukti dari pihak penerima.",
      example: "Contoh: 2,4 kg · Terverifikasi",
    },
  ],
  note: 'Jejak batch adalah catatan digital perjalanan material, bukan sertifikat daur ulang. Label "terdaur ulang" hanya muncul bila ada bukti dari penerima atau pengolah.',
} as const;

export const community = {
  blockA: {
    eyebrow: "KOMUNITAS",
    title: "Kerja bakti, tugas, dan pengumuman, tanpa grup yang tenggelam",
    body: "Atur agenda, buka pendaftaran dengan kuota, bagi tugas relawan, dan lihat siapa yang hadir. Semua tercatat di satu tempat.",
  },
  blockB: {
    eyebrow: "PENGETAHUAN BUDAYA",
    title: "Cerita dan keterampilan lokal, dengan izin yang jelas",
    body: "Resep, kerajinan, dan cerita warga bisa disimpan. Izin wawancara dicatat terpisah dari izin menerbitkan, jadi tidak ada yang tampil lebih jauh dari yang diizinkan pemiliknya.",
    links: ["Untuk pengurus komunitas", "Untuk kurator"],
  },
} as const;

export const promise = {
  eyebrow: "JANJI DATA",
  items: [
    {
      title: "Alamat dilindungi",
      icon: "map-pin-off",
      line: "Hanya petugas yang ditugaskan dan pengurus berwenang yang melihatnya",
    },
    {
      title: "Harga tidak berubah diam-diam",
      icon: "lock",
      line: "Harga tercatat saat setoran, perubahan harga tidak menyentuh catatan lama",
    },
    {
      title: "Koreksi tanpa menghapus",
      icon: "history",
      line: "Perubahan dicatat sebagai koreksi, riwayat tetap ada",
    },
    {
      title: "Izin budaya terpisah",
      icon: "shield-check",
      line: "Wawancara, terbit, komersial, dan AI dicatat sendiri-sendiri",
    },
  ],
} as const;

export const faq = {
  eyebrow: "TANYA JAWAB",
  title: "Yang sering ditanyakan",
  contactPrefix: "Belum terjawab?",
  /** Ganti dengan kanal kontak resmi sebelum rilis. */
  contact: "[ISI: kontak]",
  items: [
    {
      slug: "apa-itu-pilahyuk",
      question: "Apa itu PilahYuk?",
      answer:
        "Aplikasi komunitas untuk memilah sampah, mengajukan penjemputan, mencatat setoran ke bank sampah, dan mengelola kegiatan RT/RW.",
    },
    {
      slug: "siapa-yang-bisa-memakai",
      question: "Siapa yang bisa memakai?",
      answer:
        "Warga, pengurus RT/RW, operator bank sampah, pengumpul, mitra pengolah, dan kurator pengetahuan budaya. Tampilannya menyesuaikan peran.",
    },
    {
      slug: "harus-online",
      question: "Apakah harus online terus?",
      answer:
        "Tidak. Penimbangan dan pengajuan disimpan di ponsel dan dikirim otomatis saat ada sinyal. Jika ada data yang bentrok, petugas meninjaunya.",
    },
    {
      slug: "alamat",
      question: "Siapa yang bisa melihat alamat saya?",
      answer:
        "Alamat lengkap hanya terlihat oleh pengumpul yang ditugaskan dan pengurus yang berwenang. Halaman publik tidak menampilkan alamat atau nomor telepon.",
    },
    {
      slug: "daur-ulang",
      question: "Apakah sampah saya pasti didaur ulang?",
      answer:
        'PilahYuk mencatat perjalanan material. Label "terdaur ulang" hanya muncul bila ada bukti dari penerima atau pengolah. Jejak batch bukan sertifikat daur ulang.',
    },
    {
      slug: "saldo",
      question: "Bagaimana saldo dihitung?",
      answer:
        "Setiap penimbangan memakai harga yang berlaku saat transaksi. Kalau ada kesalahan, petugas membuat koreksi yang tercatat tanpa menghapus catatan awal.",
    },
    {
      slug: "gabung-rt",
      question: "Bagaimana RT/RW saya bergabung?",
      answer:
        "Komunitas didaftarkan lalu diverifikasi. [ISI: alur pendaftaran komunitas dan kontak].",
    },
    {
      slug: "perangkat",
      question: "Tersedia di ponsel apa?",
      answer: "Saat ini Android (APK). Versi untuk toko aplikasi dan iPhone [ISI: status].",
    },
    {
      slug: "data-budaya",
      question: "Bagaimana data budaya dilindungi?",
      answer:
        "Izin wawancara, penerbitan, penggunaan komersial, dan pelatihan AI dicatat terpisah, dan konten tidak diterbitkan melebihi izin.",
    },
  ],
} as const;

export const download = {
  title: "Siap mulai memilah bersama?",
  lead: "Pasang PilahYuk di Android dan mulai dari rumah.",
  cta: "Unduh Aplikasi",
  scan: "Pindai dari ponselmu",
  qrCaption: "Arahkan kamera ponsel ke kode ini",
  playStore: { label: "Google Play", state: "Segera hadir" },
  appStore: { label: "App Store", state: "Belum tersedia" },
  /** Ditampilkan di bawah tombol; diisi dari env saat build. */
  platform: "Android",
} as const;

export const footer = {
  blurb: "Aplikasi komunitas untuk memilah dan mencatat sampah bersama.",
  columns: [
    {
      title: "Halaman",
      links: [
        { label: "Tentang", href: "#tentang" },
        { label: "Cara Kerja", href: "#cara-kerja" },
        { label: "Fitur", href: "#fitur" },
        { label: "Layar", href: "#layar" },
        { label: "Tanya Jawab", href: "#faq" },
      ],
    },
    {
      title: "Untuk",
      links: [
        { label: "Warga", href: "#layar" },
        { label: "Pengurus", href: "#layar" },
        { label: "Bank sampah", href: "#layar" },
        { label: "Pengumpul", href: "#layar" },
        { label: "Mitra pengolah", href: "#layar" },
      ],
    },
  ],
  contact: {
    title: "Kontak",
    email: "[ISI: email]",
    city: "[ISI: kota]",
  },
  legal: [
    { label: "Kebijakan Privasi", href: "#" },
    { label: "Syarat Penggunaan", href: "#" },
  ],
  copyright: "© 2026 PilahYuk",
} as const;

/** Slot gambar §7.2 — dipakai bila berkasnya sudah ada di public/img. */
export const imageSlots = {
  H1: { file: "img/hero-gang-pagi.avif", label: "H1 · hero-gang-pagi.avif", size: "2560 × 1440", alt: "Gang kampung pada pagi hari, warga membawa wadah pilah sampah" },
  A1: { file: "img/tentang-memilah.avif", label: "A1 · tentang-memilah.avif", size: "1200 × 1200", alt: "Seorang ibu memilah botol dan kardus di halaman rumah" },
  A2: { file: "img/tentang-tangan.avif", label: "A2 · tentang-tangan.avif", size: "600 × 600", alt: "Tangan memilah botol plastik bening ke dalam keranjang" },
  A3: { file: "img/tentang-timbang.avif", label: "A3 · tentang-timbang.avif", size: "600 × 600", alt: "Petugas bank sampah menimbang kardus dengan timbangan digital" },
  F1: { file: "img/fitur-aturan.avif", label: "F1 · fitur-aturan.avif", size: "1000 × 1333", alt: "Deretan wadah sampah terpilah di teras rumah" },
  F2: { file: "img/fitur-jemput.avif", label: "F2 · fitur-jemput.avif", size: "1000 × 1333", alt: "Pengumpul dengan motor roda tiga membawa karung bahan terpilah di gang" },
  F3: { file: "img/fitur-bank.avif", label: "F3 · fitur-bank.avif", size: "1000 × 1333", alt: "Timbangan dan karung di bank sampah warga" },
  F4: { file: "img/fitur-agenda.avif", label: "F4 · fitur-agenda.avif", size: "1000 × 1333", alt: "Warga kerja bakti membersihkan selokan bersama" },
  F5: { file: "img/fitur-batch.avif", label: "F5 · fitur-batch.avif", size: "1000 × 1333", alt: "Karung bahan yang disegel dan diberi label di gudang kecil" },
  F6: { file: "img/fitur-budaya.avif", label: "F6 · fitur-budaya.avif", size: "1000 × 1333", alt: "Pengrajin lanjut usia menganyam bahan bekas di serambi" },
  F7: { file: "img/fitur-offline.avif", label: "F7 · fitur-offline.avif", size: "1000 × 1333", alt: "Petugas mencatat di meja balai warga dengan lampu sore" },
  O1: { file: "img/offline-balai.avif", label: "O1 · offline-balai.avif", size: "2400 × 1350", alt: "Balai warga sederhana dengan timbangan dan keranjang di sore hari" },
  C1: { file: "img/komunitas-kerja-bakti.avif", label: "C1 · komunitas-kerja-bakti.avif", size: "1200 × 1500", alt: "Warga dari berbagai usia membersihkan lingkungan bersama" },
  C2: { file: "img/komunitas-budaya.avif", label: "C2 · komunitas-budaya.avif", size: "1000 × 1000", alt: "Tangan perajin memegang anyaman dari bahan daur ulang" },
  B1: { file: "img/unduh-banner.avif", label: "B1 · unduh-banner.avif", size: "2400 × 1030", alt: "Warga bergotong royong di halaman balai warga saat pagi" },
} as const;

/** Screenshot aplikasi §8.1 — hanya dari aplikasi asli. */
export const screenSlots: Record<string, { file: string; label: string }> = {
  "01-beranda": { file: "screens/01-beranda.png", label: "Beranda" },
  "02-pilah": { file: "screens/02-pilah.png", label: "Panduan memilah" },
  "03-ajukan": { file: "screens/03-ajukan.png", label: "Ajukan penjemputan" },
  "04-pelacakan": { file: "screens/04-pelacakan.png", label: "Pelacakan" },
  "05-saldo": { file: "screens/05-saldo.png", label: "Saldo" },
  "06-agenda": { file: "screens/06-agenda.png", label: "Agenda" },
  "07-tugas": { file: "screens/07-tugas.png", label: "Tugas relawan" },
  "08-pengumuman": { file: "screens/08-pengumuman.png", label: "Pengumuman" },
  "09-timbang": { file: "screens/09-timbang.png", label: "Form penimbangan" },
  "10-sinkron": { file: "screens/10-sinkron.png", label: "Antrean sinkronisasi" },
  "11-tugas-jemput": { file: "screens/11-tugas-jemput.png", label: "Tugas jemput" },
  "12-serah-terima": { file: "screens/12-serah-terima.png", label: "Serah terima" },
  "13-batch": { file: "screens/13-batch.png", label: "Detail batch" },
  "14-penerimaan": { file: "screens/14-penerimaan.png", label: "Penerimaan batch" },
  "15-bukti-hasil": { file: "screens/15-bukti-hasil.png", label: "Unggah bukti hasil" },
};

export type ImageSlotName = keyof typeof imageSlots;
export type ScreenName = keyof typeof screenSlots;
