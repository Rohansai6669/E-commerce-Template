export function truncate(text: string, length: number, suffix = '...'): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
}

export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
