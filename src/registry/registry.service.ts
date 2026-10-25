import type { CommandEntry, SupportedPlatform } from '../domain/command.model.js';
import { configDir } from '../config/paths.js';
import { loadBuiltin } from './builtin.loader.js';
import { loadLocal } from './local.loader.js';
export interface CommandRegistry { load(): Promise<CommandEntry[]>; reload(): Promise<CommandEntry[]>; getById(id: string): Promise<CommandEntry | undefined>; }
export class RegistryService implements CommandRegistry {
  private entries: CommandEntry[] = [];
  constructor(private readonly localDir = configDir()) {}
  async load(): Promise<CommandEntry[]> {
    const builtin = await loadBuiltin(); const local = await loadLocal(this.localDir);
    for (const error of local.errors) process.stderr.write(`cmdx: ${error}\n`);
    const ids = new Set(builtin.map(item => item.id));
    this.entries = [...builtin, ...local.commands.filter(item => { if (ids.has(item.id)) { process.stderr.write(`cmdx: duplicate ID ignored: ${item.id}\n`); return false; } ids.add(item.id); return true; })];
    return this.entries;
  }
  async reload(): Promise<CommandEntry[]> { this.entries = []; return this.load(); }
  async getById(id: string): Promise<CommandEntry | undefined> { if (!this.entries.length) await this.load(); return this.entries.find(item => item.id === id); }
}
export function currentPlatform(): SupportedPlatform {
  if (process.platform === 'win32') return 'windows'; if (process.platform === 'darwin') return 'macos'; return 'linux';
}
