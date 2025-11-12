#!/bin/zsh
set -euo pipefail

echo "Dhaani installer (one-time setup)"

# Locate DMG: arg > Dhaani.dmg next to this script > newest Dhaani*.dmg next to this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" &> /dev/null && pwd )"
DMG_PATH="${1:-$SCRIPT_DIR/Dhaani.dmg}"
if [ ! -f "$DMG_PATH" ]; then
  CANDIDATE=$(ls -t "$SCRIPT_DIR"/Dhaani*.dmg 2>/dev/null | head -n 1 || true)
  if [ -n "${CANDIDATE:-}" ]; then
    DMG_PATH="$CANDIDATE"
  fi
fi

if [ ! -f "$DMG_PATH" ]; then
  echo "Could not find Dhaani.dmg. Place it next to Install_Dhaani.command or pass a path:"
  echo "  ./Install_Dhaani.command /path/to/Dhaani.dmg"
  exit 1
fi

echo "Using DMG: $DMG_PATH"

# Remove quarantine from DMG and mount
xattr -dr com.apple.quarantine "$DMG_PATH" 2>/dev/null || true
hdiutil attach -nobrowse "$DMG_PATH"
sleep 2

# Resolve mounted volume path
VOL="/Volumes/Dhaani"
if [ ! -d "$VOL" ]; then
  VOL=$(ls -d /Volumes/Dhaani* 2>/dev/null | head -n 1 || true)
fi

if [ ! -d "$VOL" ]; then
  echo "Failed to locate mounted volume. Is the DMG mounted?"
  exit 1
fi

echo "Mounted at: $VOL"

# Copy app to Applications
cp -R "$VOL/Dhaani.app" /Applications

# Remove quarantine on the app and open it
xattr -dr com.apple.quarantine /Applications/Dhaani.app 2>/dev/null || true

# Detach volume
hdiutil detach "$VOL" 2>/dev/null || true

echo "Launching Dhaani..."
open /Applications/Dhaani.app

echo "Done. You can now use Dhaani from Applications."
