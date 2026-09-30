const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

export function formatDatum(value: string): string {
  return new Date(value).toLocaleDateString("de-DE", DATE_FORMAT_OPTIONS);
}

export function formatUhrzeit(value: string): string {
  return new Date(value).toLocaleTimeString("de-DE", TIME_FORMAT_OPTIONS);
}
