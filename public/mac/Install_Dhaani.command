#!/bin/zsh
set -euo pipefail

readonly DMG_FILENAME="Dhaani-1.0.1-arm64.dmg"
readonly EXPECTED_DMG_SHA256="d566427d77d5488dcfcb8bc91315e6482be891352178679e315da09b64b87dd7"
readonly EXPECTED_ARCH="arm64"
readonly DEST_APP="/Applications/Dhaani.app"
readonly STAGED_APP="/Applications/.Dhaani.install.$$"

SCRIPT_DIR="$(cd "$(dirname "${0:A}")" && pwd)"
DMG_PATH="${1:-$SCRIPT_DIR/$DMG_FILENAME}"

echo "Dhaani verified installer"

if [ ! -f "$DMG_PATH" ]; then
  echo "Could not find $DMG_FILENAME next to this installer." >&2
  echo "Keep all three downloaded files in the same folder, or run:" >&2
  echo "  ./Install_Dhaani.command /path/to/$DMG_FILENAME" >&2
  exit 1
fi

for command in shasum hdiutil codesign lipo ditto xattr; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Required macOS command is unavailable: $command" >&2
    exit 1
  fi
done

ACTUAL_DMG_SHA256="$(shasum -a 256 "$DMG_PATH" | awk '{print $1}')"
if [ "$ACTUAL_DMG_SHA256" != "$EXPECTED_DMG_SHA256" ]; then
  echo "The DMG checksum does not match the verified Dhaani release." >&2
  echo "Expected: $EXPECTED_DMG_SHA256" >&2
  echo "Actual:   $ACTUAL_DMG_SHA256" >&2
  echo "Delete these downloads and download all three files again." >&2
  exit 1
fi
echo "Verified DMG checksum."

HOST_ARCH="$(uname -m)"
if [ "$HOST_ARCH" != "$EXPECTED_ARCH" ]; then
  echo "This installer is for Apple Silicon Macs (arm64), but this Mac is $HOST_ARCH." >&2
  exit 1
fi

MOUNT_DIR="$(mktemp -d /tmp/dhaani-install.XXXXXX)"
ATTACHED=0
cleanup() {
  if [ "$ATTACHED" = "1" ]; then
    hdiutil detach "$MOUNT_DIR" >/dev/null 2>&1 || true
    ATTACHED=0
  fi
  rmdir "$MOUNT_DIR" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# The checksum is validated before quarantine is removed.
xattr -dr com.apple.quarantine "$DMG_PATH" 2>/dev/null || true
hdiutil attach -readonly -nobrowse -mountpoint "$MOUNT_DIR" "$DMG_PATH" >/dev/null
ATTACHED=1

SOURCE_APP="$MOUNT_DIR/Dhaani.app"
if [ ! -d "$SOURCE_APP" ]; then
  echo "The verified DMG does not contain Dhaani.app." >&2
  exit 1
fi

codesign --verify --deep --strict --verbose=2 "$SOURCE_APP"
APP_ARCHS="$(lipo -archs "$SOURCE_APP/Contents/MacOS/Dhaani")"
if [[ " $APP_ARCHS " != *" $EXPECTED_ARCH "* ]]; then
  echo "Dhaani.app has the wrong architecture: $APP_ARCHS" >&2
  exit 1
fi
echo "Verified the app bundle and architecture."

if [ "${DHAANI_INSTALL_VERIFY_ONLY:-0}" = "1" ]; then
  echo "Verification-only mode passed; /Applications was not changed."
  exit 0
fi

install_app() {
  rm -rf "$STAGED_APP"
  ditto "$SOURCE_APP" "$STAGED_APP"
  xattr -dr com.apple.quarantine "$STAGED_APP" 2>/dev/null || true
  codesign --verify --deep --strict --verbose=2 "$STAGED_APP"
  rm -rf "$DEST_APP"
  mv "$STAGED_APP" "$DEST_APP"
}

if [ -w /Applications ]; then
  install_app
else
  echo "macOS will now ask for an administrator password to install Dhaani in /Applications."
  sudo rm -rf "$STAGED_APP"
  sudo ditto "$SOURCE_APP" "$STAGED_APP"
  sudo xattr -dr com.apple.quarantine "$STAGED_APP" 2>/dev/null || true
  codesign --verify --deep --strict --verbose=2 "$STAGED_APP"
  sudo rm -rf "$DEST_APP"
  sudo mv "$STAGED_APP" "$DEST_APP"
fi

codesign --verify --deep --strict --verbose=2 "$DEST_APP"
cleanup
trap - EXIT

echo "Dhaani is installed and will now launch."
open "$DEST_APP"
