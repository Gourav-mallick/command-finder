#!/usr/bin/env bash
# CMDX Universal Linux Installer
# Automatically installs CMDX, creates the global command, and enables Ctrl+G in your shell.

set -e

REPO_URL="https://github.com/Gourav-mallick/command-finder.git"
MIN_NODE_VERSION=20

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

info() { echo -e "${BLUE}==>${NC} ${BOLD}$1${NC}"; }
success() { echo -e "${GREEN}==>${NC} ${BOLD}$1${NC}"; }
warn() { echo -e "${YELLOW}Warning:${NC} $1"; }
error() { echo -e "${RED}Error:${NC} $1" >&2; exit 1; }

# Determine actual user when invoked via sudo
if [ -n "$SUDO_USER" ]; then
  REAL_USER="$SUDO_USER"
  REAL_HOME=$(getent passwd "$SUDO_USER" | cut -d: -f6)
else
  REAL_USER=$(whoami)
  REAL_HOME="$HOME"
fi

# Parse arguments
UNINSTALL=false
for arg in "$@"; do
  case $arg in
    --uninstall|-u)
      UNINSTALL=true
      shift
      ;;
  esac
done

# Uninstall flow
if [ "$UNINSTALL" = true ]; then
  info "Uninstalling CMDX..."
  rm -f /usr/local/bin/cmdx "$REAL_HOME/.local/bin/cmdx" /etc/profile.d/cmdx.sh
  rm -rf /opt/cmdx "$REAL_HOME/.cmdx"
  
  if [ -f "$REAL_HOME/.bashrc" ]; then
    sed -i '/cmdx\/shell/d' "$REAL_HOME/.bashrc"
  fi
  if [ -f "$REAL_HOME/.zshrc" ]; then
    sed -i '/cmdx\/shell/d' "$REAL_HOME/.zshrc"
  fi
  if [ -f /etc/bash.bashrc ]; then
    sed -i '/cmdx\/shell/d' /etc/bash.bashrc 2>/dev/null || true
  fi
  success "CMDX uninstalled successfully."
  exit 0
fi

echo -e "${BOLD}"
echo "  ╔══════════════════════════════════════════╗"
echo "  ║        CMDX Linux Auto-Installer         ║"
echo "  ║  Offline-First Terminal Command Finder   ║"
echo "  ╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Check for Node.js
check_node() {
  if command -v node >/dev/null 2>&1; then
    NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VER" -ge "$MIN_NODE_VERSION" ]; then
      return 0
    fi
  fi
  return 1
}

if ! check_node; then
  info "Node.js (>= 20) is required. Attempting installation..."
  if [ "$(id -u)" -eq 0 ] && command -v apt-get >/dev/null 2>&1; then
    info "Installing Node.js 22 LTS via NodeSource on Debian/Ubuntu..."
    apt-get update -y && apt-get install -y ca-certificates curl gnupg
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
  elif command -v curl >/dev/null 2>&1; then
    info "Installing Node.js 22 LTS via NVM for $REAL_USER..."
    export NVM_DIR="$REAL_HOME/.nvm"
    if [ ! -d "$NVM_DIR" ]; then
      sudo -u "$REAL_USER" bash -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash'
    fi
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 22 || true
    nvm use 22 || true
  else
    error "Node.js >= 20 is required. Please install Node.js 20 or newer and re-run."
  fi
fi

if ! check_node; then
  # Try checking in common nvm paths
  for p in "$REAL_HOME/.nvm/versions/node"/v*/bin; do
    if [ -d "$p" ]; then
      export PATH="$p:$PATH"
      break
    fi
  done
fi

if ! check_node; then
  error "Node.js >= 20 could not be detected on PATH. Please ensure Node.js is installed."
fi

NODE_FOUND_VER=$(node -v)
success "Found Node.js $NODE_FOUND_VER"

# Determine installation directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/package.json" ] && grep -q '"cmdx-terminal-launcher"' "$SCRIPT_DIR/package.json" 2>/dev/null; then
  SOURCE_DIR="$SCRIPT_DIR"
else
  SOURCE_DIR=""
fi

if [ "$(id -u)" -eq 0 ]; then
  INSTALL_DIR="/opt/cmdx"
  BIN_DIR="/usr/local/bin"
else
  INSTALL_DIR="$REAL_HOME/.cmdx"
  BIN_DIR="$REAL_HOME/.local/bin"
fi

mkdir -p "$BIN_DIR"

if [ -n "$SOURCE_DIR" ] && [ "$SOURCE_DIR" = "$INSTALL_DIR" ]; then
  info "Using existing repository at $INSTALL_DIR"
else
  info "Setting up CMDX at $INSTALL_DIR..."
  if [ -n "$SOURCE_DIR" ]; then
    mkdir -p "$INSTALL_DIR"
    cp -r "$SOURCE_DIR"/* "$INSTALL_DIR"/ 2>/dev/null || cp -a "$SOURCE_DIR"/. "$INSTALL_DIR"/
  else
    if command -v git >/dev/null 2>&1; then
      if [ -d "$INSTALL_DIR/.git" ]; then
        info "Updating existing git repository..."
        git -C "$INSTALL_DIR" pull --ff-only || true
      else
        info "Cloning CMDX from GitHub..."
        git clone "$REPO_URL" "$INSTALL_DIR"
      fi
    else
      error "Git is required to download CMDX. Please install git."
    fi
  fi
fi

# Fix permissions if run with sudo
if [ -n "$SUDO_USER" ] && [ "$INSTALL_DIR" != "/opt/cmdx" ]; then
  chown -R "$REAL_USER:$REAL_USER" "$INSTALL_DIR"
fi

# Build project
info "Installing dependencies and building project..."
cd "$INSTALL_DIR"
npm install --silent
npm run build

# Create wrapper binary
info "Creating global executable at $BIN_DIR/cmdx..."
NODE_BIN_PATH=$(command -v node)

cat << EOF > "$BIN_DIR/cmdx"
#!/usr/bin/env bash
exec "$NODE_BIN_PATH" "$INSTALL_DIR/dist/src/cli.js" "\$@"
EOF
chmod +x "$BIN_DIR/cmdx"

# Shell integration: Add Ctrl+G shortcut to Bash & ensure bin path is reachable
BASH_LINE=$(cat << 'EOF'
case ":$PATH:" in
  *:"__BIN_DIR__":*) ;;
  *) export PATH="__BIN_DIR__:$PATH" ;;
esac
[ -f "__INSTALL_DIR__/shell/bash.sh" ] && source "__INSTALL_DIR__/shell/bash.sh"
EOF
)
BASH_LINE="${BASH_LINE//__BIN_DIR__/$BIN_DIR}"
BASH_LINE="${BASH_LINE//__INSTALL_DIR__/$INSTALL_DIR}"

setup_shell_file() {
  local file="$1"
  local content="$2"
  if [ -f "$file" ]; then
    if ! grep -q "cmdx/shell" "$file"; then
      echo "" >> "$file"
      echo "# CMDX Shortcut (Ctrl+G)" >> "$file"
      echo "$content" >> "$file"
      return 0
    fi
  fi
  return 1
}

CONFIGURED_SHELLS=()
if setup_shell_file "$REAL_HOME/.bashrc" "$BASH_LINE"; then
  CONFIGURED_SHELLS+=("~/.bashrc")
fi
if [ -f "$REAL_HOME/.zshrc" ]; then
  if setup_shell_file "$REAL_HOME/.zshrc" "$ZSH_LINE"; then
    CONFIGURED_SHELLS+=("~/.zshrc")
  fi
fi

# If root, also enable system-wide integration
if [ "$(id -u)" -eq 0 ]; then
  mkdir -p /etc/profile.d
  cat << EOF > /etc/profile.d/cmdx.sh
if [ -f "$INSTALL_DIR/shell/bash.sh" ]; then
  source "$INSTALL_DIR/shell/bash.sh"
fi
EOF
  chmod 644 /etc/profile.d/cmdx.sh
  CONFIGURED_SHELLS+=("/etc/profile.d/cmdx.sh")
fi

echo ""
success "CMDX installation completed successfully!"
echo -e "${BOLD}Installed path:${NC} $BIN_DIR/cmdx"
echo -e "${BOLD}Shell integration:${NC} ${CONFIGURED_SHELLS[*]:-Already configured}"
echo ""
echo -e "${GREEN}${BOLD}How to use now:${NC}"
echo "  1. Reload your shell:"
echo -e "     ${YELLOW}source ~/.bashrc${NC}"
echo "  2. Press ${BOLD}Ctrl + G${NC} anywhere in your terminal to search & insert commands!"
echo ""
echo -e "Try running directly: ${YELLOW}cmdx search \"docker\"${NC} or ${YELLOW}cmdx list${NC}"
