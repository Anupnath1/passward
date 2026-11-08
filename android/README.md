# Save My Password — Native Android 14 Project

Personal offline password vault for Android 14 (API 34) built with Kotlin and Jetpack Compose.

## Key Features
- **100% Offline**: No network permission in AndroidManifest.xml.
- **Hardware-backed Encryption**: AES-256-GCM via AndroidKeyStore.
- **Biometric Security**: BiometricPrompt (Fingerprint, Face Unlock, Device PIN).
- **Encrypted Local Storage**: Room Database.
- **Screen Protection**: FLAG_SECURE prevents screenshots and app switcher snapshots.

## Build Debug APK
```bash
./gradlew assembleDebug
```
The output APK will be generated at:
`app/build/outputs/apk/debug/app-debug.apk`
