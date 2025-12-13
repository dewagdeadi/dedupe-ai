import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Download, RefreshCw, X, FileDown } from 'lucide-react';
import UploadZone from './UploadZone';
import { findDuplicates, getDeduplicatedData } from '../utils/dedupe';
import styles from '../styles/DedupeInterface.module.css';

export default function DedupeInterface() {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [threshold, setThreshold] = useState(0.85);
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    const handleFileSelect = useCallback((selectedFile) => {
        setFile(selectedFile);
        setHasAnalyzed(false);
        setDuplicateGroups([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const binaryStr = e.target.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length > 0) {
                    const cols = Object.keys(jsonData[0]);
                    setHeaders(cols);
                    setData(jsonData);
                    setSelectedColumns(cols); // Select all by default
                }
            } catch (error) {
                console.error('Error parsing file:', error);
                alert('Gagal membaca file. Pastikan file adalah Excel atau CSV yang valid.');
            }
        };
        reader.readAsBinaryString(selectedFile);
    }, []);

    const handleColumnToggle = (column) => {
        setSelectedColumns((prev) =>
            prev.includes(column)
                ? prev.filter((c) => c !== column)
                : [...prev, column]
        );
    };

    const handleAnalyze = () => {
        if (selectedColumns.length === 0) {
            alert('Pilih minimal satu kolom untuk dicek duplikatnya.');
            return;
        }

        setIsProcessing(true);

        // Use setTimeout to allow UI to update before heavy computation
        setTimeout(() => {
            const result = findDuplicates(data, selectedColumns, threshold);
            setDuplicateGroups(result.groups);
            setHasAnalyzed(true);
            setIsProcessing(false);
        }, 50);
    };

    const handleDownload = () => {
        const deduplicatedData = getDeduplicatedData(data, duplicateGroups);
        const worksheet = XLSX.utils.json_to_sheet(deduplicatedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Bersih');

        const originalName = file?.name?.replace(/\.[^/.]+$/, '') || 'data';
        XLSX.writeFile(workbook, `${originalName}_tanpa_duplikat.xlsx`);
    };

    const handleReset = () => {
        setFile(null);
        setData([]);
        setHeaders([]);
        setSelectedColumns([]);
        setDuplicateGroups([]);
        setHasAnalyzed(false);
    };

    const totalDuplicates = duplicateGroups.reduce((acc, group) => acc + group.length - 1, 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Deduplikasi.id</h1>
                <p className={styles.subtitle}>
                    Hapus Data Duplikat Excel dengan Teknologi Entity Linkage
                </p>
            </header>

            {!file && (
                <>
                    <UploadZone onFileSelect={handleFileSelect} />
                    <div className={styles.sampleSection}>
                        <p className={styles.sampleText}>Belum punya file untuk dicoba?</p>
                        <a href="/contoh-data.csv" download className={styles.sampleLink}>
                            <FileDown size={18} />
                            Download Contoh Data (CSV)
                        </a>
                    </div>

                    {/* SEO Content Section */}
                    <section className={styles.infoSection}>
                        <h2 className={styles.infoTitle}>Apa itu Deduplikasi.id?</h2>
                        <p className={styles.infoText}>
                            Deduplikasi.id adalah aplikasi web gratis untuk menghapus data duplikat di file Excel dan CSV.
                            Berbeda dengan tools lain, Deduplikasi.id menggunakan algoritma <strong>Entity Linkage</strong> yang
                            dapat mendeteksi duplikat yang tidak persis sama — seperti typo, spasi ganda, atau perbedaan format.
                        </p>

                        <h3 className={styles.infoSubtitle}>Keunggulan Deduplikasi.id:</h3>
                        <ul className={styles.featureList}>
                            <li>✅ <strong>Gratis 100%</strong> — Tanpa biaya, tanpa batasan</li>
                            <li>✅ <strong>Privasi Terjamin</strong> — Data diproses di browser, tidak dikirim ke server</li>
                            <li>✅ <strong>Deteksi Cerdas</strong> — Menemukan duplikat yang mirip, bukan hanya yang identik</li>
                            <li>✅ <strong>Mudah Digunakan</strong> — Cukup upload, pilih kolom, dan download hasilnya</li>
                        </ul>

                        <h3 className={styles.infoSubtitle}>Cara Menggunakan:</h3>
                        <ol className={styles.stepsList}>
                            <li><strong>Upload File</strong> — Drag & drop atau klik untuk pilih file Excel/CSV</li>
                            <li><strong>Pilih Kolom</strong> — Tentukan kolom mana yang ingin dicek duplikatnya</li>
                            <li><strong>Atur Sensitivitas</strong> — Sesuaikan threshold kesamaan (85% = standar)</li>
                            <li><strong>Analisis</strong> — Klik tombol untuk menemukan duplikat</li>
                            <li><strong>Download</strong> — Unduh file yang sudah bersih dari duplikat</li>
                        </ol>
                    </section>
                </>
            )}

            {file && !isProcessing && (
                <div className={`glass-panel ${styles.configPanel}`}>
                    <div className={styles.configHeader}>
                        <h2 className={styles.configTitle}>Konfigurasi</h2>
                        <div className={styles.fileInfo}>
                            <FileSpreadsheet size={18} />
                            <span>{file.name}</span>
                            <span>({data.length} baris)</span>
                            <button
                                onClick={handleReset}
                                className="btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', marginLeft: '0.5rem' }}
                                aria-label="Hapus file"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.thresholdControl}>
                        <span className={styles.thresholdLabel}>Tingkat Kesamaan:</span>
                        <input
                            type="range"
                            min="0.5"
                            max="1"
                            step="0.01"
                            value={threshold}
                            onChange={(e) => setThreshold(parseFloat(e.target.value))}
                            className={styles.thresholdSlider}
                            aria-label="Atur threshold kesamaan"
                        />
                        <span className={styles.thresholdValue}>{Math.round(threshold * 100)}%</span>
                    </div>

                    <div className={styles.columnSection}>
                        <span className={styles.columnLabel}>Pilih kolom untuk dicek duplikatnya:</span>
                        <div className={styles.columnGrid}>
                            {headers.map((header) => (
                                <label
                                    key={header}
                                    className={`${styles.columnChip} ${selectedColumns.includes(header) ? styles.selected : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns.includes(header)}
                                        onChange={() => handleColumnToggle(header)}
                                    />
                                    <span className={styles.checkIcon} />
                                    {header}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button onClick={handleAnalyze} className="btn-primary">
                            <RefreshCw size={18} style={{ marginRight: '0.5rem' }} />
                            Cari Duplikat
                        </button>
                    </div>
                </div>
            )}

            {isProcessing && (
                <div className={`glass-panel ${styles.configPanel}`}>
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <span className={styles.loadingText}>Menganalisis {data.length} baris data...</span>
                    </div>
                </div>
            )}

            {hasAnalyzed && !isProcessing && (
                <div className={`glass-panel ${styles.resultsPanel}`}>
                    <div className={styles.resultsSummary}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{data.length}</div>
                            <div className={styles.statLabel}>Total Baris</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statValue} ${styles.duplicates}`}>{totalDuplicates}</div>
                            <div className={styles.statLabel}>Duplikat Ditemukan</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statValue} ${styles.unique}`}>{data.length - totalDuplicates}</div>
                            <div className={styles.statLabel}>Baris Unik</div>
                        </div>
                    </div>

                    {duplicateGroups.length > 0 && (
                        <div className={styles.groupsSection}>
                            <h3 className={styles.groupsTitle}>
                                Grup Duplikat ({duplicateGroups.length})
                            </h3>
                            {duplicateGroups.slice(0, 10).map((group, groupIndex) => (
                                <div key={groupIndex} className={styles.duplicateGroup}>
                                    <div className={styles.groupHeader}>
                                        <span>Grup {groupIndex + 1}</span>
                                        <span className={styles.groupBadge}>{group.length} data mirip</span>
                                    </div>
                                    <div className={styles.groupRows}>
                                        {group.map((item, rowIndex) => (
                                            <div
                                                key={rowIndex}
                                                className={`${styles.groupRow} ${rowIndex === 0 ? styles.keeper : ''}`}
                                            >
                                                {selectedColumns.slice(0, 4).map((col) => (
                                                    <div key={col} className={styles.rowField}>
                                                        <span className={styles.fieldName}>{col}:</span>
                                                        <span>{String(item.row[col] ?? '')}</span>
                                                    </div>
                                                ))}
                                                {item.similarity && (
                                                    <span className={styles.similarityBadge}>
                                                        {Math.round(item.similarity * 100)}% mirip
                                                    </span>
                                                )}
                                                {rowIndex === 0 && (
                                                    <span className={styles.similarityBadge} style={{ background: 'var(--secondary)' }}>
                                                        Dipertahankan
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {duplicateGroups.length > 10 && (
                                <p style={{ color: 'var(--muted)', textAlign: 'center' }}>
                                    ...dan {duplicateGroups.length - 10} grup lainnya
                                </p>
                            )}
                        </div>
                    )}

                    {duplicateGroups.length === 0 && (
                        <div className={styles.noResults}>
                            <p>🎉 Tidak ada duplikat ditemukan dengan threshold {Math.round(threshold * 100)}%</p>
                            <p className={styles.noResultsHint}>Coba turunkan threshold untuk deteksi yang lebih sensitif.</p>
                        </div>
                    )}

                    <div className={styles.actions}>
                        <button onClick={handleAnalyze} className="btn-secondary">
                            <RefreshCw size={18} style={{ marginRight: '0.5rem' }} />
                            Analisis Ulang
                        </button>
                        <button onClick={handleDownload} className="btn-primary">
                            <Download size={18} style={{ marginRight: '0.5rem' }} />
                            Download File Bersih
                        </button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className={styles.footer}>
                <p>© 2025 Deduplikasi.id — Dibuat dengan ❤️ untuk kemudahan pengelolaan data Anda</p>
            </footer>
        </div>
    );
}
