import Head from 'next/head';
import DedupeInterface from '../components/DedupeInterface';

export default function Home() {
  return (
    <>
      <Head>
        <title>Deduplikasi.id - Hapus Data Duplikat Excel dengan Cerdas | Gratis</title>
        <meta
          name="description"
          content="Aplikasi gratis untuk menghapus data duplikat di file Excel dan CSV. Menggunakan teknologi AI Entity Linkage untuk mendeteksi duplikat yang mirip. Tanpa perlu upload ke server - privasi data terjamin."
        />
        <meta
          name="keywords"
          content="hapus duplikat excel, deduplikasi data, remove duplicate excel, entity linkage, fuzzy matching, data cleansing, pembersihan data, excel online gratis"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Deduplikasi.id" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Deduplikasi.id - Hapus Data Duplikat Excel dengan Cerdas" />
        <meta
          property="og:description"
          content="Aplikasi gratis untuk menghapus data duplikat di file Excel. Menggunakan teknologi AI untuk mendeteksi duplikat yang mirip."
        />
        <meta property="og:locale" content="id_ID" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Deduplikasi.id - Hapus Data Duplikat Excel dengan Cerdas" />
        <meta
          name="twitter:description"
          content="Aplikasi gratis untuk menghapus data duplikat di file Excel. Menggunakan teknologi AI."
        />

        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://dedupe.ai" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Deduplikasi.id",
              "description": "Aplikasi untuk menghapus data duplikat di file Excel menggunakan Entity Linkage",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "IDR"
              },
              "inLanguage": "id"
            })
          }}
        />
      </Head>
      <main>
        <DedupeInterface />
      </main>
    </>
  );
}
