# Passward — Native Android Offline Vault

A 100% offline personal password vault for Android (API 26–34) built with **Kotlin 2.0.21**, **Jetpack Compose (Material 3)**, **KSP Room Database**, **BiometricPrompt**, and hardware-backed **AndroidKeyStore AES-256-GCM**.

---

## 🚀 How to Setup and Run on Your Phone

### Option 1: Direct APK Sideload (No Android Studio required)
1. Download `app-debug.apk` directly from the [GitHub Actions Artifacts](https://github.com/Anupnath1/passward/actions) or [Releases](https://github.com/Anupnath1/passward/releases).
2. On your phone: **Settings > Apps > Special app access > Install unknown apps** -> Enable for your file browser.
3. Tap the `.apk` file and select **Install**.

---

### Option 2: Open and Run in Android Studio
1. **Open the project**:
   - In Android Studio (Ladybug, Koala, or Hedgehog), click **File > Open...**
   - Select this **`android/`** folder.
   - Android Studio will detect Gradle and automatically sync all dependencies.
   - Ensure your **Gradle JDK** is set to **JDK 17** (`Settings > Build, Execution, Deployment > Build Tools > Gradle > Gradle JDK`).

2. **Run on your physical Android phone**:
   - On your phone: Go to **Settings > About phone** and tap **"Build number" 7 times** to unlock Developer options.
   - Go to **Settings > System > Developer options** and enable **USB debugging**.
   - Plug your phone into your computer via USB and tap **"Allow"** when prompted on your phone.
   - Select your physical phone in Android Studio's device selector toolbar.
   - Click the green **Run (▶)** button (`Shift + F10`).

3. **Build the Standalone APK via CLI**:
   ```bash
   ./gradlew assembleDebug
   ```
   Output APK:
   `app/build/outputs/apk/debug/app-debug.apk`

---

## 🛠️ Toolchain Upgrades & Fixes Applied
- **Compose Compiler**: Using `org.jetbrains.kotlin.plugin.compose` (official Kotlin 2.0+ Compose plugin).
- **Kotlin**: Upgraded to `2.0.21`.
- **AGP**: Upgraded to `8.7.3`.
- **KSP Migration**: Migrated Room compiler from `kapt` to `ksp("androidx.room:room-compiler:2.6.1")` (kapt is incompatible with Kotlin 2.0+).
- **Themes**: Bundled `com.google.android.material:material:1.11.0` for `Theme.Material3.DayNight.NoActionBar`.
- **Executable Wrapper**: Ensured `chmod +x gradlew` executable permissions.
- **Hardware Encryption**: Keystore AES-256-GCM master key generation with `EncryptedSharedPreferences` / `MasterKeys`.
- **Privacy Shield**: Window flag `FLAG_SECURE` enabled in `MainActivity.kt` to prevent screenshots and screen sniffing.
- **Zero Internet**: Zero network permissions declared in `AndroidManifest.xml`.
- **4 Action Icons**: TopAppBar dialogs for Backup & Restore, Security Health Audit, Password Generator, and Settings.
