# Shell integration

CMDX uses each shell's own command-line editor. The picker UI is on stderr and the selected command alone is captured from stdout. Cancellation leaves the original line unchanged. Ctrl+G availability depends on terminal and shell bindings.

## Bash

Add to `~/.bashrc` (adjust the installed script path):

```bash
source /path/to/cmdx/shell/bash.sh
```

The `bind -x` handler uses `READLINE_LINE` and `READLINE_POINT` and inserts at the current cursor. If `cmdx` is missing from PATH, install/link it or use `command -v cmdx` to inspect PATH. The script only binds in interactive Bash.

## Zsh

Add `source /path/to/cmdx/shell/zsh.sh` to `~/.zshrc`. The widget uses ZLE's `LBUFFER`; it inserts at the cursor. If another widget owns Ctrl+G, change the `bindkey` chord.

## Fish

Add `source /path/to/cmdx/shell/fish.fish` to `~/.config/fish/config.fish`. It uses `commandline -i`. If the binding conflicts, replace `\\cg` with another Fish key sequence.

## PowerShell

Add `. /path/to/cmdx/shell/powershell.ps1` to `$PROFILE`. This uses PSReadLine's `Set-PSReadLineKeyHandler` and `PSConsoleReadLine.Insert`. Ensure `cmdx` is available in PATH and PSReadLine is installed.

## Compatibility notes

These are prompt-level shortcuts, not global OS shortcuts. In terminal emulators, Ctrl+G is commonly delivered as the control character, but key mappings can intercept it. X11/Wayland do not affect this prompt-level approach. In Windows Terminal, PowerShell and WSL use their respective shell integration only. If your terminal does not pass Ctrl+G, run `cmdx --pick` manually or bind another supported key.
