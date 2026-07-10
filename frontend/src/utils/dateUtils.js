/**
 * Safe local date parser for iOS Safari compatibility.
 * Avoids Safari's inconsistent date-only parsing behavior.
 */
export function parseLocalDate(dateString) {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split("-");
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
}

/**
 * Converts 24-hour LocalTime string (HH:mm or HH:mm:ss) into 12-hour format (e.g. 2:30 PM).
 */
export function formatTime12Hour(timeString) {
  if (!timeString) return '';
  const parts = timeString.split(':');
  if (parts.length < 2) return timeString;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeString;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
}
