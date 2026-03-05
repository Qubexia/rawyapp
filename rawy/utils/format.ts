/**
 * Formatting utilities — duration, dates, numbers.
 */

/**
 * Format seconds into human-readable duration.
 * e.g. 3661 → "1h 1m", 125 → "2m 5s", 45 → "0m 45s"
 */
export function formatDuration(seconds: number | undefined | null): string {
  if (!seconds || seconds <= 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

/**
 * Format seconds into short duration (e.g., "12 min").
 */
export function formatDurationShort(seconds: number | undefined | null): string {
  if (!seconds || seconds <= 0) return 'Unknown';
  return `${Math.floor(seconds / 60)} min`;
}

/**
 * Format a date string into relative time (e.g., "2h ago", "3d ago").
 */
export function formatRelativeTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  return `${diffMonth}mo ago`;
}

/**
 * Format a number compactly (e.g., 1200 → "1.2K").
 */
export function formatCount(count: number | undefined | null): string {
  if (!count || count <= 0) return '0';
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}
