export interface DiffLine {
  type: "unchanged" | "added" | "removed" | "modified";
  lineNumber: number;
  content: string;
  originalLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffResult {
  lines: DiffLine[];
  stats: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
}

/**
 * Simple line-based diff algorithm
 */
export function createTextDiff(original: string, modified: string): DiffResult {
  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");

  const lines: DiffLine[] = [];
  const stats = { added: 0, removed: 0, modified: 0, unchanged: 0 };

  const maxLength = Math.max(originalLines.length, modifiedLines.length);

  for (let i = 0; i < maxLength; i++) {
    const originalLine = originalLines[i];
    const modifiedLine = modifiedLines[i];

    if (originalLine === undefined) {
      // Line was added
      lines.push({
        type: "added",
        lineNumber: i + 1,
        content: modifiedLine,
        newLineNumber: i + 1,
      });
      stats.added++;
    } else if (modifiedLine === undefined) {
      // Line was removed
      lines.push({
        type: "removed",
        lineNumber: i + 1,
        content: originalLine,
        originalLineNumber: i + 1,
      });
      stats.removed++;
    } else if (originalLine !== modifiedLine) {
      // Line was modified
      lines.push({
        type: "modified",
        lineNumber: i + 1,
        content: modifiedLine,
        originalLineNumber: i + 1,
        newLineNumber: i + 1,
      });
      stats.modified++;
    } else {
      // Line unchanged
      lines.push({
        type: "unchanged",
        lineNumber: i + 1,
        content: originalLine,
        originalLineNumber: i + 1,
        newLineNumber: i + 1,
      });
      stats.unchanged++;
    }
  }

  return { lines, stats };
}

/**
 * Get a summary of changes between two texts
 */
export function getDiffSummary(
  original: string,
  modified: string,
): {
  hasChanges: boolean;
  linesAdded: number;
  linesRemoved: number;
  linesModified: number;
  totalChanges: number;
} {
  const diff = createTextDiff(original, modified);

  return {
    hasChanges: diff.stats.added + diff.stats.removed + diff.stats.modified > 0,
    linesAdded: diff.stats.added,
    linesRemoved: diff.stats.removed,
    linesModified: diff.stats.modified,
    totalChanges: diff.stats.added + diff.stats.removed + diff.stats.modified,
  };
}

/**
 * Get only the changed lines (useful for showing key differences)
 */
export function getChangedLines(
  original: string,
  modified: string,
  maxLines = 10,
): DiffLine[] {
  const diff = createTextDiff(original, modified);

  return diff.lines
    .filter((line) => line.type !== "unchanged")
    .slice(0, maxLines);
}

/**
 * Simple three-way merge attempt
 * This is a basic implementation - for production use, consider a proper merge algorithm
 */
export function attemptThreeWayMerge(
  base: string,
  yours: string,
  theirs: string,
): {
  success: boolean;
  result?: string;
  conflicts?: Array<{
    lineNumber: number;
    baseContent: string;
    yoursContent: string;
    theirsContent: string;
  }>;
} {
  const baseLines = base.split("\n");
  const yourLines = yours.split("\n");
  const theirLines = theirs.split("\n");

  const maxLength = Math.max(
    baseLines.length,
    yourLines.length,
    theirLines.length,
  );
  const mergedLines: string[] = [];
  const conflicts: Array<{
    lineNumber: number;
    baseContent: string;
    yoursContent: string;
    theirsContent: string;
  }> = [];

  for (let i = 0; i < maxLength; i++) {
    const baseLine = baseLines[i] || "";
    const yourLine = yourLines[i] || "";
    const theirLine = theirLines[i] || "";

    if (baseLine === yourLine && baseLine === theirLine) {
      // No changes
      mergedLines.push(baseLine);
    } else if (baseLine === yourLine && baseLine !== theirLine) {
      // Only they changed it
      mergedLines.push(theirLine);
    } else if (baseLine === theirLine && baseLine !== yourLine) {
      // Only you changed it
      mergedLines.push(yourLine);
    } else if (yourLine === theirLine) {
      // Both made the same change
      mergedLines.push(yourLine);
    } else {
      // Conflict - both changed differently
      conflicts.push({
        lineNumber: i + 1,
        baseContent: baseLine,
        yoursContent: yourLine,
        theirsContent: theirLine,
      });

      // For now, add a conflict marker
      mergedLines.push(`<<<<<<< YOUR VERSION`);
      mergedLines.push(yourLine);
      mergedLines.push(`=======`);
      mergedLines.push(theirLine);
      mergedLines.push(`>>>>>>> THEIR VERSION`);
    }
  }

  return {
    success: conflicts.length === 0,
    result: conflicts.length === 0 ? mergedLines.join("\n") : undefined,
    conflicts: conflicts.length > 0 ? conflicts : undefined,
  };
}

/**
 * Format a diff for display in a code editor or terminal
 */
export function formatDiffForDisplay(
  diff: DiffResult,
  contextLines = 3,
): string {
  const formatted: string[] = [];

  for (let i = 0; i < diff.lines.length; i++) {
    const line = diff.lines[i];
    const prefix =
      line.type === "added"
        ? "+"
        : line.type === "removed"
          ? "-"
          : line.type === "modified"
            ? "~"
            : " ";

    formatted.push(`${prefix} ${line.content}`);
  }

  return formatted.join("\n");
}

/**
 * Check if two texts are similar enough for automatic merging
 */
export function canAutoMerge(
  original: string,
  modified: string,
  threshold = 0.8,
): boolean {
  const originalLines = original.split("\n").filter((line) => line.trim());
  const modifiedLines = modified.split("\n").filter((line) => line.trim());

  if (originalLines.length === 0 && modifiedLines.length === 0) {
    return true;
  }

  const totalLines = Math.max(originalLines.length, modifiedLines.length);
  const unchangedLines = originalLines.filter(
    (line, index) => modifiedLines[index] === line,
  ).length;

  const similarity = unchangedLines / totalLines;
  return similarity >= threshold;
}
