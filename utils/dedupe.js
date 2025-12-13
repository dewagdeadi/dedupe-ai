// Deduplication logic using NLP preprocessing + Entity Linkage (Fuzzy Matching)
import { compareTwoStrings } from 'string-similarity';

/**
 * NLP Preprocessing utilities
 */

// Common Indonesian stopwords
const STOPWORDS_ID = new Set([
    'yang', 'di', 'dan', 'ke', 'dari', 'ini', 'itu', 'dengan', 'untuk', 'pada',
    'adalah', 'juga', 'tidak', 'akan', 'atau', 'ada', 'mereka', 'sudah', 'saya',
    'kita', 'kami', 'anda', 'dia', 'ia', 'nya', 'jl', 'no', 'rt', 'rw'
]);

// Common English stopwords  
const STOPWORDS_EN = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'st', 'rd', 'ave', 'blvd', 'dr', 'mr', 'mrs', 'ms'
]);

const ALL_STOPWORDS = new Set([...STOPWORDS_ID, ...STOPWORDS_EN]);

/**
 * Tokenize text into words
 */
function tokenize(text) {
    if (!text) return [];
    return String(text)
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')  // Remove punctuation
        .split(/\s+/)              // Split by whitespace
        .filter(word => word.length > 0);
}

/**
 * Remove stopwords from tokens
 */
function removeStopwords(tokens) {
    return tokens.filter(token => !ALL_STOPWORDS.has(token));
}

/**
 * Simple stemming for Indonesian - removes common suffixes
 */
function simpleStem(word) {
    // Remove common Indonesian suffixes
    const suffixes = ['kan', 'an', 'i', 'nya', 'lah', 'kah'];
    for (const suffix of suffixes) {
        if (word.length > suffix.length + 2 && word.endsWith(suffix)) {
            return word.slice(0, -suffix.length);
        }
    }
    return word;
}

/**
 * Normalize and preprocess text using NLP techniques
 */
function preprocessText(text) {
    if (!text) return '';

    // Tokenize
    let tokens = tokenize(text);

    // Remove stopwords
    tokens = removeStopwords(tokens);

    // Apply simple stemming
    tokens = tokens.map(simpleStem);

    // Remove duplicates and sort for consistent comparison
    tokens = [...new Set(tokens)].sort();

    return tokens.join(' ');
}

/**
 * Combines selected column values into a preprocessed string for comparison.
 * @param {Object} row - A data row object.
 * @param {string[]} columns - Columns to use for comparison.
 * @param {boolean} useNLP - Whether to apply NLP preprocessing.
 * @returns {string} Combined and preprocessed string of column values.
 */
function getCompositeKey(row, columns, useNLP = true) {
    const rawText = columns
        .map((col) => String(row[col] ?? ''))
        .join(' ');

    if (useNLP) {
        return preprocessText(rawText);
    }

    return rawText.toLowerCase().trim();
}

/**
 * Calculate similarity score between two texts using multiple methods
 */
function calculateSimilarity(text1, text2) {
    // Use Dice/Sørensen coefficient from string-similarity
    const diceScore = compareTwoStrings(text1, text2);

    // Also calculate Jaccard similarity for tokens
    const tokens1 = new Set(text1.split(' '));
    const tokens2 = new Set(text2.split(' '));

    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    const jaccardScore = union.size > 0 ? intersection.size / union.size : 0;

    // Return weighted average (favor Dice for short texts, Jaccard for longer)
    return (diceScore * 0.6) + (jaccardScore * 0.4);
}

/**
 * Finds potential duplicates using NLP preprocessing and fuzzy string matching.
 * @param {Object[]} data - Array of row objects.
 * @param {string[]} columns - Columns to check for duplicates.
 * @param {number} threshold - Similarity threshold (0-1). Default 0.85.
 * @param {boolean} useNLP - Whether to use NLP preprocessing. Default true.
 * @returns {{ groups: Object[][], uniqueRows: Object[], stats: Object }}
 */
export function findDuplicates(data, columns, threshold = 0.85, useNLP = true) {
    if (!data || data.length === 0 || columns.length === 0) {
        return { groups: [], uniqueRows: data || [], stats: { processed: 0, comparisons: 0 } };
    }

    const processed = data.map((row, index) => ({
        originalIndex: index,
        row,
        key: getCompositeKey(row, columns, useNLP),
    }));

    const matched = new Set();
    const groups = [];
    let comparisons = 0;

    for (let i = 0; i < processed.length; i++) {
        if (matched.has(i)) continue;

        const currentGroup = [processed[i]];
        matched.add(i);

        for (let j = i + 1; j < processed.length; j++) {
            if (matched.has(j)) continue;

            comparisons++;
            const similarity = calculateSimilarity(processed[i].key, processed[j].key);

            if (similarity >= threshold) {
                currentGroup.push({ ...processed[j], similarity });
                matched.add(j);
            }
        }

        if (currentGroup.length > 1) {
            groups.push(currentGroup);
        }
    }

    // Calculate unique rows - those not in any group, plus the first item from each group
    const keptFromGroups = groups.map(g => g[0].row);
    const trueUnique = data.filter((_, index) => !matched.has(index));

    return {
        groups,
        uniqueRows: [...trueUnique, ...keptFromGroups],
        stats: {
            processed: processed.length,
            comparisons,
            duplicateGroups: groups.length,
            totalDuplicates: groups.reduce((acc, g) => acc + g.length - 1, 0)
        }
    };
}

/**
 * Returns rows that should be kept after deduplication.
 * Keeps the first row of each duplicate group.
 * @param {Object[]} data - Original data.
 * @param {Object[][]} groups - Duplicate groups from findDuplicates.
 * @returns {Object[]} Deduplicated data.
 */
export function getDeduplicatedData(data, groups) {
    const indicesToRemove = new Set();

    groups.forEach((group) => {
        // Skip the first item (keep it), remove the rest
        for (let i = 1; i < group.length; i++) {
            indicesToRemove.add(group[i].originalIndex);
        }
    });

    return data.filter((_, index) => !indicesToRemove.has(index));
}

/**
 * Returns rows that should be kept after deduplication with user selection support.
 * @param {Object[]} data - Original data.
 * @param {Object[][]} groups - Duplicate groups from findDuplicates.
 * @param {Object} keeperIndices - Map of groupIndex to rowIndexInGroup to keep.
 * @returns {Object[]} Deduplicated data.
 */
export function getDeduplicatedDataWithSelection(data, groups, keeperIndices = {}) {
    const indicesToRemove = new Set();

    groups.forEach((group, groupIndex) => {
        // Get the keeper index for this group (default to 0 = first item)
        const keeperIndex = keeperIndices[groupIndex] ?? 0;

        // Remove all items except the keeper
        group.forEach((item, rowIndex) => {
            if (rowIndex !== keeperIndex) {
                indicesToRemove.add(item.originalIndex);
            }
        });
    });

    return data.filter((_, index) => !indicesToRemove.has(index));
}
