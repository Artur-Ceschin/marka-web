/**
 * Conversions between API timestamps and `<input type="datetime-local">`.
 *
 * The input speaks wall-clock time with no zone ("2026-09-13T16:20"); the API
 * wants ISO 8601 with an offset. The offset is taken for that specific date,
 * not today, so a date on the other side of a daylight saving change still
 * lands on the hour the person typed.
 */

const pad = (value: number) => String(value).padStart(2, '0');

/** An ISO timestamp as the local wall-clock value the input shows. */
export function toLocalInputValue(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** The input's value back as ISO 8601 with this device's offset for that date. */
export function fromLocalInputValue(value: string): string | null {
  if (!value) return null;
  // No zone in the string, so it is parsed as local time: the intent.
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const minutes = Math.abs(offset);
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  return `${withSeconds}${sign}${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export function isInFuture(value: string, now: number = Date.now()): boolean {
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time > now;
}
