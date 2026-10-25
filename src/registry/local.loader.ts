import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { CommandFileSchema } from '../domain/command.schema.js';
import type { CommandEntry, SupportedPlatform } from '../domain/command.model.js';
import { parseCommandText } from './text.parser.js';
export async function loadLocal(directory: string): Promise<{ commands: CommandEntry[]; errors: string[] }> {
  const commands: CommandEntry[] = []; const errors: string[] = [];
  let files: string[];
  try { files = await readdir(directory); } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { commands, errors };
    return { commands, errors: [`${directory}: ${(error as Error).message}`] };
  }
  for (const name of files.filter(file => /\.(json|txt)$/i.test(file)).sort()) {
    const file = path.join(directory, name);
    try {
      const content = await readFile(file, 'utf8');
      if (Buffer.byteLength(content) > 1024 * 1024) throw new Error('file exceeds 1 MiB');
      if (name.toLowerCase().endsWith('.json')) {
        const result = CommandFileSchema.parse(JSON.parse(content));
        commands.push(...result.commands.map(item => ({ ...item, source: 'local' as const })));
      } else {
        commands.push(...parseCommandText(content).map((command, index) => ({ id: `local-${name}-${index + 1}`, name: command, command, description: 'Imported from text file', category: 'Local', tags: [], examples: [], platforms: ['all'] as SupportedPlatform[], risk: 'medium' as const, source: 'local' as const })));
      }
    } catch (error) { errors.push(`${name}: ${(error as Error).message}`); }
  }
  const seen = new Set<string>();
  return { commands: commands.filter(item => { if (seen.has(item.id)) { errors.push(`Duplicate local command id: ${item.id}`); return false; } seen.add(item.id); return true; }), errors };
}
