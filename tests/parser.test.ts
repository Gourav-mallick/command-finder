import { describe, expect, it } from 'vitest';
import { parseCommandText } from '../src/registry/text.parser.js';
describe('parseCommandText', () => { it('ignores blank lines and comments', () => expect(parseCommandText('# hi\n\n git status \n#bye')).toEqual(['git status'])); });
