/**
 * Utility functions for local-timezone date handling.
 * Avoids UTC mismatch issues where new Date().toISOString() returns yesterday's date
 * in timezones ahead of UTC.
 */

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const cleanStr = dateStr.split('T')[0];
  const parts = cleanStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date();
}

export function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

export function getRelativeDayString(offsetDays: number): string {
  const d = addDaysToDate(new Date(), offsetDays);
  return getLocalDateString(d);
}

export function formatDayDisplay(dateStr: string): { label: string; fullDate: string; weekday: string; longWeekday: string } {
  const todayStr = getLocalDateString();
  const dateObj = parseLocalDate(dateStr);
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const longWeekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  let label = `${longWeekday}, ${fullDate}`;
  if (dateStr === todayStr) {
    label = `Today · ${longWeekday}, ${fullDate}`;
  }

  return { label, fullDate, weekday, longWeekday };
}
