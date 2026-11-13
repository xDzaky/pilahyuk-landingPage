# 🚀 Vercel Environment Variables — PilahYuk Dashboard

Panduan lengkap menambahkan environment variables di Vercel untuk project `pilahyuk-dashboard.vercel.app`.

---

## Cara Menambahkan di Vercel

1. Buka https://vercel.com/dashboard
2. Pilih project **pilahyuk-dashboard**
3. Klik tab **Settings** → **Environment Variables**
4. Tambahkan setiap variabel di bawah satu per satu
5. Pastikan centang environment: ✅ **Production** ✅ **Preview** ✅ **Development**
6. Klik **Save** setelah semua ditambahkan
7. Klik **Redeploy** di tab Deployments

---

## 🗄️ Database (Neon PostgreSQL)

> ⚠️ Ganti value di bawah dengan Neon connection string kamu
> Dapatkan dari: https://console.neon.tech → project → Connection Details

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://USER:PASS@HOST/DATABASE?sslmode=require` |
| `DIRECT_URL` | `postgresql://USER:PASS@HOST/DATABASE?sslmode=require` |

**Contoh format Neon:**
```
DATABASE_URL=postgresql://pilahyuk_owner:AbCdEfGh@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/pilahyuk?sslmode=require
DIRECT_URL=postgresql://pilahyuk_owner:AbCdEfGh@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/pilahyuk?sslmode=require
```

---

## 🔐 Authentication & Security

> ⚠️ WAJIB diganti dengan nilai random yang kuat di production!
> Generate secret: https://generate-secret.vercel.app/32

| Key | Value (Production) |
|-----|-------------------|
| `NEXTAUTH_SECRET` | `[generate random 32 char string]` |
| `NEXTAUTH_URL` | `https://pilahyuk-dashboard.vercel.app` |
| `JWT_SECRET` | `[generate random 32 char string]` |

**Contoh generate secret (jalankan di terminal):**
```bash
openssl rand -base64 32
```

---

## 🌐 App URL

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_APP_URL` | `https://pilahyuk-dashboard.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `PilahYuk 2.0` |

---

## ☁️ Cloudflare R2 (File Storage)

| Key | Value |
|-----|-------|
| `CLOUDFLARE_R2_ENDPOINT` | `https://7d3bffb8f9d8c378e5ab1c8c85e90f9e.r2.cloudflarestorage.com` |
| `CLOUDFLARE_R2_ACCESS_KEY` | `51dff263bfba22d168eb52f5855a912a` |
| `CLOUDFLARE_R2_SECRET_KEY` | `f370bdcd360418dad8fd35552b9156beb6a6f741f18aa1e347e3ed8a7d3f50a9` |
| `CLOUDFLARE_R2_BUCKET` | `pilahyuk-assets` |

---

## 📊 Sentry (Error Monitoring)

| Key | Value |
|-----|-------|
| `SENTRY_DSN` | `https://a40e2665538cde378d66b700bf9ce8ee@o4512424423718912.ingest.us.sentry.io/4512424473264128` |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://a40e2665538cde378d66b700bf9ce8ee@o4512424423718912.ingest.us.sentry.io/4512424473264128` |

---

## 🗺️ Geoapify (Peta & Lokasi)

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_GEOAPIFY_KEY` | `b737bf8a30354b318f927fd71739237c` |

---

## 💬 Fonnte (WhatsApp Notifikasi)

| Key | Value |
|-----|-------|
| `FONNTE_TOKEN` | `c6MRW9jtedV37WBcfg84uNbWFjsWNHGv5nFhKxAS` |

---

## ⚙️ Optional (Redis — tidak wajib untuk MVP)

> Redis digunakan untuk rate limiting & caching. Bisa skip jika belum pakai Upstash.
> Daftar gratis: https://upstash.com

| Key | Value |
|-----|-------|
| `REDIS_URL` | `redis://default:PASSWORD@HOST:PORT` |

---

## 📋 Checklist Sebelum Deploy

- [ ] `DATABASE_URL` → sudah pakai Neon URL (bukan localhost)
- [ ] `DIRECT_URL` → sama dengan DATABASE_URL
- [ ] `NEXTAUTH_SECRET` → sudah diganti (bukan `pilahyuk-dev-secret`)
- [ ] `JWT_SECRET` → sudah diganti (bukan `pilahyuk-jwt-dev-secret`)
- [ ] `NEXTAUTH_URL` → `https://pilahyuk-dashboard.vercel.app` (bukan localhost)
- [ ] `NEXT_PUBLIC_APP_URL` → `https://pilahyuk-dashboard.vercel.app`
- [ ] Cloudflare R2 sudah dikonfigurasi
- [ ] Semua env sudah di-Save di Vercel

---

## 🔄 Setelah Semua Env Ditambahkan

1. Klik tab **Deployments** di Vercel
2. Klik tombol **⋯** di deployment terbaru
3. Pilih **Redeploy**
4. Tunggu ~2-3 menit
5. Buka https://pilahyuk-dashboard.vercel.app ✅

---

## 🗃️ Database Migration (Jalankan Sekali)

Setelah deploy pertama, jalankan di terminal lokal dengan Neon URL:

```bash
cd /home/dzaky/Desktop/competisi/budaya-go/pilahyuk-dashboard

# Set DATABASE_URL ke Neon (temporary)
export DATABASE_URL="postgresql://USER:PASS@HOST/DATABASE?sslmode=require"

# Push schema ke Neon
npx prisma db push

# (Opsional) Seed data awal
npx prisma db seed
```
