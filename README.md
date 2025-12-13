# Deduplikasi.id

> **Aplikasi Web Gratis untuk Menghapus Data Duplikat di Excel/CSV dengan Teknologi NLP & Entity Linkage**

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?logo=next.js)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🚀 Demo

**Live Demo**: [https://deduplikasi.id](https://deduplikasi.id) *(atau URL Cloudflare Pages Anda)*

---

## 📖 Tentang Sistem

**Deduplikasi.id** adalah aplikasi web berbasis browser untuk mendeteksi dan menghapus data duplikat pada file Excel (.xlsx) dan CSV. Berbeda dengan tools deduplikasi konvensional yang hanya mencari kecocokan **exact match**, sistem ini menggunakan algoritma **Natural Language Processing (NLP)** dan **Entity Linkage** untuk mendeteksi duplikat yang **mirip tapi tidak identik**.

### Masalah yang Diselesaikan

Data duplikat sering kali tidak persis sama karena:
- **Typo**: "Budi Santoso" vs "Budi Santoso"
- **Format berbeda**: "081234567890" vs "0812-3456-7890" vs "+62 812 3456 7890"
- **Singkatan**: "Jl. Sudirman No. 123" vs "Jl Sudirman 123"
- **Variasi penulisan**: "PT Maju Jaya" vs "PT. Maju Jaya"
- **Spasi ekstra**: "Ahmad  Hidayat" vs "Ahmad Hidayat"

Tools tradisional akan melewatkan duplikat-duplikat ini. **Deduplikasi.id** dapat mendeteksinya.

---

## 🧠 Cara Kerja Algoritma

### 1. NLP Preprocessing

Sebelum membandingkan data, sistem melakukan preprocessing:

```
Input: "Jl. Sudirman No. 123, Jakarta Selatan"
         ↓
Tokenisasi: ["jl", "sudirman", "no", "123", "jakarta", "selatan"]
         ↓
Stopword Removal: ["sudirman", "123", "jakarta", "selatan"]
         ↓
Stemming: ["sudirman", "123", "jakarta", "selatan"]
         ↓
Output: "123 jakarta selatan sudirman"
```

**Stopwords** yang dihapus meliputi:
- Indonesia: "yang", "di", "dan", "ke", "jl", "no", "rt", "rw", dll.
- English: "the", "a", "an", "and", "st", "rd", "ave", dll.

### 2. Similarity Scoring

Sistem menggunakan kombinasi dua algoritma:

| Algoritma | Bobot | Kegunaan |
|-----------|-------|----------|
| **Dice Coefficient** | 60% | Cocok untuk teks pendek, membandingkan bigram |
| **Jaccard Similarity** | 40% | Cocok untuk set token, mengukur overlap |

**Formula**:
```
Similarity = (Dice × 0.6) + (Jaccard × 0.4)
```

### 3. Entity Linkage (Clustering)

Setelah scoring, sistem mengelompokkan data yang mirip:

```
Grup 1:
├── "Budi Santoso" (similarity: 100%) ← Dipertahankan
├── "Budi  Santoso" (similarity: 95%)
└── "Budi Santoso " (similarity: 92%)

Grup 2:
├── "Ahmad Hidayat" (similarity: 100%) ← Dipertahankan
└── "Ahmad Hidayat" (similarity: 88%)
```

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **🧠 Mode NLP** | Toggle on/off preprocessing NLP (tokenisasi, stopword removal, stemming) |
| **🎚️ Threshold Adjustable** | Atur sensitivitas deteksi (50%-100%) |
| **🔍 Search/Filter** | Cari dalam grup duplikat |
| **✅ Pilih Data** | Klik untuk memilih data mana yang dipertahankan |
| **📊 Pagination** | Navigasi halaman untuk dataset besar |
| **📥 Download** | Export hasil ke Excel (.xlsx) |
| **🔒 Privasi** | Semua proses di browser, data tidak dikirim ke server |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 16, React 19 |
| **Styling** | Vanilla CSS, CSS Modules |
| **NLP** | Custom preprocessing (tokenize, stopwords, stemming) |
| **Similarity** | string-similarity (Dice coefficient) |
| **Excel Processing** | SheetJS (xlsx) |
| **Icons** | Lucide React |
| **Deployment** | Cloudflare Pages (Static Export) |

---

## 📦 Instalasi Lokal

```bash
# Clone repository
git clone https://github.com/cikiprik/dedupe-ai.git
cd dedupe-ai

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🚀 Deployment ke Cloudflare Pages

1. Push ke GitHub
2. Buka [Cloudflare Pages](https://dash.cloudflare.com/)
3. **Create** → **Pages** → **Connect to Git**
4. Pilih repository, set:
   - **Build command**: `npm run build`
   - **Output directory**: `out`
5. **Deploy**

Lihat [DEPLOY.md](DEPLOY.md) untuk panduan lengkap.

---

## 📁 Struktur Project

```
deduplikasi/
├── components/
│   ├── DedupeInterface.js   # Komponen utama UI
│   └── UploadZone.js        # Drag & drop upload
├── utils/
│   └── dedupe.js            # Algoritma NLP + Entity Linkage
├── pages/
│   ├── index.js             # Halaman utama + SEO
│   └── _app.js              # App wrapper
├── styles/
│   ├── globals.css          # Global styles + CSS variables
│   └── DedupeInterface.module.css
├── public/
│   └── contoh-data.csv      # Sample data untuk testing
└── next.config.mjs          # Static export config
```

---

## 📊 Contoh Data Testing

File `public/contoh-data.csv` berisi 43 baris data dengan berbagai pola duplikat:

| Pola | Contoh |
|------|--------|
| Spasi ganda | "Budi Santoso" vs "Budi  Santoso" |
| Format telepon | "081234567890" vs "0812-3456-7890" |
| Email variasi | "budi.santoso@" vs "budisantoso@" |
| Alamat singkat | "Jl. Sudirman No. 123" vs "Jl Sudirman 123" |
| Nama perusahaan | "PT Maju Jaya" vs "PT. Maju Jaya" |

---

## 📝 Lisensi

MIT License - bebas digunakan untuk keperluan pribadi maupun komersial.

---

## 🤝 Kontribusi

Pull requests welcome! Untuk perubahan besar, silakan buka issue terlebih dahulu.

---

**Dibuat dengan ❤️ untuk kemudahan pengelolaan data di Indonesia**
