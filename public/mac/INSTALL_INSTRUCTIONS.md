# Installing Dhaani 1.0.1 on macOS

This release is for Apple Silicon Macs (M1, M2, M3, M4, or newer). Because it
is not yet notarized by Apple, use the supplied verified installer helper.

1. Download all three files: `Dhaani-1.0.1-arm64.dmg`,
   `Install_Dhaani.command.zip`, and `INSTALL_INSTRUCTIONS.md`.
2. Keep them in the same folder, such as Downloads, then double-click the ZIP
   to extract `Install_Dhaani.command` beside the DMG.
3. Control-click `Install_Dhaani.command`, choose **Open**, then confirm **Open**.
4. The helper verifies the exact DMG checksum, app signature, and architecture
   before removing quarantine. Enter your administrator password if prompted.
5. Wait for `Dhaani is installed and will now launch.` in Terminal.

If macOS will not open the helper, open Terminal and run:

```bash
cd ~/Downloads
chmod +x Install_Dhaani.command
xattr -d com.apple.quarantine Install_Dhaani.command 2>/dev/null || true
./Install_Dhaani.command
```

The installer stops without changing `/Applications` if the DMG checksum,
signature, or architecture is wrong. Do not bypass a checksum failure.

Need help? Contact Shraddha at dhaani.iprog@gmail.com.
