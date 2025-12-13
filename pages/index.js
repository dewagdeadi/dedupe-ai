import Head from 'next/head';
import DedupeInterface from '../components/DedupeInterface';

export default function Home() {
  const siteUrl = 'https://deduplikasi.id';
  const siteName = 'Deduplikasi.id';
  const siteDescription = 'Aplikasi web gratis untuk menghapus data duplikat di file Excel dan CSV. Menggunakan teknologi NLP dan Entity Linkage untuk mendeteksi duplikat yang mirip seperti typo, spasi ganda, format berbeda. 100% diproses di browser - privasi data terjamin.';
  const siteKeywords = 'hapus duplikat excel, deduplikasi data, remove duplicate excel, entity linkage, fuzzy matching, data cleansing, pembersihan data, excel online gratis, NLP, natural language processing, cari data duplikat, bersihkan data excel, tools excel gratis, dedupe excel, data cleaning indonesia';

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>{siteName} - Hapus Data Duplikat Excel dengan NLP & Entity Linkage | Gratis</title>
        <meta name="title" content={`${siteName} - Hapus Data Duplikat Excel dengan NLP & Entity Linkage | Gratis`} />
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content={siteKeywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content={siteName} />
        <meta name="language" content="Indonesian" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="theme-color" content="#0a0a0f" />

        {/* Canonical URL */}
        <link rel="canonical" href={siteUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:title" content={`${siteName} - Hapus Data Duplikat Excel dengan Cerdas`} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Deduplikasi.id - Aplikasi Hapus Data Duplikat Excel" />
        <meta property="og:locale" content="id_ID" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={`${siteName} - Hapus Data Duplikat Excel dengan Cerdas`} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
        <meta name="twitter:image:alt" content="Deduplikasi.id - Aplikasi Hapus Data Duplikat Excel" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

        {/* JSON-LD Structured Data - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": siteName,
              "url": siteUrl,
              "description": siteDescription,
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "browserRequirements": "Requires JavaScript",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "IDR"
              },
              "featureList": [
                "Hapus data duplikat Excel/CSV",
                "Deteksi fuzzy matching dengan NLP",
                "Entity Linkage algorithm",
                "100% diproses di browser",
                "Privasi data terjamin",
                "Gratis tanpa registrasi"
              ],
              "screenshot": `${siteUrl}/screenshot.png`,
              "softwareVersion": "1.0.0",
              "creator": {
                "@type": "Organization",
                "name": siteName,
                "url": siteUrl
              },
              "inLanguage": "id"
            })
          }}
        />

        {/* JSON-LD Structured Data - FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Apa itu Deduplikasi.id?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Deduplikasi.id adalah aplikasi web gratis untuk mendeteksi dan menghapus data duplikat pada file Excel dan CSV menggunakan teknologi NLP dan Entity Linkage."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Apakah data saya aman?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Ya, semua proses deduplikasi dilakukan 100% di browser Anda. Data tidak pernah dikirim ke server manapun."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Apa bedanya dengan tools deduplikasi lain?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Deduplikasi.id menggunakan algoritma NLP dan Entity Linkage yang dapat mendeteksi duplikat yang mirip tapi tidak identik, seperti typo, spasi ganda, atau format berbeda."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Apakah gratis?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Ya, 100% gratis tanpa biaya, tanpa batasan, dan tanpa perlu registrasi."
                  }
                }
              ]
            })
          }}
        />

        {/* JSON-LD Structured Data - HowTo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": "Cara Menghapus Data Duplikat di Excel",
              "description": "Panduan langkah demi langkah untuk menghapus data duplikat di file Excel menggunakan Deduplikasi.id",
              "step": [
                {
                  "@type": "HowToStep",
                  "name": "Upload File",
                  "text": "Drag & drop atau klik untuk memilih file Excel (.xlsx) atau CSV"
                },
                {
                  "@type": "HowToStep",
                  "name": "Pilih Kolom",
                  "text": "Tentukan kolom mana yang ingin dicek duplikatnya"
                },
                {
                  "@type": "HowToStep",
                  "name": "Atur Threshold",
                  "text": "Sesuaikan tingkat kemiripan (default 75%)"
                },
                {
                  "@type": "HowToStep",
                  "name": "Analisis",
                  "text": "Klik tombol Cari Duplikat untuk menemukan data yang mirip"
                },
                {
                  "@type": "HowToStep",
                  "name": "Pilih Data",
                  "text": "Klik pada data yang ingin dipertahankan di setiap grup duplikat"
                },
                {
                  "@type": "HowToStep",
                  "name": "Download",
                  "text": "Unduh file Excel yang sudah bersih dari duplikat"
                }
              ],
              "totalTime": "PT5M"
            })
          }}
        />

        {/* JSON-LD Structured Data - SoftwareApplication for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": siteName,
              "operatingSystem": "Web",
              "applicationCategory": "BusinessApplication",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "IDR"
              }
            })
          }}
        />
      </Head>

      <main role="main" aria-label="Deduplikasi Excel">
        <DedupeInterface />
      </main>
    </>
  );
}
