export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/javascript:[^"']*/g, '');
}
