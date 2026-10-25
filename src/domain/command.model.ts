export type CommandRisk = 'low' | 'medium' | 'high';
export type SupportedPlatform = 'linux' | 'windows' | 'macos' | 'all';
export interface CommandEntry {
  id: string; name: string; command: string; description: string; category: string;
  tags: string[]; examples: string[]; platforms: SupportedPlatform[];
  risk: CommandRisk; source: 'builtin' | 'local';
}
