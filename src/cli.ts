#!/usr/bin/env node
import { Command } from 'commander';
import { RegistryService, currentPlatform } from './registry/registry.service.js';
import { searchCommands } from './search/search.service.js';
import { pickCommand } from './terminal/picker.js';
import { openWebSearch } from './platform/browser.js';
import { configDir } from './config/paths.js';

const program = new Command(); const registry = new RegistryService();
program.name('cmdx').description('Offline-first terminal command launcher').version('0.1.0');
program.option('--pick', 'open interactive picker and print only the selected command');
program.action(async () => {
  try {
    const entries = await registry.load(); const value = await pickCommand(entries);
    if (value === undefined) { process.exitCode = 1; return; }
    process.stdout.write(`${value}\n`);
  } catch (error) { process.stderr.write(`cmdx: ${(error as Error).message}\n`); process.exitCode = 2; }
});
program.command('search <query>').description('Search available commands').action(async query => {
  const entries = await registry.load(); const found = searchCommands(entries, query, currentPlatform());
  for (const item of found) process.stdout.write(`${item.id}\t${item.command}\t${item.name} — ${item.description} [${item.category}/${item.source}]\n`);
  if (!found.length) process.exitCode = 1;
});
program.command('list').description('List available commands').option('--category <category>').action(async options => {
  const entries = await registry.load();
  for (const item of entries.filter(entry => !options.category || entry.category.toLowerCase() === options.category.toLowerCase())) process.stdout.write(`${item.id}\t${item.command}\t${item.name} [${item.category}]\n`);
});
program.command('show <id>').description('Show command details').action(async id => {
  const item = (await registry.load()).find(entry => entry.id === id);
  if (!item) { process.stderr.write(`cmdx: command not found: ${id}\n`); process.exitCode = 1; return; }
  process.stdout.write(`${item.name}\n${item.description}\n\n${item.command}\n\nCategory: ${item.category}\nRisk: ${item.risk}\nPlatforms: ${item.platforms.join(', ')}\nExamples: ${item.examples.join('; ') || 'None'}\n`);
});
program.command('web <query>').description('Open Google search in your browser').action(async query => {
  try { await openWebSearch(query); } catch (error) { process.stderr.write(`cmdx: unable to open browser: ${(error as Error).message}\n`); process.exitCode = 2; }
});
program.command('config').description('Show configuration locations').action(() => {
  process.stdout.write(`Config directory: ${configDir()}\nLocal command files: ${configDir()}/*.json, *.txt\n`);
});
program.command('init').description('Print shell integration instructions').action(() => {
  process.stdout.write('Add the following to your shell startup file:\n  Bash:  source "$(npm root -g)/cmdx-terminal-launcher/shell/bash.sh"\n  Zsh/Fish/PowerShell: see docs/shell-integration.md\n');
});
program.command('doctor').description('Check CMDX runtime and local configuration').action(async () => {
  process.stdout.write(`Node: ${process.version}\nPlatform: ${process.platform}\nConfig: ${configDir()}\nTTY: ${Boolean(process.stdin.isTTY && process.stderr.isTTY)}\n`);
  try { process.stdout.write(`Commands: ${(await registry.load()).length}\n`); } catch (error) { process.stderr.write(`Catalog error: ${(error as Error).message}\n`); process.exitCode = 2; }
});
program.command('uninstall').description('Print shell integration removal instructions').action(() => { process.stdout.write('Remove the cmdx source line from your shell startup file. Local command files are preserved.\n'); });
await program.parseAsync(process.argv);
