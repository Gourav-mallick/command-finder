# CMDX

CMDX is an offline-first terminal command finder. Search a bundled catalog, inspect safe command metadata, and insert a selected command into your shell prompt. CMDX never executes a selected command.

## Requirements

Node.js 20 or newer, npm, and Git. The picker runs inside the terminal using React and Ink. Check your Node.js version with `node --version` before installing.

## Install on Linux (Ubuntu/Debian and other distributions)

CMDX does not currently publish an Ubuntu package or an npm release, so install it from the GitHub source. After this project has been pushed, replace `YOUR-GITHUB-USERNAME` below with the GitHub account or organization that owns the repository:

This is a one-time setup. Keep the checkout at `$HOME/cmdx`; after `npm link` and the Bash setup below, open a terminal and use CMDX directly. Do not clone, build, or start a background service each time.

```sh
git clone https://github.com/YOUR-GITHUB-USERNAME/cmdx.git "$HOME/cmdx"
cd "$HOME/cmdx"
npm install
npm run build
npm link
cmdx --help
```

You do not need `sudo` for these CMDX commands. If `npm link` reports a permissions error, use a Node.js version manager such as `nvm` so npm's global directory belongs to your user; avoid running `sudo npm link`.

For Bash shortcut support, add this line to `~/.bashrc`:

```bash
source "$HOME/cmdx/shell/bash.sh"
```

Reload the file with `source ~/.bashrc`, then press Ctrl+G at a Bash prompt. The first Enter selects and inserts a command; the next Enter in Bash executes it.

## Install on Windows (PowerShell)

Install Git and Node.js 20 or newer first. In PowerShell, replace `YOUR-GITHUB-USERNAME` with the GitHub account or organization that owns the repository:

This is a one-time setup. Keep the checkout at `$HOME\cmdx`; after `npm link` and the PowerShell profile setup below, open PowerShell and use CMDX directly.

```powershell
git clone https://github.com/YOUR-GITHUB-USERNAME/cmdx.git "$HOME\cmdx"
Set-Location "$HOME\cmdx"
npm install
npm run build
npm link
cmdx --help
```

To enable the Ctrl+G shortcut, add this line to your PowerShell profile (open it with `notepad $PROFILE`):

```powershell
. "$HOME\cmdx\shell\powershell.ps1"
```

Restart PowerShell, then press Ctrl+G at the prompt. If the `cmdx` command is not found, make sure npm's global command directory is on `PATH`; `npm prefix -g` shows the npm prefix.

## Updating CMDX

Updating Linux, Windows, or another operating system does **not** automatically update CMDX. With a source checkout, update it manually:

Linux/macOS:

```sh
cd "$HOME/cmdx"
git pull
npm install
npm run build
```

Windows PowerShell:

```powershell
Set-Location "$HOME\cmdx"
git pull
npm install
npm run build
```

`npm link` points to the checkout, so it normally does not need to be run again after an update. Once CMDX is published as an npm package, users will be able to update it with npm; that release is not available yet.

The current global command is linked to the source checkout, which must remain on disk. A standalone installer such as an Ubuntu `.deb` or a Windows installer is not available yet. After the repository and npm package are published, installation can be reduced to a global package install without keeping a source checkout.

## Usage

```sh
cmdx search "git stash"
cmdx list
cmdx show git-stash
cmdx --pick
cmdx web "adb reverse tcp:8080 tcp:8080"
cmdx config
cmdx doctor
```

`cmdx --pick` prints the chosen command to stdout only. The UI and diagnostics use stderr. Escape cancels with exit code 1. Shell integrations rely on this contract and insert the returned string into the current editable line. Press Enter yourself to execute it.

## Built-in library

Built-in commands are split into files under `data/` so each tool family is easy to extend:

| File | Command family |
| --- | --- |
| `git.json` | Git |
| `linux.json` | Linux shell and administration |
| `network.json` / `system.json` | Network tools, SSH/SCP, DNS, cron, tmux/screen, services, and archives |
| `aws.json` / `gcloud.json` / `azure.json` | AWS, Google Cloud, and Azure CLIs |
| `terraform.json` / `github-cli.json` / `webops.json` | Terraform, GitHub CLI, Nginx, and Certbot |
| `sqlite.json` / `postgres.json` / `mysql.json` / `mongodb.json` / `redis.json` | Database command-line clients and common operations |
| `windows.json` | Windows CMD and PowerShell |
| `adb.json` | Android Debug Bridge |
| `docker.json` / `compose.json` | Docker and Docker Compose |
| `node.json` / `npm.json` / `pnpm.json` / `yarn.json` / `nvm.json` | Node.js and package/version managers |
| `python.json` | Python and pip |
| `kubernetes.json` | kubectl |
| `java.json` / `maven.json` | Java, SDKMAN, and Maven |
| `gradle.json` / `sdkmanager.json` | Gradle and Android SDK packages |
| `emulator.json` / `fastboot.json` | Android AVD/emulator and bootloader tools |
| `bundletool.json` / `signing.json` | App Bundle conversion and Android signing tools |
| `firebase.json` | Firebase CLI |
| `flutter.json` / `react-native.json` | Flutter and React Native |
| `ollama.json` / `huggingface.json` | Local LLMs and Hugging Face Hub |
| `python-env.json` / `jupyter.json` | Conda, uv, and Jupyter |

Search is case-insensitive and ranks exact command/name matches, prefixes, tags, categories, and descriptions.

## Local command files

Place JSON or TXT files in `~/.config/cmdx/` on Linux/macOS, or `%APPDATA%\cmdx\` on Windows. Invalid files are reported to stderr and do not prevent other entries loading. JSON is best for descriptions, tags, examples, platforms, and risk metadata:

```json
{
  "commands": [{
    "id": "project-test", "name": "Run project tests", "command": "npm test",
    "description": "Run this project's test suite", "category": "Project",
    "tags": ["test", "npm"], "examples": ["npm test -- --watch"],
    "platforms": ["all"], "risk": "low"
  }]
}
```

TXT format: one full command per non-empty line; lines whose first non-space character is `#` are comments. TXT entries receive generated IDs and generic metadata. Imported commands are never executed during load or search.

## Shell shortcut setup

Source the matching script from your shell startup file. See [shell integration details](docs/shell-integration.md). Bash is the first supported implementation. These scripts use shell-specific line editing APIs; terminal key handling varies. Ctrl+G can conflict with terminal or readline bindings. Wayland/X11 global hotkeys are not used. Windows Terminal/PowerShell and WSL depend on installed shell and terminal behavior; test the manual `cmdx --pick` workflow first.

## Security

CMDX discovers, displays, and inserts text only. It does not call a shell, `eval`, or execute catalog entries. Treat imported command text as untrusted and review it before pressing Enter.

## Development

```sh
npm run dev -- search "git stash"
npm run build
npm test
npm run lint
```

## Limitations

The initial catalog is intentionally small. Global shortcut support is shell-prompt binding, not an OS-wide shortcut. Shell integration scripts require manual sourcing; the current `init` command only prints guidance. The interactive UI currently searches all loaded local and built-in entries; source/category filtering and configuration editing are planned. Automated interactive shell tests and Windows/macOS CI are not yet included.

## License

MIT. See [LICENSE](LICENSE).
