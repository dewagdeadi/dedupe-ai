# Panduan Deploy ke Cloudflare Pages

## Langkah 1: Persiapan Repository

### Opsi A: Upload langsung (tanpa Git)
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Login atau buat akun gratis
3. Pilih **Workers & Pages** dari sidebar
4. Klik **Create** > **Pages** > **Upload assets**
5. Drag & drop semua isi folder `out/` ke area upload
6. Klik **Deploy site**

### Opsi B: Koneksi ke Git (Recommended)
1. Push project ke GitHub/GitLab
2. Di Cloudflare Dashboard, pilih **Workers & Pages**
3. Klik **Create** > **Pages** > **Connect to Git**
4. Pilih repository Anda

## Langkah 2: Konfigurasi Build (jika pakai Git)

| Setting | Value |
|---------|-------|
| **Framework preset** | Next.js (Static HTML Export) |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Node.js version** | 18 atau lebih baru |

## Langkah 3: Deploy

Klik **Save and Deploy**. Cloudflare akan:
1. Clone repository
2. Install dependencies
3. Run build command
4. Deploy folder `out/` ke CDN global

## Setelah Deploy

- URL gratis: `https://[nama-project].pages.dev`
- Custom domain: bisa ditambahkan di Settings > Custom domains
- SSL/HTTPS: Otomatis aktif

## Catatan Penting

> ⚠️ Aplikasi ini adalah **static site** - semua proses deduplikasi berjalan di browser pengguna. Tidak ada data yang dikirim ke server.

## Build Lokal untuk Testing

```bash
npm run build
# Output ada di folder: out/
```

Untuk preview lokal:
```bash
npx serve out
```
