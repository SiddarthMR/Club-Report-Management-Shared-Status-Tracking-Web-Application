export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    const date = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const time = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${date} at ${time}`;
  } catch {
    return isoString;
  }
}

export function getDayOfWeekName(dateString: string): string {
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      // Create local date
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    }
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' });
  } catch {
    return '';
  }
}

/**
 * Normal Active Schedule Rules:
 * CBSE: Saturday
 * IGCSE / CIE: Tuesday & Wednesday
 */
export function isNormalScheduledDay(curriculum: string, dateString: string): boolean {
  const day = getDayOfWeekName(dateString);
  if (curriculum === 'CBSE') {
    return day === 'Saturday';
  }
  if (curriculum === 'IGCSE / CIE') {
    return day === 'Tuesday' || day === 'Wednesday';
  }
  return false;
}

export function getCurriculumScheduleDescription(curriculum: string): string {
  if (curriculum === 'CBSE') return 'Saturday';
  if (curriculum === 'IGCSE / CIE') return 'Tuesday & Wednesday';
  return 'Scheduled Days';
}
