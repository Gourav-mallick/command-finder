import type { CommandEntry, SupportedPlatform } from '../domain/command.model.js';
import { RANKING } from './ranking.js';
function score(entry: CommandEntry, query: string): number {
  const q = query.trim().toLowerCase(); if (!q) return 1;
  const command = entry.command.toLowerCase(); const name = entry.name.toLowerCase();
  if (command === q) return RANKING.exactCommand;
  if (name === q) return RANKING.exactName;
  if (command.startsWith(q) || name.startsWith(q)) return RANKING.prefix;
  const terms = q.split(/\s+/); let points = 0;
  for (const term of terms) {
    if (entry.tags.some(tag => tag.toLowerCase().includes(term))) points += RANKING.tag;
    else if (entry.category.toLowerCase().includes(term)) points += RANKING.category;
    else if (`${name} ${command}`.includes(term)) points += RANKING.prefix;
    else if (entry.description.toLowerCase().includes(term)) points += RANKING.description;
    else return 0;
  }
  return points;
}
export function searchCommands(entries: CommandEntry[], query: string, platform?: SupportedPlatform): CommandEntry[] {
  return entries.map((entry, index) => ({ entry, index, score: score(entry, query) }))
    .filter(item => item.score > 0 && (!platform || item.entry.platforms.includes('all') || item.entry.platforms.includes(platform)))
    .sort((a, b) => b.score - a.score || a.index - b.index).map(item => item.entry);
}
