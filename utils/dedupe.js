// Deduplication logic using Entity Linkage (Fuzzy Matching)
import { compareTwoStrings } from 'string-similarity';

/**
 * Combines selected column values into a single string for comparison.
 * @param {Object} row - A data row object.
 * @param {string[]} columns - Columns to use for comparison.
 * @returns {string} Combined string of column values.
 */
function getCompositeKey(row, columns) {
    return columns
        .map((col) => String(row[col] ?? '').toLowerCase().trim())
        .join(' | ');
}

/**
 * Finds potential duplicates using fuzzy string matching.
 * @param {Object[]} data - Array of row objects.
 * @param {string[]} columns - Columns to check for duplicates.
 * @param {number} threshold - Similarity threshold (0-1). Default 0.85.
 * @returns {{ groups: Object[][], uniqueRows: Object[] }}
 *   - groups: Arrays of rows that are duplicates of each other.
 *   - uniqueRows: Rows that are unique.
 */
export function findDuplicates(data, columns, threshold = 0.85) {
    if (!data || data.length === 0 || columns.length === 0) {
        return { groups: [], uniqueRows: data || [] };
    }

    const processed = data.map((row, index) => ({
        originalIndex: index,
        row,
        key: getCompositeKey(row, columns),
    }));

    const matched = new Set();
    const groups = [];

    for (let i = 0; i < processed.length; i++) {
        if (matched.has(i)) continue;

        const currentGroup = [processed[i]];
        matched.add(i);

        for (let j = i + 1; j < processed.length; j++) {
            if (matched.has(j)) continue;

            const similarity = compareTwoStrings(processed[i].key, processed[j].key);
            if (similarity >= threshold) {
                currentGroup.push({ ...processed[j], similarity });
                matched.add(j);
            }
        }

        if (currentGroup.length > 1) {
            groups.push(currentGroup);
        }
    }

    const uniqueRows = processed
        .filter((_, index) => !matched.has(index) || groups.some(g => g[0].originalIndex === index))
        .map((p) => p.row);

    // Return the first row of each group as the "keeper" for unique rows
    const keptFromGroups = groups.map(g => g[0].row);
    const trueUnique = data.filter((_, index) => !matched.has(index));

    return {
        groups,
        uniqueRows: [...trueUnique, ...keptFromGroups],
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
