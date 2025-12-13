import React, { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import styles from '../styles/UploadZone.module.css';

export default function UploadZone({ onFileSelect }) {
    const [isDragActive, setIsDragActive] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    }, [onFileSelect]);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div
            className={`${styles.zone} ${isDragActive ? styles.active : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
            role="button"
            tabIndex={0}
            aria-label="Area upload file Excel atau CSV"
        >
            <input
                id="fileInput"
                type="file"
                className={styles.hiddenInput}
                accept=".xlsx, .xls, .csv"
                onChange={handleChange}
                aria-label="Pilih file Excel atau CSV"
            />
            <UploadCloud className={styles.icon} size={64} />
            <div className={styles.text}>
                {isDragActive ? "Lepaskan file di sini..." : "Seret & Lepas File Excel"}
            </div>
            <div className={styles.subtext}>
                atau klik untuk memilih file (.xlsx, .csv)
            </div>
        </div>
    );
}
