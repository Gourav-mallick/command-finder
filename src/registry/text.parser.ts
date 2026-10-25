export function parseCommandText(text: string): string[] {
  return text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('#'));
}
