import { describe, expect, it } from 'vitest';
import { searchCommands } from '../src/search/search.service.js';
import type { CommandEntry } from '../src/domain/command.model.js';
const entries: CommandEntry[] = [
  { id: 'a', name: 'Show branch', command: 'git branch', description: 'Current branch', category: 'Git', tags: ['branch'], examples: [], platforms: ['all'], risk: 'low', source: 'builtin' },
  { id: 'b', name: 'List files', command: 'ls', description: 'List files', category: 'Linux', tags: ['files'], examples: [], platforms: ['linux'], risk: 'low', source: 'builtin' }
];
describe('searchCommands', () => {
  it('ranks exact command matches first, case insensitively', () => expect(searchCommands(entries, 'GIT BRANCH')[0]?.id).toBe('a'));
  it('matches tags and categories', () => { expect(searchCommands(entries, 'branch')).toHaveLength(1); expect(searchCommands(entries, 'linux')[0]?.id).toBe('b'); });
  it('filters by platform', () => expect(searchCommands(entries, '', 'windows').map(item => item.id)).toEqual(['a']));
  it('returns no results for unknown terms', () => expect(searchCommands(entries, 'zzzz')).toEqual([]));
});
