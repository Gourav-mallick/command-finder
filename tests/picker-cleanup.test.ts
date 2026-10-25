import { describe, expect, it, vi } from 'vitest';
import { closePicker } from '../src/terminal/picker.js';

describe('picker cleanup', () => {
  it('clears the rendered palette, unmounts, then returns the selection after terminal teardown', async () => {
    const calls: string[] = [];
    let finishExit!: () => void;
    const waitUntilExit = vi.fn(() => new Promise<void>(resolve => { finishExit = resolve; }));
    const instance = {
      waitUntilExit: () => { calls.push('wait'); return waitUntilExit(); },
      clear: () => calls.push('clear'),
      unmount: () => calls.push('unmount')
    };

    const resultPromise = closePicker(instance, 'adb devices -l');
    expect(calls).toEqual(['wait', 'clear', 'unmount']);
    finishExit();
    await expect(resultPromise).resolves.toBe('adb devices -l');
  });

  it('returns cancellation without a command after cleanup', async () => {
    const calls: string[] = [];
    const instance = {
      waitUntilExit: async () => { calls.push('wait'); },
      clear: () => calls.push('clear'),
      unmount: () => calls.push('unmount')
    };
    await expect(closePicker(instance)).resolves.toBeUndefined();
    expect(calls).toEqual(['wait', 'clear', 'unmount']);
  });
});
