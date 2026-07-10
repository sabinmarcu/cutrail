const dayMonthYearFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const relativeDayFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
  style: 'long',
});
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const toLocalDayStartMilliseconds = (date: Date): number => {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return dayStart.getTime();
};

const formatDayMonthYear = (milliseconds: number): string => {
  const date = new Date(milliseconds);

  if (!Number.isFinite(date.getTime())) {
    return 'Invalid Date';
  }

  const parts = dayMonthYearFormatter.formatToParts(date);
  const day = parts.find((part) => part.type === 'day')?.value ?? '00';
  const month = parts.find((part) => part.type === 'month')?.value ?? '00';
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';

  return `${day}-${month}-${year}`;
};

const formatRelativeDayFromNow = (milliseconds: number): string => {
  const targetDate = new Date(milliseconds);

  if (!Number.isFinite(targetDate.getTime())) {
    return 'unknown';
  }

  const now = new Date();
  const todayStart = toLocalDayStartMilliseconds(now);
  const targetStart = toLocalDayStartMilliseconds(targetDate);
  const dayDifference = Math.round((targetStart - todayStart) / DAY_IN_MS);

  return relativeDayFormatter.format(dayDifference, 'day');
};

export {
  formatDayMonthYear,
  formatRelativeDayFromNow,
};
