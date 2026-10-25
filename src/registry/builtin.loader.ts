import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CommandFileSchema } from '../domain/command.schema.js';
import type { CommandEntry } from '../domain/command.model.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data');
const files = [
  'git.json',
  'linux.json',
  'adb.json',
  'docker.json',
  'compose.json',
  'node.json',
  'npm.json',
  'pnpm.json',
  'yarn.json',
  'python.json',
  'kubernetes.json',
  'nvm.json',
  'java.json',
  'maven.json',
  'windows.json',
  'gradle.json',
  'sdkmanager.json',
  'emulator.json',
  'fastboot.json',
  'bundletool.json',
  'signing.json',
  'firebase.json',
  'flutter.json',
  'react-native.json',
  'ollama.json',
  'huggingface.json',
  'python-env.json',
  'jupyter.json',
  'network.json',
  'system.json',
  'aws.json',
  'gcloud.json',
  'azure.json',
  'terraform.json',
  'github-cli.json',
  'webops.json',
  'sqlite.json',
  'postgres.json',
  'mysql.json',
  'mongodb.json',
  'redis.json'
];
export async function loadBuiltin(): Promise<CommandEntry[]> {
  const all: CommandEntry[] = [];
  const seenIds = new Set<string>();
  for (const file of files) {
    const parsed: unknown = JSON.parse(await readFile(path.join(root, file), 'utf8'));
    const result = CommandFileSchema.parse(parsed);
    for (const command of result.commands) {
      if (seenIds.has(command.id)) {
        process.stderr.write(`cmdx: duplicate built-in command ID ignored in ${file}: ${command.id}\n`);
        continue;
      }
      seenIds.add(command.id);
      all.push({ ...command, source: 'builtin' });
    }
  }
  return all;
}
