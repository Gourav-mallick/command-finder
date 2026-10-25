#!/usr/bin/env bash
# Build Debian/Ubuntu package (.deb) for CMDX
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

VERSION="0.1.0"
ARCH="all"
PKG_NAME="cmdx"
STAGE_DIR="$DIR/.deb-staging"
DEB_FILE="$DIR/dist/${PKG_NAME}_${VERSION}_${ARCH}.deb"

echo "==> Building CMDX project..."
npm run build

echo "==> Preparing .deb staging directory in $STAGE_DIR..."
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR/DEBIAN"
mkdir -p "$STAGE_DIR/usr/bin"
mkdir -p "$STAGE_DIR/usr/share/cmdx"
mkdir -p "$STAGE_DIR/etc/profile.d"
mkdir -p "$STAGE_DIR/usr/share/doc/cmdx"

# Copy application files
cp -r "$DIR/dist" "$STAGE_DIR/usr/share/cmdx/"
cp -r "$DIR/data" "$STAGE_DIR/usr/share/cmdx/"
cp -r "$DIR/shell" "$STAGE_DIR/usr/share/cmdx/"
cp -r "$DIR/node_modules" "$STAGE_DIR/usr/share/cmdx/"
cp "$DIR/package.json" "$STAGE_DIR/usr/share/cmdx/"
cp "$DIR/README.md" "$STAGE_DIR/usr/share/doc/cmdx/"
cp "$DIR/LICENSE" "$STAGE_DIR/usr/share/doc/cmdx/" 2>/dev/null || true

# Binary launcher in /usr/bin/cmdx
cat << 'EOF' > "$STAGE_DIR/usr/bin/cmdx"
#!/usr/bin/env bash
# If node is not on current PATH, try user NVM/asdf paths
if ! command -v node >/dev/null 2>&1; then
  for p in "$HOME/.nvm/versions/node"/v*/bin "$HOME/.asdf/shims" "$HOME/.volta/bin"; do
    if [ -x "$p/node" ]; then
      export PATH="$p:$PATH"
      break
    fi
  done
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js (version 20 or newer) is required to run cmdx." >&2
  echo "Please install Node.js or activate your Node environment." >&2
  exit 1
fi

exec node /usr/share/cmdx/dist/src/cli.js "$@"
EOF
chmod +x "$STAGE_DIR/usr/bin/cmdx"

# System-wide shell integration via /etc/profile.d
cat << 'EOF' > "$STAGE_DIR/etc/profile.d/cmdx.sh"
# CMDX Ctrl+G shell integration
if [ -f /usr/share/cmdx/shell/bash.sh ]; then
  source /usr/share/cmdx/shell/bash.sh
fi
EOF
chmod 644 "$STAGE_DIR/etc/profile.d/cmdx.sh"

# Control file
cat << EOF > "$STAGE_DIR/DEBIAN/control"
Package: ${PKG_NAME}
Version: ${VERSION}
Section: utils
Priority: optional
Architecture: ${ARCH}
Recommends: nodejs
Maintainer: Gourav Mallick <gourav@example.com>
Description: Offline-first terminal command finder with Ctrl+G shortcut
 CMDX allows developers to quickly search, inspect, and insert terminal
 commands into their prompt using interactive search and a Ctrl+G shortcut.
EOF

# Post-install script
cat << 'EOF' > "$STAGE_DIR/DEBIAN/postinst"
#!/usr/bin/env bash
set -e

# Add integration to /etc/bash.bashrc if present
if [ -f /etc/bash.bashrc ] && ! grep -q "cmdx/shell" /etc/bash.bashrc; then
  cat << 'EOCMDX' >> /etc/bash.bashrc

# CMDX global shell integration (Ctrl+G)
if [ -f /usr/share/cmdx/shell/bash.sh ]; then
  source /usr/share/cmdx/shell/bash.sh
fi
EOCMDX
fi

echo "=========================================================="
echo " CMDX installed successfully!"
echo " Reload your shell or run: source /etc/profile.d/cmdx.sh"
echo " Press Ctrl + G in your terminal to search commands!"
echo "=========================================================="
exit 0
EOF
chmod 755 "$STAGE_DIR/DEBIAN/postinst"

# Pre-remove script
cat << 'EOF' > "$STAGE_DIR/DEBIAN/prerm"
#!/usr/bin/env bash
set -e
if [ -f /etc/bash.bashrc ]; then
  sed -i '/cmdx\/shell/d' /etc/bash.bashrc 2>/dev/null || true
fi
exit 0
EOF
chmod 755 "$STAGE_DIR/DEBIAN/prerm"

echo "==> Building Debian package with dpkg-deb..."
dpkg-deb --build --root-owner-group "$STAGE_DIR" "$DEB_FILE"

rm -rf "$STAGE_DIR"
echo "==> Package created at: $DEB_FILE"
echo "==> Install with: sudo dpkg -i $DEB_FILE"
