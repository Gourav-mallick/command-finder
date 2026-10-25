import { describe, expect, it } from 'vitest';
import { loadBuiltin } from '../src/registry/builtin.loader.js';

describe('built-in catalog', () => {
  it('contains unique IDs and includes the core Docker entries', async () => {
    const commands = await loadBuiltin();
    const ids = commands.map(command => command.id);
    expect(new Set(ids).size).toBe(ids.length);
    const dockerIds = commands.filter(command => command.category === 'Docker').map(command => command.id);
    expect(dockerIds).toEqual(expect.arrayContaining(['docker-ps', 'docker-logs', 'docker-exec']));
    expect(commands.map(command => command.category)).toEqual(expect.arrayContaining([
      'Docker Compose', 'npm / npx', 'pnpm', 'Yarn', 'Python', 'Kubernetes',
      'Windows CMD/PowerShell', 'Node version management', 'Java and SDKMAN', 'Maven',
      'Gradle / Android', 'Android SDK Manager', 'Android Emulator / AVD', 'Fastboot',
      'Bundletool', 'Android Signing Tools', 'Firebase CLI', 'Flutter', 'React Native',
      'Ollama', 'Hugging Face CLI', 'Python Environments', 'Jupyter'
    ]));
  });
});
