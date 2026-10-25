import { readFile, writeFile } from 'node:fs/promises';
const path = new URL('../dist/src/cli.js', import.meta.url);
const content = await readFile(path, 'utf8');
if (!content.startsWith('#!/usr/bin/env node')) await writeFile(path, `#!/usr/bin/env node\n${content}`, { mode: 0o755 });
