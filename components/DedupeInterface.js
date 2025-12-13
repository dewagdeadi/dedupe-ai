import React, { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Download, RefreshCw, X, FileDown, ChevronLeft, ChevronRight, Brain, Search, Check } from 'lucide-react';
import UploadZone from './UploadZone';
import { findDuplicates, getDeduplicatedDataWithSelection } from '../utils/dedupe';
import styles from '../styles/DedupeInterface.module.css';

const ITEMS_PER_PAGE = 5;

export default function DedupeInterface() {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [threshold, setThreshold] = useState(0.85);
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);
    const [useNLP, setUseNLP] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [keeperIndices, setKeeperIndices] = useState({}); // { groupIndex: rowIndexInGroup }

    const handleFileSelect = useCallback((selectedFile) => {
        setFile(selectedFile);
        setHasAnalyzed(false);
        setDuplicateGroups([]);
        setCurrentPage(1);
        setStats(null);
        setSearchQuery('');
        setKeeperIndices({});

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
                    setSelectedColumns(cols);
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
        setCurrentPage(1);
        setSearchQuery('');
        setKeeperIndices({});

        setTimeout(() => {
            const result = findDuplicates(data, selectedColumns, threshold, useNLP);
            setDuplicateGroups(result.groups);
            setStats(result.stats);
            setHasAnalyzed(true);
            setIsProcessing(false);
        }, 50);
    };

    const handleSelectKeeper = (groupIndex, rowIndexInGroup) => {
        setKeeperIndices(prev => ({
            ...prev,
            [groupIndex]: rowIndexInGroup
        }));
    };

    const handleDownload = () => {
        const deduplicatedData = getDeduplicatedDataWithSelection(data, duplicateGroups, keeperIndices);
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
        setCurrentPage(1);
        setStats(null);
        setSearchQuery('');
        setKeeperIndices({});
    };

    // Filter groups by search query
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return duplicateGroups;

        const query = searchQuery.toLowerCase();
        return duplicateGroups.filter((group, groupIndex) => {
            // Search in all rows of the group
            return group.some(item => {
                return selectedColumns.some(col => {
                    const value = String(item.row[col] ?? '').toLowerCase();
                    return value.includes(query);
                });
            });
        });
    }, [duplicateGroups, searchQuery, selectedColumns]);

    // Pagination logic on filtered results
    const totalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
    const paginatedGroups = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredGroups.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredGroups, currentPage]);

    // Get original group index for a filtered group
    const getOriginalGroupIndex = useCallback((filteredIndex) => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const actualFilteredIndex = startIndex + filteredIndex;
        const filteredGroup = filteredGroups[actualFilteredIndex];
        return duplicateGroups.indexOf(filteredGroup);
    }, [filteredGroups, duplicateGroups, currentPage]);

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const totalDuplicates = duplicateGroups.reduce((acc, group) => acc + group.length - 1, 0);
    const customizedCount = Object.keys(keeperIndices).length;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Deduplikasi.id</h1>
                <p className={styles.subtitle}>
                    Hapus Data Duplikat Excel dengan Teknologi NLP & Entity Linkage
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

                    <section className={styles.infoSection}>
                        <h2 className={styles.infoTitle}>Apa itu Deduplikasi.id?</h2>
                        <p className={styles.infoText}>
                            Deduplikasi.id adalah aplikasi web gratis untuk menghapus data duplikat di file Excel dan CSV.
                            Berbeda dengan tools lain, Deduplikasi.id menggunakan algoritma <strong>NLP (Natural Language Processing)</strong> dan <strong>Entity Linkage</strong> yang
                            dapat mendeteksi duplikat yang tidak persis sama — seperti typo, spasi ganda, atau perbedaan format.
                        </p>

                        <h3 className={styles.infoSubtitle}>Keunggulan Deduplikasi.id:</h3>
                        <ul className={styles.featureList}>
                            <li>✅ <strong>Gratis 100%</strong> — Tanpa biaya, tanpa batasan</li>
                            <li>✅ <strong>Privasi Terjamin</strong> — Data diproses di browser, tidak dikirim ke server</li>
                            <li>✅ <strong>NLP Cerdas</strong> — Tokenisasi, stopword removal, stemming otomatis</li>
                            <li>✅ <strong>Pilih Data</strong> — Tentukan sendiri data mana yang dipertahankan</li>
                            <li>✅ <strong>Cari & Filter</strong> — Cari duplikat dengan mudah</li>
                        </ul>

                        <h3 className={styles.infoSubtitle}>Cara Menggunakan:</h3>
                        <ol className={styles.stepsList}>
                            <li><strong>Upload File</strong> — Drag & drop atau klik untuk pilih file Excel/CSV</li>
                            <li><strong>Pilih Kolom</strong> — Tentukan kolom mana yang ingin dicek duplikatnya</li>
                            <li><strong>Analisis</strong> — Klik tombol untuk menemukan duplikat</li>
                            <li><strong>Pilih Data</strong> — Klik data yang ingin dipertahankan di setiap grup</li>
                            <li><strong>Download</strong> — Unduh file yang sudah bersih dari duplikat</li>
                        </ol>
                    </section>
                </>
            )}

            {file && !isProcessing && !hasAnalyzed && (
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

                    {/* NLP Toggle */}
                    <div className={styles.nlpToggle}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={useNLP}
                                onChange={(e) => setUseNLP(e.target.checked)}
                                className={styles.toggleInput}
                            />
                            <span className={`${styles.toggleSwitch} ${useNLP ? styles.toggleActive : ''}`}>
                                <Brain size={16} />
                            </span>
                            <span className={styles.toggleText}>
                                Mode NLP {useNLP ? '(Aktif)' : '(Nonaktif)'}
                            </span>
                        </label>
                        <span className={styles.toggleHint}>
                            {useNLP
                                ? 'Tokenisasi, stopword removal, dan stemming aktif'
                                : 'Hanya perbandingan teks sederhana'}
                        </span>
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
                        <span className={styles.loadingText}>
                            {useNLP ? 'Memproses dengan NLP...' : 'Menganalisis'} {data.length} baris data...
                        </span>
                    </div>
                </div>
            )}

            {hasAnalyzed && !isProcessing && (
                <div className={`glass-panel ${styles.resultsPanel}`}>
                    {/* Header with file info */}
                    <div className={styles.resultsHeader}>
                        <div className={styles.fileInfo}>
                            <FileSpreadsheet size={18} />
                            <span>{file.name}</span>
                        </div>
                        <button
                            onClick={handleReset}
                            className="btn-secondary"
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            <X size={16} style={{ marginRight: '0.5rem' }} />
                            Upload File Baru
                        </button>
                    </div>

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

                    {stats && (
                        <div className={styles.statsInfo}>
                            <span>📊 {stats.comparisons.toLocaleString()} perbandingan</span>
                            <span>• Mode: {useNLP ? 'NLP' : 'Simple'}</span>
                            {customizedCount > 0 && (
                                <span className={styles.customizedBadge}>
                                    ✏️ {customizedCount} grup dikustomisasi
                                </span>
                            )}
                        </div>
                    )}

                    {duplicateGroups.length > 0 && (
                        <div className={styles.groupsSection}>
                            <div className={styles.groupsHeader}>
                                <h3 className={styles.groupsTitle}>
                                    Grup Duplikat ({filteredGroups.length}{searchQuery && ` dari ${duplicateGroups.length}`})
                                </h3>

                                {/* Search Box */}
                                <div className={styles.searchBox}>
                                    <Search size={18} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Cari duplikat..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className={styles.searchInput}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                                            className={styles.searchClear}
                                            aria-label="Hapus pencarian"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Selection hint */}
                            <div className={styles.selectionHint}>
                                💡 Klik pada baris untuk memilih data yang ingin dipertahankan
                            </div>

                            {/* Pagination Controls Top */}
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className={styles.pageButton}
                                        aria-label="Halaman sebelumnya"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className={styles.pageInfo}>
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={styles.pageButton}
                                        aria-label="Halaman berikutnya"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}

                            {paginatedGroups.length === 0 && searchQuery && (
                                <div className={styles.noSearchResults}>
                                    <p>Tidak ada duplikat yang cocok dengan "{searchQuery}"</p>
                                </div>
                            )}

                            {paginatedGroups.map((group, filteredIndex) => {
                                const originalIndex = getOriginalGroupIndex(filteredIndex);
                                const keeperIndex = keeperIndices[originalIndex] ?? 0;

                                return (
                                    <div key={originalIndex} className={styles.duplicateGroup}>
                                        <div className={styles.groupHeader}>
                                            <span>Grup {originalIndex + 1}</span>
                                            <span className={styles.groupBadge}>{group.length} data mirip</span>
                                        </div>
                                        <div className={styles.groupRows}>
                                            {group.map((item, rowIndex) => {
                                                const isKeeper = rowIndex === keeperIndex;
                                                return (
                                                    <div
                                                        key={rowIndex}
                                                        className={`${styles.groupRow} ${isKeeper ? styles.keeper : ''} ${styles.selectable}`}
                                                        onClick={() => handleSelectKeeper(originalIndex, rowIndex)}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                handleSelectKeeper(originalIndex, rowIndex);
                                                            }
                                                        }}
                                                    >
                                                        <div className={styles.rowSelector}>
                                                            <span className={`${styles.selectorCircle} ${isKeeper ? styles.selectorActive : ''}`}>
                                                                {isKeeper && <Check size={14} />}
                                                            </span>
                                                        </div>
                                                        <div className={styles.rowContent}>
                                                            {selectedColumns.slice(0, 4).map((col) => (
                                                                <div key={col} className={styles.rowField}>
                                                                    <span className={styles.fieldName}>{col}:</span>
                                                                    <span>{String(item.row[col] ?? '')}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className={styles.rowBadges}>
                                                            {item.similarity && (
                                                                <span className={styles.similarityBadge}>
                                                                    {Math.round(item.similarity * 100)}% mirip
                                                                </span>
                                                            )}
                                                            {isKeeper && (
                                                                <span className={styles.keeperBadge}>
                                                                    Dipertahankan
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Bottom Pagination */}
                            {totalPages > 1 && (
                                <div className={styles.paginationBottom}>
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className={styles.pageButton}
                                    >
                                        <ChevronLeft size={18} /> Sebelumnya
                                    </button>
                                    <span className={styles.pageInfo}>
                                        Halaman {currentPage} dari {totalPages}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={styles.pageButton}
                                    >
                                        Berikutnya <ChevronRight size={18} />
                                    </button>
                                </div>
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

            <footer className={styles.footer}>
                <p>© 2025 Deduplikasi.id — Dibuat dengan ❤️ untuk kemudahan pengelolaan data Anda</p>
            </footer>
        </div>
    );
}
