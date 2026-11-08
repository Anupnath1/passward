# 🛡️ Passward — Native Android Offline Password Vault

[![Platform: Android](https://img.shields.io/badge/Platform-Android_8.0+_(API_26--34)-3DDC84.svg?logo=android&logoColor=white)](https://developer.android.com)
[![Kotlin](https://img.shields.io/badge/Kotlin-2.0.21-7F52FF.svg?logo=kotlin&logoColor=white)](https://kotlinlang.org)
[![Jetpack Compose](https://img.shields.io/badge/UI-Jetpack_Compose_Material_3-4285F4.svg?logo=jetpackcompose&logoColor=white)](https://developer.android.com/jetpack/compose)
[![Security: AES-256-GCM](https://img.shields.io/badge/Security-AES--256--GCM_Hardware_Keystore-0ea5e9.svg)](https://developer.android.com/training/articles/keystore)
[![Offline: Zero Internet](https://img.shields.io/badge/Network-100%25_Offline_(Zero_Internet)-10b981.svg)](https://developer.android.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Important**: **Passward is a native Android mobile application**, not a website or cloud service. All password records and encryption keys are stored strictly in your phone's hardware-backed **Android KeyStore** and local **Room SQLite** database. The web interface is only a development simulator and companion exporter.

---

## 📱 How to Install & Use on Your Android Phone

You have two easy methods to install Passward on your Android device:

---

### Method 1: Download & Sideload Pre-built APK (Quickest — No Android Studio Required)

You do **not** need to compile code or install Android Studio to use Passward on your phone:

#### 1. Download the `.apk` file
- **From GitHub Releases**: Go to the [Releases](https://github.com/Anupnath1/passward/releases) tab and download `app-debug.apk` (or `Passward-release.apk`).
- **From GitHub Actions**:
  1. Click the **Actions** tab on the GitHub repository.
  2. Select the latest workflow run under **Build Passward APK**.
  3. Scroll down to **Artifacts** and download the `Passward-debug-apk.zip` archive.
  4. Unzip the file on your computer or phone to obtain `app-debug.apk`.

#### 2. Enable "Install Unknown Apps" on your Phone
1. On your Android phone, open **Settings**.
2. Navigate to **Apps** > **Special app access** > **Install unknown apps** (or search "Install unknown apps" in Settings).
3. Select the app you will use to open the APK (e.g., **Chrome**, **Files by Google**, or your file manager).
4. Toggle **"Allow from this source"** to **ON**.

#### 3. Install and Launch
1. Open your phone's **Files** or **Downloads** folder.
2. Tap `app-debug.apk`.
3. Tap **Install**. If Android Play Protect shows a prompt ("Unrecognized app"), tap **"Install anyway"** (this occurs for all non-Play Store development APKs).
4. Tap **Open** — your biometric fingerprint/PIN prompt will immediately guard your personal vault!

---

### Method 2: Open, Build & Run via Android Studio (For Developers)

If you have Android Studio installed and want to run or debug the app directly on your phone:

#### Prerequisites
- **Android Studio**: Ladybug (2024.2+), Koala, Hedgehog, or newer.
- **Java JDK**: JDK 17 (bundled with Android Studio as JetBrains Runtime / JBR).
- **Physical Phone**: Any Android phone running Android 8.0 (Oreo, API 26) up to Android 14 / 15 (API 34+).

#### Step-by-Step Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Anupnath1/passward.git
   cd passward
   ```

2. **Open the Android Project**:
   - Launch **Android Studio**.
   - Click **File** > **Open...**
   - **Crucial**: Select the **`android/`** subfolder inside the cloned repository (do NOT open the root folder in Android Studio).
   - Android Studio will recognize the Gradle project and automatically trigger a Gradle Sync.

3. **Verify Gradle & JDK Settings**:
   - Go to **File** > **Settings** (or **Android Studio > Preferences** on macOS).
   - Navigate to **Build, Execution, Deployment** > **Build Tools** > **Gradle**.
   - Ensure **Gradle JDK** is set to **Embedded JDK 17** (or standard Java 17).

4. **Enable USB Debugging on Your Physical Android Phone**:
   - On your phone: Go to **Settings** > **About phone**.
   - Scroll down to **Build number** and tap it **7 times** until you see "You are now a developer!".
   - Go back to **Settings** > **System** > **Developer options**.
   - Turn on **USB debugging**.
   - Connect your phone to your computer via a USB cable.
   - When the popup appears on your phone screen asking *"Allow USB debugging?"*, check *"Always allow"* and tap **Allow**.

5. **Run the App on Your Phone**:
   - In the top toolbar of Android Studio, locate the target device dropdown.
   - Select your physical phone (e.g. `Samsung SM-S928B`, `Google Pixel 8`, `Xiaomi 13`, etc.).
   - Click the green **Run (▶)** button (or press `Shift + F10`).
   - Android Studio compiles the project, installs the APK, and opens Passward on your screen!

#### Building the APK from Command Line
If you prefer building without launching the full IDE UI:
```bash
cd android
chmod +x gradlew
./gradlew assembleDebug
```
The compiled APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ✨ Complete Feature Breakdown

Passward includes a full suite of native offline vault tools:

| Feature | Description |
| :--- | :--- |
| 🔒 **Biometric Authentication** | Hardware-backed biometric unlock using AndroidX `BiometricPrompt` supporting Fingerprint, Face ID, or Device PIN fallback. |
| 🛡️ **Zero Cloud & Zero Tracking** | Absolutely no `android.permission.INTERNET` requested. Your data physically cannot leave your phone. |
| 🔐 **Hardware AES-256-GCM** | Encryption keys generated and retained exclusively in Android's secure hardware element (**AndroidKeyStore**). |
| 📸 **Screenshot & Recents Shield** | Enforces `FLAG_SECURE` at the window level to prevent malware or accidental screenshots from capturing vault contents. |
| 🌗 **Dark & Light Mode Switcher** | Instant theme toggle from the header bar and settings dialog, with full Material 3 dynamic color support. |
| ✏️ **Password Management** | Full Create, Read, Update, Delete (CRUD) workflow. Tap any card to view full details or edit credentials. |
| 📁 **Encrypted Backup & Restore** | Export your entire vault as an encrypted JSON backup file or import existing backups safely. |
| 🛡️ **Security Health Audit** | Evaluates overall vault strength (0–100%), flags compromised, weak (<10 chars), or duplicate passwords with a 1-click **"Fix / Edit"** shortcut. |
| ✨ **Password Generator** | Configurable length (8 to 32 characters), toggles for uppercase, numbers, and symbols, entropy score calculation, and 1-tap clipboard copy. |
| ⚙️ **Vault Settings** | Inspect hardware crypto status, customize theme preference, view app version, or wipe all records securely. |
| 📋 **Auto-Wiping Clipboard** | Copies passwords safely to the Android clipboard with auto-clear warnings. |

---

## 🛠️ Modern Android Architecture & Toolchain

The native Android project is structured according to Google's Modern Android Development (MAD) recommendations:

- **Language**: Kotlin `2.0.21`
- **Compose Compiler**: `org.jetbrains.kotlin.plugin.compose` (Kotlin 2.0+ official compiler plugin)
- **UI Framework**: Jetpack Compose with Material 3 (`androidx.compose.material3:1.2.0`)
- **Annotation Processing**: **KSP** (`com.google.devtools.ksp:2.0.21-1.0.28`) replacing legacy kapt for fast compilation
- **Build System**: Android Gradle Plugin `8.7.3` with Gradle `8.10.2` / `9.x`
- **Local Database**: Room SQLite `2.6.1` with Kotlin Coroutines & Flow
- **Security & Keystore**: `androidx.security:security-crypto:1.1.0-alpha06`
- **Biometrics**: `androidx.biometric:biometric:1.2.0-alpha05`
- **SDK Targets**:
  - `minSdk = 26` (Android 8.0 Oreo, covers 95%+ of active devices worldwide)
  - `compileSdk = 34` (Android 14)
  - `targetSdk = 34` (Android 14)

---

## 📂 Android Source Code Structure

```
android/
├── app/
│   ├── build.gradle.kts           # App-level dependencies, KSP, Compose & SDK config
│   ├── proguard-rules.pro         # Proguard obfuscation & shrinking rules
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml # Zero INTERNET permissions, singleTask launchMode
│           ├── java/com/passward/app/
│           │   ├── MainActivity.kt               # Entry activity with FLAG_SECURE & Biometrics
│           │   ├── data/
│           │   │   ├── PasswordEntity.kt         # Room Entity (title, username, encryptedPassword, category)
│           │   │   ├── PasswordDao.kt            # Coroutine-enabled queries (insert, update, delete, search)
│           │   │   └── AppDatabase.kt            # Room Database singleton
│           │   ├── security/
│           │   │   ├── CryptoManager.kt          # AES-256-GCM AndroidKeyStore implementation
│           │   │   └── BiometricAuthManager.kt   # BiometricPrompt integration
│           │   └── ui/
│           │       ├── VaultScreens.kt           # All Compose screens & 4 header action dialogs
│           │       ├── Theme.kt                  # Material 3 Light/Dark color palettes
│           │       └── Color.kt                  # Theme accent colors
│           └── res/
│               ├── values/strings.xml
│               ├── values/themes.xml             # Theme.Material3.DayNight.NoActionBar
│               └── mipmap/ic_launcher.xml
├── build.gradle.kts               # Root plugins (AGP 8.7.3, Kotlin 2.0.21, KSP)
├── settings.gradle.kts            # Module repository definitions
├── gradle.properties              # AndroidX & JVM optimization flags
├── gradlew & gradlew.bat          # Executable Gradle wrappers
└── gradle/wrapper/
    ├── gradle-wrapper.properties  # Gradle wrapper specification
    └── gradle-wrapper.jar
```

---

## ❓ Frequently Asked Questions & Troubleshooting

### Q: Why does Android Studio say "Gradle sync failed"?
1. Verify that your **Gradle JDK** is set to **JDK 17**:
   - `Settings` > `Build, Execution, Deployment` > `Build Tools` > `Gradle` > `Gradle JDK` -> choose **Version 17**.
2. Make sure you opened the **`android/`** folder specifically, not the top-level repository folder.

### Q: Why does the phone say "Blocked by Play Protect" when installing the APK?
Because this APK is built directly from source code and signed with a development key rather than Google's Play Console private key. Tap **"More details"** > **"Install anyway"**. The app has zero network permissions and is 100% offline.

### Q: Is my data backed up to Google Drive or the cloud?
**No.** Passward is strictly zero-knowledge and offline. If you want to transfer your passwords to a new phone, use the in-app **Backup & Restore (📁)** feature to export an encrypted JSON file and transfer it via USB or local storage.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
