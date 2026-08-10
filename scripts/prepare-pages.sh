#!/bin/bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAC_DIR="$PROJECT_ROOT/public/mac"
HELPER="Install_Dhaani.command"

chmod +x "$MAC_DIR/$HELPER"
rm -f "$MAC_DIR/$HELPER.zip"
(
  cd "$MAC_DIR"
  zip -q -X "$HELPER.zip" "$HELPER"
)

echo "Prepared $MAC_DIR/$HELPER.zip"
