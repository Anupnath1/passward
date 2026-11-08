# Passward — Native Android Offline Vault

A 100% offline personal password vault for Android (API 26–34) built with **Kotlin**, **Jetpack Compose (Material 3)**, **Room Database**, **BiometricPrompt**, and hardware-backed **AndroidKeyStore AES-256-GCM**.

---

## What Was Fixed
- **Gradle Detection**: Added `gradle/wrapper/gradle-wrapper.properties` (Gradle 8.4) so Android Studio detects and downloads the correct Gradle toolchain automatically.
- **Wrapper Scripts**: Included `gradlew` (Mac/Linux) and `gradlew.bat` (Windows).
- **Gradle Configuration**: Added `gradle.properties` with AndroidX and memory flags.
- **Architecture & Code**: Added complete Compose UI (`VaultScreens.kt`, `Theme.kt`, `Color.kt`), database layer (`PasswordEntity.kt`, `PasswordDao.kt`, `AppDatabase.kt`), biometric authentication (`BiometricAuthManager.kt`), and main activity (`MainActivity.kt`).
- **Device Compatibility**: Configured `minSdk = 26` (Android 8.0+) through `compileSdk = 34` (Android 14+), ensuring the app installs on 95%+ of all Android phones.
- **ProGuard & Resources**: Added `proguard-rules.pro`, strings, colors, themes, data extraction rules, and launcher vector icons.

---

## How to Open & Run in Android Studio

1. **Open the project**:
   - In Android Studio, click **File > Open...**
   - Select the `android/` folder (or extracted project folder).
   - Android Studio will detect Gradle 8.4 and automatically sync all dependencies.

2. **Run on your physical Android phone**:
   - On your phone: **Settings > About phone > tap "Build number" 7 times** to unlock Developer options.
   - Go to **Settings > System > Developer options** and enable **USB debugging**.
   - Plug your phone into your PC via USB and tap **"Allow"** when prompted on your phone.
   - Select your phone in Android Studio's device selector toolbar.
   - Click the green **Run (▶)** button (`Shift + F10`).

3. **Build the Standalone APK**:
   ```bash
   ./gradlew assembleDebug
   ```
   Output APK:
   `app/build/outputs/apk/debug/app-debug.apk`
