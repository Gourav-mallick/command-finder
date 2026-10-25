import { describe, expect, it } from 'vitest';
import { CommandSchema } from '../src/domain/command.schema.js';
describe('command schema', () => {
  it('rejects invalid risk values', () => expect(CommandSchema.safeParse({ id: 'x', name: 'x', command: 'x', description: 'x', category: 'x', tags: [], examples: [], platforms: ['all'], risk: 'danger' }).success).toBe(false));
});
