# Installing Dhaani on macOS

Because Dhaani is not yet notarized by Apple, the installation needs an extra helper script.

1. Download all three files: `Dhaani-1.0.0-arm64.dmg`, `Install_Dhaani.command`, and this `INSTALL_INSTRUCTIONS.md` file.
2. Move the three files into the same folder (for example, your Downloads folder).
3. Double-click `Install_Dhaani.command`. macOS may ask for confirmation because the file was downloaded from the internet—choose **Open**.
4. When prompted, enter your administrator password so the script can copy `Dhaani.app` into `/Applications` and remove the Gatekeeper quarantine flag.
5. Once the Terminal window says "Dhaani is installed", the app will launch automatically. You can then eject the mounted disk image.

Manual install (if you prefer not to run the script):

```bash
hdiutil attach Dhaani-1.0.0-arm64.dmg
VOLUME=$(ls -d /Volumes/Dhaani* | head -n 1)
cp -R "$VOLUME/Dhaani.app" /Applications
xattr -dr com.apple.quarantine /Applications/Dhaani.app
open /Applications/Dhaani.app
hdiutil detach "$VOLUME"
```

Need help? Contact Shraddha at dhaani.iprog@gmail.com.
