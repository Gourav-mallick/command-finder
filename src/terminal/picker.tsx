import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, render, useInput, useStdout } from 'ink';
import type { Instance } from 'ink';
import type { CommandEntry } from '../domain/command.model.js';
import { searchCommands } from '../search/search.service.js';
import { openWebSearch } from '../platform/browser.js';

function Picker({ entries, done }: { entries: CommandEntry[]; done: (value?: string) => void }) {
  const [query, setQuery] = useState(''); const [index, setIndex] = useState(0); const [help, setHelp] = useState(false);
  const [source, setSource] = useState<'Built-in' | 'Local' | 'Web'>('Built-in');
  const { stdout } = useStdout();
  const [terminalRows, setTerminalRows] = useState(stdout.rows ?? 24);
  useEffect(() => {
    const resize = () => setTerminalRows(stdout.rows ?? 24);
    stdout.on('resize', resize);
    return () => { stdout.off('resize', resize); };
  }, [stdout]);
  const matches = useMemo(() => source === 'Web' ? [] : searchCommands(entries.filter(entry => entry.source === (source === 'Built-in' ? 'builtin' : 'local')), query), [entries, query, source]);
  const visibleCount = Math.max(1, Math.min(6, Math.floor((terminalRows - 9) / 2)));
  const start = Math.min(Math.max(0, index - visibleCount + 1), Math.max(0, matches.length - visibleCount));
  const results = matches.slice(start, start + visibleCount);
  const selected = matches[index];
  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === 'c')) { done(); return; }
    if (key.return) { if (source === 'Web' && query.trim()) { void openWebSearch(query).catch(error => process.stderr.write(`cmdx: unable to open browser: ${(error as Error).message}\n`)); done(); } else if (selected) done(selected.command); return; }
    if (key.upArrow) setIndex(value => Math.max(0, value - 1));
    else if (key.downArrow) setIndex(value => Math.min(matches.length - 1, value + 1));
    else if (key.tab) { setSource(value => value === 'Built-in' ? 'Local' : value === 'Local' ? 'Web' : 'Built-in'); setIndex(0); }
    else if (input === '?') setHelp(value => !value);
    else if (key.backspace || key.delete) { setQuery(value => value.slice(0, -1)); setIndex(0); }
    else if (!key.ctrl && !key.meta && input) { setQuery(value => value + input); setIndex(0); }
  });
  const width = stdout.columns ?? 80;
  const searchRowWidth = Math.max(4, Math.min(width - 2, 64));
  const clip = (value: string, reserve = 4) => value.length > width - reserve ? `${value.slice(0, Math.max(1, width - reserve - 1))}…` : value;
  return <Box flexDirection="column" paddingX={1}>
    <Text color="cyan" bold>cmdx</Text>
    <Box width={searchRowWidth} justifyContent="space-between">
      <Box>
        <Text color="cyan">🔍 </Text><Text color="yellow">{query}</Text>
      </Box>
      <Text dimColor>{source === 'Web' ? 'Enter to search' : `${matches.length} result${matches.length === 1 ? '' : 's'}`}</Text>
    </Box>
    <Text dimColor>{'─'.repeat(searchRowWidth)}</Text>
    <Box flexDirection="column">
      {source === 'Web' ? <Text dimColor>Press Enter to open a Google search for this query.</Text> : results.length ? results.map((entry, i) =>
        <Box key={`${entry.source}:${entry.id}`} flexDirection="column">
          <Box>
            <Text color={start + i === index ? 'green' : 'gray'}>{start + i === index ? '❯ ' : '  '}</Text>
            <Text color="cyan">{start + i + 1}. </Text>
            <Text color={start + i === index ? 'white' : 'gray'} bold>{clip(entry.command, 4)}</Text>
          </Box>
          <Text dimColor>   {clip(entry.description, 5)}</Text>
        </Box>
      ) : <Text dimColor>{source === 'Local' ? 'No local commands found. Add JSON or TXT files to your CMDX config directory.' : 'No commands found. Try another search.'}</Text>}
    </Box>
    <Box marginTop={1}>
      <Text dimColor>{help ? '↑/↓ move · Enter insert · Esc cancel · ? hide' : '↑/↓ move · Enter insert · Esc cancel · ? help'}{matches.length > visibleCount ? ` · ${start + 1}-${Math.min(start + visibleCount, matches.length)}/${matches.length}` : ''}</Text>
    </Box>
  </Box>;
}

export async function pickCommand(entries: CommandEntry[]): Promise<string | undefined> {
  return new Promise(resolve => {
    let settled = false;
    const finish = (value?: string) => {
      if (settled) return;
      settled = true;
      void closePicker(instance, value).then(resolve);
    };
    const instance = render(<Picker entries={entries} done={finish} />, { stdout: process.stderr, stdin: process.stdin, stderr: process.stderr, exitOnCtrlC: false });
  });
}

export async function closePicker(instance: Pick<Instance, 'clear' | 'unmount' | 'waitUntilExit'>, value?: string): Promise<string | undefined> {
  const exited = instance.waitUntilExit();
  instance.clear();
  instance.unmount();
  try {
    await exited;
    return value;
  } catch (error) {
    process.stderr.write(`cmdx: picker cleanup failed: ${(error as Error).message}\n`);
    return undefined;
  }
}
