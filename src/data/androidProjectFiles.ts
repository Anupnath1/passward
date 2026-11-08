/**
 * Complete Native Android 14 (API 34) Source Code
 * Kotlin + Jetpack Compose + Android Keystore (AES-256) + Room + BiometricPrompt
 * Zero internet permission. 100% offline personal vault.
 */

export interface AndroidFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown' | 'properties';
  content: string;
  description: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'groovy',
    description: 'Gradle settings registering plugins and module :app',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "Passward"
include(":app")
`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Project)',
    language: 'groovy',
    description: 'Root Gradle configuration defining Android Gradle Plugin and Kotlin versions',
    content: `plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
    id("com.google.devtools.ksp") version "2.0.21-1.0.28" apply false
}
`
  },
  {
    path: 'gradle.properties',
    name: 'gradle.properties',
    language: 'properties',
    description: 'Project-wide Gradle configuration for memory and AndroidX',
    content: `# Project-wide Gradle settings.
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    name: 'gradle-wrapper.properties',
    language: 'properties',
    description: 'Gradle wrapper version (8.4) for Android Studio auto-detection',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.10.2-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  },
  {
    path: 'gradlew',
    name: 'gradlew',
    language: 'markdown',
    description: 'Unix shell script to run Gradle without pre-installing Gradle',
    content: `#!/bin/sh
app_path=$0
while [ -h "$app_path" ]; do
    ls=\`ls -ld "$app_path"\`
    link=\`expr "$ls" : '.*-> \\(.*\\)$'\`
    if expr "$link" : '/.*' > /dev/null; then app_path="$link"; else app_path=\`dirname "$app_path"\`"/$link"; fi
done
APP_BASE_NAME=\`basename "$0"\`
APP_HOME=\`cd "\\\`dirname \\"$app_path\\"\\\`" > /dev/null && pwd\`
CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar
if [ -n "$JAVA_HOME" ] ; then JAVACMD=$JAVA_HOME/bin/java; else JAVACMD=java; fi
exec "$JAVACMD" "-Dorg.gradle.appname=$APP_BASE_NAME" -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
`
  },
  {
    path: 'gradlew.bat',
    name: 'gradlew.bat',
    language: 'markdown',
    description: 'Windows batch script to run Gradle on Windows PCs',
    content: `@if "%DEBUG%" == "" @echo off
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%
set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar
if defined JAVA_HOME goto findJavaFromJavaHome
set JAVA_EXE=java.exe
goto execute
:findJavaFromJavaHome
set JAVA_EXE=%JAVA_HOME%\\bin\\java.exe
:execute
"%JAVA_EXE%" "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (Module: app)',
    language: 'groovy',
    description: 'App module build script: Jetpack Compose, Room, Biometric, Keystore',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.passward.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.passward.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.fragment:fragment-ktx:1.6.2")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3:1.2.0")
    implementation("androidx.compose.material:material-icons-extended")

    // Android Biometrics & Keystore Security Crypto
    implementation("androidx.biometric:biometric:1.2.0-alpha05")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")

    // Room Database with KSP (Kotlin 2.0+ compatible)
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
`
  },
  {
    path: 'app/proguard-rules.pro',
    name: 'proguard-rules.pro',
    language: 'markdown',
    description: 'ProGuard obfuscation rules for Room and Biometric',
    content: `# Proguard rules for Passward
-keep class com.passward.app.data.** { *; }
-keep class androidx.room.** { *; }
-dontwarn androidx.biometric.**
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Android Manifest with zero INTERNET permission, hardware biometric prompt, and window security',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Strictly NO android.permission.INTERNET! 100% Offline Vault -->
    
    <!-- Biometric Authentication permissions -->
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    
    <!-- Optional: Hardware fingerprint/face features -->
    <uses-feature android:name="android.hardware.fingerprint" android:required="false" />
    <uses-feature android:name="android.hardware.biometrics.face" android:required="false" />

    <application
        android:name=".PasswardApp"
        android:allowBackup="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="false"
        android:icon="@drawable/ic_launcher_foreground"
        android:label="@string/app_name"
        android:roundIcon="@drawable/ic_launcher_foreground"
        android:supportsRtl="true"
        android:theme="@style/Theme.Passward">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.Passward">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    language: 'xml',
    description: 'Application string resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Passward</string>
</resources>
`
  },
  {
    path: 'app/src/main/res/values/colors.xml',
    name: 'colors.xml',
    language: 'xml',
    description: 'Color resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#4F46E5</color>
    <color name="primary_dark">#4338CA</color>
    <color name="accent">#06B6D4</color>
    <color name="background">#0F172A</color>
</resources>
`
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    name: 'themes.xml',
    language: 'xml',
    description: 'Application theme definitions',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.Passward" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
    </style>
</resources>
`
  },
  {
    path: 'app/src/main/res/xml/data_extraction_rules.xml',
    name: 'data_extraction_rules.xml',
    language: 'xml',
    description: 'Offline privacy rules preventing cloud extraction of passwords',
    content: `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <exclude path="/" />
    </cloud-backup>
    <device-transfer>
        <exclude path="/" />
    </device-transfer>
</data-extraction-rules>
`
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
    name: 'ic_launcher_foreground.xml',
    language: 'xml',
    description: 'Vector launcher shield icon',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#4F46E5"
        android:pathData="M0,0h108v108h-108z"/>
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M54,26L34,35v19c0,13.2 8.5,25.5 20,28c11.5,-2.5 20,-14.8 20,-28V35L54,26zM51,62l-8,-8l2.8,-2.8l5.2,5.2l12.2,-12.2l2.8,2.8L51,62z"/>
</vector>
`
  },
  {
    path: 'app/src/main/java/com/passward/app/PasswardApp.kt',
    name: 'PasswardApp.kt',
    language: 'kotlin',
    description: 'Application subclass for Passward',
    content: `package com.passward.app

import android.app.Application

class PasswardApp : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
`
  },
  {
    path: 'app/src/main/java/com/passward/app/security/CryptoManager.kt',
    name: 'CryptoManager.kt',
    language: 'kotlin',
    description: 'Hardware-backed AES-256-GCM encryption using AndroidKeyStore',
    content: `package com.passward.app.security

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class CryptoManager {

    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply {
        load(null)
    }

    companion object {
        private const val ALGORITHM = KeyProperties.KEY_ALGORITHM_AES
        private const val BLOCK_MODE = KeyProperties.BLOCK_MODE_GCM
        private const val PADDING = KeyProperties.ENCRYPTION_PADDING_NONE
        private const val TRANSFORMATION = "$ALGORITHM/$BLOCK_MODE/$PADDING"
        private const val KEY_ALIAS = "passward_master_key_v1"
        private const val TAG_LENGTH_BITS = 128
        private const val IV_SIZE_BYTES = 12
    }

    private fun getOrCreateKey(): SecretKey {
        val existingKey = keyStore.getEntry(KEY_ALIAS, null) as? KeyStore.SecretKeyEntry
        return existingKey?.secretKey ?: createKey()
    }

    private fun createKey(): SecretKey {
        return KeyGenerator.getInstance(ALGORITHM, "AndroidKeyStore").apply {
            init(
                KeyGenParameterSpec.Builder(
                    KEY_ALIAS,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                )
                    .setBlockModes(BLOCK_MODE)
                    .setEncryptionPaddings(PADDING)
                    .setKeySize(256)
                    .setUserAuthenticationRequired(false)
                    .setRandomizedEncryptionRequired(true)
                    .build()
            )
        }.generateKey()
    }

    fun encrypt(bytes: ByteArray): ByteArray {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())

        val iv = cipher.iv
        val encryptedData = cipher.doFinal(bytes)

        val outputStream = ByteArrayOutputStream()
        outputStream.write(iv)
        outputStream.write(encryptedData)
        return outputStream.toByteArray()
    }

    fun decrypt(encryptedPayload: ByteArray): ByteArray {
        val inputStream = ByteArrayInputStream(encryptedPayload)
        val iv = ByteArray(IV_SIZE_BYTES)
        inputStream.read(iv)

        val ciphertext = ByteArray(encryptedPayload.size - IV_SIZE_BYTES)
        inputStream.read(ciphertext)

        val cipher = Cipher.getInstance(TRANSFORMATION)
        val spec = GCMParameterSpec(TAG_LENGTH_BITS, iv)
        cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(), spec)

        return cipher.doFinal(ciphertext)
    }

    fun encryptString(plainText: String): ByteArray {
        return encrypt(plainText.toByteArray(Charsets.UTF_8))
    }

    fun decryptToString(encryptedBytes: ByteArray): String {
        return String(decrypt(encryptedBytes), Charsets.UTF_8)
    }
}
`
  },
  {
    path: 'app/src/main/java/com/passward/app/security/BiometricAuthManager.kt',
    name: 'BiometricAuthManager.kt',
    language: 'kotlin',
    description: 'BiometricPrompt controller supporting Fingerprint, Face Unlock & Phone PIN',
    content: `package com.passward.app.security

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity

class BiometricAuthManager(private val activity: FragmentActivity) {

    fun canAuthenticate(): Boolean {
        val biometricManager = BiometricManager.from(activity)
        return biometricManager.canAuthenticate(BIOMETRIC_STRONG or DEVICE_CREDENTIAL) == BiometricManager.BIOMETRIC_SUCCESS
    }

    fun showBiometricPrompt(
        title: String = "Unlock Passward",
        subtitle: String = "Verify your fingerprint, face, or device PIN",
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(activity)

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setAllowedAuthenticators(BIOMETRIC_STRONG or DEVICE_CREDENTIAL)
            .build()

        val biometricPrompt = BiometricPrompt(
            activity,
            executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    onSuccess()
                }

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    onError(errString.toString())
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                }
            }
        )

        biometricPrompt.authenticate(promptInfo)
    }
}
`
  },
  {
    path: 'app/src/main/java/com/passward/app/data/PasswordEntity.kt',
    name: 'PasswordEntity.kt',
    language: 'kotlin',
    description: 'Encrypted Room Database entity for password records',
    content: `package com.passward.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "passwords")
data class PasswordEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val serviceName: String,
    val category: String, // website, app, email, wifi, financial, other
    val username: String,
    val encryptedPassword: ByteArray,
    val encryptedNotes: ByteArray? = null,
    val url: String = "",
    val isFavorite: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
`
  },
  {
    path: 'app/src/main/java/com/passward/app/data/PasswordDao.kt',
    name: 'PasswordDao.kt',
    language: 'kotlin',
    description: 'Room DAO for encrypted SQLite CRUD queries',
    content: `package com.passward.app.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface PasswordDao {

    @Query("SELECT * FROM passwords ORDER BY isFavorite DESC, serviceName ASC")
    fun getAllPasswords(): Flow<List<PasswordEntity>>

    @Query("SELECT * FROM passwords WHERE category = :category ORDER BY isFavorite DESC, serviceName ASC")
    fun getPasswordsByCategory(category: String): Flow<List<PasswordEntity>>

    @Query("SELECT * FROM passwords WHERE id = :id LIMIT 1")
    suspend fun getPasswordById(id: Long): PasswordEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPassword(password: PasswordEntity): Long

    @Update
    suspend fun updatePassword(password: PasswordEntity)

    @Delete
    suspend fun deletePassword(password: PasswordEntity)

    @Query("DELETE FROM passwords")
    suspend fun deleteAllPasswords()
}
`
  },
  {
    path: 'app/src/main/java/com/passward/app/data/AppDatabase.kt',
    name: 'AppDatabase.kt',
    language: 'kotlin',
    description: 'Room Database provider singleton',
    content: `package com.passward.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [PasswordEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {

    abstract fun passwordDao(): PasswordDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "passward_encrypted_vault.db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/passward/app/ui/theme/Color.kt',
    name: 'Color.kt',
    language: 'kotlin',
    description: 'Theme color palette for Material 3',
    content: `package com.passward.app.ui.theme

import androidx.compose.ui.graphics.Color

val IndigoPrimary = Color(0xFF4F46E5)
val IndigoDark = Color(0xFF4338CA)
val IndigoLight = Color(0xFF818CF8)
val DarkBackground = Color(0xFF0F172A)
val DarkSurface = Color(0xFF1E293B)
val LightBackground = Color(0xFFF8FAFC)
val LightSurface = Color(0xFFFFFFFF)
val EmeraldSuccess = Color(0xFF10B981)
val RoseError = Color(0xFFF43F5E)
`
  },
  {
    path: 'app/src/main/java/com/passward/app/ui/theme/Theme.kt',
    name: 'Theme.kt',
    language: 'kotlin',
    description: 'PasswardTheme Material 3 Composable wrapper',
    content: `package com.passward.app.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = IndigoPrimary,
    secondary = IndigoLight,
    background = DarkBackground,
    surface = DarkSurface,
    onPrimary = LightSurface,
    onBackground = LightSurface,
    onSurface = LightSurface
)

private val LightColorScheme = lightColorScheme(
    primary = IndigoPrimary,
    secondary = IndigoDark,
    background = LightBackground,
    surface = LightSurface,
    onPrimary = LightSurface,
    onBackground = DarkBackground,
    onSurface = DarkBackground
)

@Composable
fun PasswardTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = colorScheme.background.toArgb()
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}

@Composable
fun SaveMyPasswordTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    PasswardTheme(darkTheme = darkTheme, dynamicColor = dynamicColor, content = content)
}
`
  },
  {
    path: 'app/src/main/java/com/passward/app/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    description: 'Main Activity with FLAG_SECURE screenshot prevention & auto-lock lifecycle',
    content: `package com.passward.app

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.fragment.app.FragmentActivity
import com.passward.app.security.BiometricAuthManager
import com.passward.app.security.CryptoManager
import com.passward.app.ui.VaultApp
import com.passward.app.ui.theme.PasswardTheme

class MainActivity : FragmentActivity() {

    private lateinit var biometricAuthManager: BiometricAuthManager
    private val cryptoManager = CryptoManager()

    // State: whether the vault is currently unlocked by the device owner
    private val isUnlocked = mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // SECURITY: Prevent screenshots, screen recording, and task switcher previews!
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )

        enableEdgeToEdge()
        biometricAuthManager = BiometricAuthManager(this)

        setContent {
            val systemDark = androidx.compose.foundation.isSystemInDarkTheme()
            val isDarkThemeState = androidx.compose.runtime.remember { mutableStateOf<Boolean?>(null) }
            val currentDark = isDarkThemeState.value ?: systemDark

            PasswardTheme(darkTheme = currentDark) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    VaultApp(
                        isUnlocked = isUnlocked.value,
                        onRequestUnlock = { promptUnlock() },
                        onLockVault = { isUnlocked.value = false },
                        cryptoManager = cryptoManager,
                        isDarkTheme = currentDark,
                        onToggleTheme = {
                            isDarkThemeState.value = !currentDark
                        }
                    )
                }
            }
        }

        // Prompt biometric auth upon launch
        promptUnlock()
    }

    override fun onPause() {
        super.onPause()
        // Auto-lock whenever app goes into background or recents
        isUnlocked.value = false
    }

    private fun promptUnlock() {
        biometricAuthManager.showBiometricPrompt(
            title = "Unlock Passward",
            subtitle = "Biometric or Device PIN required to view passwords",
            onSuccess = {
                isUnlocked.value = true
            },
            onError = { _ ->
                isUnlocked.value = false
            }
        )
    }
}
`
  },
  {
    path: 'app/src/main/java/com/passward/app/ui/VaultScreens.kt',
    name: 'VaultScreens.kt',
    language: 'kotlin',
    description: 'Jetpack Compose Material 3 screens: Vault dashboard, FAB, Generator & Dialogs',
    content: `package com.passward.app.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.passward.app.data.AppDatabase
import com.passward.app.data.PasswordEntity
import com.passward.app.security.CryptoManager
import kotlinx.coroutines.launch
import kotlin.random.Random

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VaultApp(
    isUnlocked: Boolean,
    onRequestUnlock: () -> Unit,
    onLockVault: () -> Unit,
    cryptoManager: CryptoManager,
    isDarkTheme: Boolean = false,
    onToggleTheme: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val db = remember { AppDatabase.getDatabase(context) }
    val passwordDao = db.passwordDao()

    val passwordsFlow by passwordDao.getAllPasswords().collectAsState(initial = emptyList())
    var searchQuery by remember { mutableStateOf("") }
    var showFavoritesOnly by remember { mutableStateOf(false) }
    var showMenuDropdown by remember { mutableStateOf(false) }

    // Dialog States
    var showBackupDialog by remember { mutableStateOf(false) }
    var showAuditDialog by remember { mutableStateOf(false) }
    var showGeneratorDialog by remember { mutableStateOf(false) }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var showAddDialog by remember { mutableStateOf(false) }
    var editingPassword by remember { mutableStateOf<PasswordEntity?>(null) }
    var viewingPassword by remember { mutableStateOf<PasswordEntity?>(null) }

    if (!isUnlocked) {
        // Biometric Lock Screen
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(18.dp),
                modifier = Modifier.padding(24.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Fingerprint,
                        contentDescription = "Biometric Lock",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(56.dp)
                    )
                }

                Text(
                    text = "Passward",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )

                Text(
                    text = "Personal offline vault is locked",
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.outline
                )

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = onRequestUnlock,
                    shape = RoundedCornerShape(24.dp),
                    contentPadding = PaddingValues(horizontal = 24.dp, vertical = 14.dp)
                ) {
                    Icon(imageVector = Icons.Default.LockOpen, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Unlock Vault (Biometric / PIN)")
                }
            }
        }
    } else {
        // Vault Dashboard Screen
        val filteredPasswords = remember(passwordsFlow, searchQuery, showFavoritesOnly) {
            passwordsFlow.filter { item ->
                val matchesFavorite = !showFavoritesOnly || item.isFavorite
                val matchesSearch = searchQuery.isBlank() ||
                        item.serviceName.contains(searchQuery, ignoreCase = true) ||
                        item.username.contains(searchQuery, ignoreCase = true) ||
                        item.url.contains(searchQuery, ignoreCase = true)
                matchesFavorite && matchesSearch
            }
        }

        Scaffold(
            topBar = {
                TopAppBar(
                    navigationIcon = {
                        Box {
                            IconButton(onClick = { showMenuDropdown = true }) {
                                Icon(
                                    imageVector = Icons.Default.Menu,
                                    contentDescription = "Menu (☰)",
                                    modifier = Modifier.size(24.dp)
                                )
                            }

                            DropdownMenu(
                                expanded = showMenuDropdown,
                                onDismissRequest = { showMenuDropdown = false },
                                modifier = Modifier.width(260.dp)
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Backup & Restore", fontWeight = FontWeight.SemiBold) },
                                    leadingIcon = {
                                        Icon(Icons.Default.Folder, contentDescription = null, tint = Color(0xFF6366F1))
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        showBackupDialog = true
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Security Health Audit", fontWeight = FontWeight.SemiBold) },
                                    leadingIcon = {
                                        Icon(Icons.Default.Security, contentDescription = null, tint = Color(0xFF10B981))
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        showAuditDialog = true
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Password Generator", fontWeight = FontWeight.SemiBold) },
                                    leadingIcon = {
                                        Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color(0xFF818CF8))
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        showGeneratorDialog = true
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text(if (isDarkTheme) "Switch to Light Theme" else "Switch to Dark Theme", fontWeight = FontWeight.SemiBold) },
                                    leadingIcon = {
                                        Icon(
                                            if (isDarkTheme) Icons.Default.LightMode else Icons.Default.DarkMode,
                                            contentDescription = null,
                                            tint = if (isDarkTheme) Color(0xFFFBBF24) else Color(0xFF6366F1)
                                        )
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        onToggleTheme()
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Vault Settings", fontWeight = FontWeight.SemiBold) },
                                    leadingIcon = {
                                        Icon(Icons.Default.Settings, contentDescription = null)
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        showSettingsDialog = true
                                    }
                                )
                                HorizontalDivider()
                                DropdownMenuItem(
                                    text = { Text("Lock Vault Now", fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B)) },
                                    leadingIcon = {
                                        Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFFF59E0B))
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        onLockVault()
                                    }
                                )
                            }
                        }
                    },
                    title = {
                        Column {
                            Text("Passward", fontWeight = FontWeight.Black, fontSize = 22.sp, letterSpacing = (-0.5).sp)
                            Text(
                                "\${passwordsFlow.size} credentials · Encrypted Vault",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.outline
                            )
                        }
                    },
                    actions = {
                        // Quick Lock Button
                        IconButton(onClick = onLockVault) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Lock Now",
                                tint = Color(0xFFF59E0B),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                )
            },
            floatingActionButton = {
                FloatingActionButton(
                    onClick = { showAddDialog = true },
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Password")
                }
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp)
            ) {
                // Search Input Bar & Favorite Filter
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search services, usernames, notes...") },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Clear, contentDescription = "Clear")
                                }
                            }
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    IconButton(
                        onClick = { showFavoritesOnly = !showFavoritesOnly },
                        modifier = Modifier
                            .size(52.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                if (showFavoritesOnly) Color(0xFFF59E0B).copy(alpha = 0.15f)
                                else MaterialTheme.colorScheme.surfaceVariant
                            )
                    ) {
                        Icon(
                            imageVector = if (showFavoritesOnly) Icons.Default.Star else Icons.Default.StarBorder,
                            contentDescription = "Filter Favorites",
                            tint = if (showFavoritesOnly) Color(0xFFF59E0B) else MaterialTheme.colorScheme.outline
                        )
                    }
                }

                if (filteredPasswords.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(bottom = 60.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Icon(
                                Icons.Default.Key,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = MaterialTheme.colorScheme.outline
                            )
                            Text(
                                if (searchQuery.isNotBlank()) "No matching passwords found" else "Vault is empty",
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                            Text(
                                "Tap + to add your first encrypted credential",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.outline
                            )

                            if (passwordsFlow.isEmpty()) {
                                OutlinedButton(
                                    onClick = {
                                        coroutineScope.launch {
                                            // Seed initial demo passwords
                                            val samples = listOf(
                                                Triple("Google Account", "personal@gmail.com", "P@ssw0rd!Google2026"),
                                                Triple("GitHub", "developer", "ghp_SecureDevPass2026!"),
                                                Triple("Home Wi-Fi", "Router-5G", "SuperSecretWifi9876"),
                                                Triple("Netflix", "family@netflix.com", "StreamChill#2026")
                                            )
                                            samples.forEach { (svc, user, pass) ->
                                                passwordDao.insertPassword(
                                                    PasswordEntity(
                                                        serviceName = svc,
                                                        username = user,
                                                        category = if (svc.contains("Wi-Fi")) "wifi" else "website",
                                                        encryptedPassword = cryptoManager.encryptString(pass),
                                                        isFavorite = svc.contains("Google")
                                                    )
                                                )
                                            }
                                            Toast.makeText(context, "Sample passwords loaded!", Toast.LENGTH_SHORT).show()
                                        }
                                    },
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Icon(Icons.Default.AddCircleOutline, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Load Sample Passwords")
                                }
                            }
                        }
                    }
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(bottom = 80.dp)
                    ) {
                        items(filteredPasswords, key = { it.id }) { item ->
                            PasswordItemCard(
                                item = item,
                                cryptoManager = cryptoManager,
                                onClick = { viewingPassword = item },
                                onEdit = { editingPassword = item },
                                onToggleFavorite = {
                                    coroutineScope.launch {
                                        passwordDao.updatePassword(item.copy(isFavorite = !item.isFavorite))
                                    }
                                },
                                onDelete = {
                                    coroutineScope.launch {
                                        passwordDao.deletePassword(item)
                                        Toast.makeText(context, "Password deleted", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }

        // ==========================================
        // EDIT PASSWORD MODAL
        // ==========================================
        if (editingPassword != null) {
            val item = editingPassword!!
            val initialPass = remember(item.id) {
                try {
                    cryptoManager.decryptToString(item.encryptedPassword)
                } catch (_: Exception) {
                    ""
                }
            }
            EditPasswordDialog(
                item = item,
                initialPassword = initialPass,
                onDismiss = { editingPassword = null },
                onSave = { service, user, pass, cat, url ->
                    coroutineScope.launch {
                        val encryptedPass = cryptoManager.encryptString(pass)
                        passwordDao.updatePassword(
                            item.copy(
                                serviceName = service,
                                username = user,
                                category = cat,
                                url = url,
                                encryptedPassword = encryptedPass,
                                updatedAt = System.currentTimeMillis()
                            )
                        )
                        editingPassword = null
                        Toast.makeText(context, "Password updated successfully!", Toast.LENGTH_SHORT).show()
                    }
                }
            )
        }

        // ==========================================
        // VIEW PASSWORD DETAIL MODAL
        // ==========================================
        if (viewingPassword != null) {
            val item = viewingPassword!!
            PasswordDetailDialog(
                item = item,
                cryptoManager = cryptoManager,
                onDismiss = { viewingPassword = null },
                onEdit = {
                    val target = viewingPassword
                    viewingPassword = null
                    editingPassword = target
                },
                onDelete = {
                    coroutineScope.launch {
                        passwordDao.deletePassword(item)
                        viewingPassword = null
                        Toast.makeText(context, "Password deleted", Toast.LENGTH_SHORT).show()
                    }
                }
            )
        }

        // 1. BACKUP & RESTORE MODAL
        if (showBackupDialog) {
            BackupRestoreDialog(
                passwords = passwordsFlow,
                cryptoManager = cryptoManager,
                onDismiss = { showBackupDialog = false },
                onRestoreItem = { service, user, pass, cat ->
                    coroutineScope.launch {
                        val encryptedPass = cryptoManager.encryptString(pass)
                        passwordDao.insertPassword(
                            PasswordEntity(
                                serviceName = service,
                                username = user,
                                category = cat,
                                encryptedPassword = encryptedPass
                            )
                        )
                    }
                }
            )
        }

        // 2. SECURITY HEALTH AUDIT MODAL
        if (showAuditDialog) {
            SecurityAuditDialog(
                passwords = passwordsFlow,
                cryptoManager = cryptoManager,
                onDismiss = { showAuditDialog = false },
                onFixPassword = { flaggedEntity ->
                    showAuditDialog = false
                    editingPassword = flaggedEntity
                }
            )
        }

        // 3. STANDALONE PASSWORD GENERATOR MODAL
        if (showGeneratorDialog) {
            StandalonePasswordGeneratorDialog(
                onDismiss = { showGeneratorDialog = false }
            )
        }

        // 4. SETTINGS MODAL
        if (showSettingsDialog) {
            SettingsDialog(
                totalCredentials = passwordsFlow.size,
                isDarkTheme = isDarkTheme,
                onToggleTheme = onToggleTheme,
                onDismiss = { showSettingsDialog = false },
                onWipeAll = {
                    coroutineScope.launch {
                        passwordDao.deleteAllPasswords()
                        showSettingsDialog = false
                        Toast.makeText(context, "All passwords permanently erased", Toast.LENGTH_LONG).show()
                    }
                }
            )
        }

        // Add Password Modal
        if (showAddDialog) {
            AddPasswordDialog(
                onDismiss = { showAddDialog = false },
                onSave = { service, user, pass, cat, url ->
                    coroutineScope.launch {
                        val encryptedPass = cryptoManager.encryptString(pass)
                        passwordDao.insertPassword(
                            PasswordEntity(
                                serviceName = service,
                                username = user,
                                category = cat,
                                url = url,
                                encryptedPassword = encryptedPass
                            )
                        )
                        showAddDialog = false
                        Toast.makeText(context, "Password securely saved", Toast.LENGTH_SHORT).show()
                    }
                }
            )
        }
    }
}

// ==========================================
// EDIT PASSWORD DIALOG
// ==========================================
@Composable
fun EditPasswordDialog(
    item: PasswordEntity,
    initialPassword: String,
    onDismiss: () -> Unit,
    onSave: (service: String, user: String, pass: String, category: String, url: String) -> Unit
) {
    var serviceName by remember { mutableStateOf(item.serviceName) }
    var username by remember { mutableStateOf(item.username) }
    var password by remember { mutableStateOf(initialPassword) }
    var category by remember { mutableStateOf(item.category) }
    var url by remember { mutableStateOf(item.url) }
    var isPasswordVisible by remember { mutableStateOf(false) }

    val categories = listOf("website", "app", "email", "wifi", "financial", "other")

    fun generateRandomPassword(): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
        return (1..16).map { chars[Random.nextInt(chars.length)] }.joinToString("")
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Edit, contentDescription = null, tint = Color(0xFF6366F1))
                Text("Edit Password", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = serviceName,
                    onValueChange = { serviceName = it },
                    label = { Text("Service / Account Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("Username / Email") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        Row {
                            IconButton(onClick = { password = generateRandomPassword() }) {
                                Icon(Icons.Default.AutoAwesome, contentDescription = "Generate New", tint = Color(0xFF818CF8))
                            }
                            IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                                Icon(
                                    if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = null
                                )
                            }
                        }
                    }
                )

                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text("Website URL (Optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (serviceName.isNotBlank() && password.isNotBlank()) {
                        onSave(serviceName.trim(), username.trim(), password.trim(), category, url.trim())
                    }
                },
                enabled = serviceName.isNotBlank() && password.isNotBlank()
            ) {
                Text("Save Changes")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

// ==========================================
// PASSWORD DETAIL VIEW DIALOG
// ==========================================
@Composable
fun PasswordDetailDialog(
    item: PasswordEntity,
    cryptoManager: CryptoManager,
    onDismiss: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val context = LocalContext.current
    var isPasswordVisible by remember { mutableStateOf(false) }
    var decryptedPassword by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(item.id) {
        try {
            decryptedPassword = cryptoManager.decryptToString(item.encryptedPassword)
        } catch (_: Exception) {
            decryptedPassword = "Error decrypting"
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(item.serviceName, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Text("OFFLINE CREDENTIAL", fontSize = 11.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                }
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit Password", tint = Color(0xFF6366F1))
                }
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Username Card
                ElevatedCard(shape = RoundedCornerShape(12.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Username / Login", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                            Text(item.username, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                        }
                        IconButton(onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("username", item.username))
                            Toast.makeText(context, "Username copied!", Toast.LENGTH_SHORT).show()
                        }) {
                            Icon(Icons.Default.ContentCopy, contentDescription = "Copy Username", modifier = Modifier.size(18.dp))
                        }
                    }
                }

                // Password Card
                ElevatedCard(shape = RoundedCornerShape(12.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Encrypted Password", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                            Text(
                                text = if (isPasswordVisible) (decryptedPassword ?: "••••••••") else "••••••••",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        Row {
                            IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                                Icon(
                                    if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = "Toggle",
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                            IconButton(onClick = {
                                val pwd = decryptedPassword ?: ""
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                clipboard.setPrimaryClip(ClipData.newPlainText("password", pwd))
                                Toast.makeText(context, "Password copied to clipboard!", Toast.LENGTH_SHORT).show()
                            }) {
                                Icon(Icons.Default.ContentCopy, contentDescription = "Copy", modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }

                if (item.url.isNotBlank()) {
                    ElevatedCard(shape = RoundedCornerShape(12.dp)) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Website URL", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                                Text(item.url, fontSize = 13.sp, color = MaterialTheme.colorScheme.primary)
                            }
                            IconButton(onClick = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                clipboard.setPrimaryClip(ClipData.newPlainText("url", item.url))
                                Toast.makeText(context, "URL copied!", Toast.LENGTH_SHORT).show()
                            }) {
                                Icon(Icons.Default.ContentCopy, contentDescription = "Copy URL", modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = onEdit) {
                Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Edit")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDelete,
                colors = ButtonDefaults.textButtonColors(contentColor = Color(0xFFEF4444))
            ) {
                Icon(Icons.Default.DeleteOutline, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Delete")
            }
        }
    )
}

// ==========================================
// 1. BACKUP & RESTORE MODAL (FolderArchive)
// ==========================================
@Composable
fun BackupRestoreDialog(
    passwords: List<PasswordEntity>,
    cryptoManager: CryptoManager,
    onDismiss: () -> Unit,
    onRestoreItem: (service: String, user: String, pass: String, category: String) -> Unit
) {
    val context = LocalContext.current
    var importText by remember { mutableStateOf("") }
    var showImportField by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Folder, contentDescription = null, tint = Color(0xFF6366F1))
                Text("Backup & Restore", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Export your encrypted passwords to keep a local backup, or restore an existing backup file.",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.outline
                )

                ElevatedCard(shape = RoundedCornerShape(14.dp)) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Export Local Backup", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(
                            "\${passwords.size} credentials ready to export",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.outline
                        )
                        Button(
                            onClick = {
                                try {
                                    val sb = StringBuilder()
                                    sb.append("[\\n")
                                    passwords.forEachIndexed { index, p ->
                                        val decrypted = try { cryptoManager.decryptToString(p.encryptedPassword) } catch (_: Exception) { "" }
                                        sb.append("  {\\"service\\":\\"\${p.serviceName}\\",\\"user\\":\\"\${p.username}\\",\\"pass\\":\\"$decrypted\\",\\"cat\\":\\"\${p.category}\\"}")
                                        if (index < passwords.size - 1) sb.append(",")
                                        sb.append("\\n")
                                    }
                                    sb.append("]")

                                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(Intent.EXTRA_SUBJECT, "Passward_Backup_\${System.currentTimeMillis()}.json")
                                        putExtra(Intent.EXTRA_TEXT, sb.toString())
                                    }
                                    context.startActivity(Intent.createChooser(shareIntent, "Save or Share Vault Backup"))
                                } catch (_: Exception) {
                                    Toast.makeText(context, "Export error", Toast.LENGTH_SHORT).show()
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Export Backup JSON")
                        }
                    }
                }

                ElevatedCard(shape = RoundedCornerShape(14.dp)) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Restore From Backup", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        if (!showImportField) {
                            OutlinedButton(
                                onClick = { showImportField = true },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.Upload, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Import / Paste JSON")
                            }
                        } else {
                            OutlinedTextField(
                                value = importText,
                                onValueChange = { importText = it },
                                placeholder = { Text("Paste JSON backup array here...") },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(100.dp),
                                textStyle = LocalTextStyle.current.copy(fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                            )
                            Button(
                                onClick = {
                                    try {
                                        var restoredCount = 0
                                        val pattern = Regex("""\\{"service":"(.*?)","user":"(.*?)","pass":"(.*?)","cat":"(.*?)"\\}""")
                                        pattern.findAll(importText).forEach { match ->
                                            val (svc, user, pass, cat) = match.destructured
                                            onRestoreItem(svc, user, pass, cat)
                                            restoredCount++
                                        }
                                        if (restoredCount > 0) {
                                            Toast.makeText(context, "Restored $restoredCount passwords!", Toast.LENGTH_SHORT).show()
                                            onDismiss()
                                        } else {
                                            Toast.makeText(context, "No valid records found in JSON", Toast.LENGTH_SHORT).show()
                                        }
                                    } catch (_: Exception) {
                                        Toast.makeText(context, "Failed to parse JSON backup", Toast.LENGTH_SHORT).show()
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(),
                                enabled = importText.isNotBlank()
                            ) {
                                Text("Restore Passwords")
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

// ==========================================
// 2. SECURITY HEALTH AUDIT MODAL (ShieldCheck)
// ==========================================
@Composable
fun SecurityAuditDialog(
    passwords: List<PasswordEntity>,
    cryptoManager: CryptoManager,
    onDismiss: () -> Unit,
    onFixPassword: (PasswordEntity) -> Unit = {}
) {
    var weakCount by remember { mutableStateOf(0) }
    var reusedCount by remember { mutableStateOf(0) }
    var strongCount by remember { mutableStateOf(0) }
    val flaggedList = remember { mutableStateListOf<Triple<PasswordEntity, String, String>>() }

    LaunchedEffect(passwords) {
        var weak = 0
        val passFrequency = mutableMapOf<String, Int>()
        val decryptedCache = mutableListOf<Pair<PasswordEntity, String>>()

        passwords.forEach { p ->
            val plain = try { cryptoManager.decryptToString(p.encryptedPassword) } catch (_: Exception) { "" }
            decryptedCache.add(Pair(p, plain))
            if (plain.isNotEmpty()) {
                passFrequency[plain] = (passFrequency[plain] ?: 0) + 1
            }
        }

        flaggedList.clear()
        decryptedCache.forEach { (entity, plain) ->
            var issue: String? = null
            if (plain.length < 8) {
                issue = "Weak (under 8 chars)"
                weak++
            } else if (!plain.any { it.isDigit() } || !plain.any { it.isUpperCase() }) {
                issue = "Moderate (needs digits/caps)"
                weak++
            }

            val freq = passFrequency[plain] ?: 1
            if (freq > 1) {
                issue = if (issue != null) "$issue · Reused" else "Reused password ($freq accounts)"
            }

            if (issue != null) {
                flaggedList.add(Triple(entity, entity.serviceName, issue))
            }
        }

        weakCount = weak
        reusedCount = passFrequency.values.count { it > 1 }
        strongCount = (passwords.size - weak).coerceAtLeast(0)
    }

    val healthScore = remember(passwords.size, weakCount, reusedCount) {
        if (passwords.isEmpty()) 100
        else {
            val score = 100 - (weakCount * 15) - (reusedCount * 20)
            score.coerceIn(10, 100)
        }
    }

    val scoreColor = when {
        healthScore >= 80 -> Color(0xFF10B981)
        healthScore >= 50 -> Color(0xFFF59E0B)
        else -> Color(0xFFEF4444)
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Security, contentDescription = null, tint = Color(0xFF10B981))
                Text("Security Health Audit", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Score Banner
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = scoreColor.copy(alpha = 0.12f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Vault Health Score", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(
                                if (healthScore >= 80) "Vault is well secured" else "Attention recommended",
                                fontSize = 12.sp,
                                color = scoreColor
                            )
                        }
                        Text(
                            text = "$healthScore%",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = scoreColor
                        )
                    }
                }

                // Stats breakdown
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    ElevatedCard(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp)) {
                        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("$strongCount", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF10B981))
                            Text("Strong", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                        }
                    }
                    ElevatedCard(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp)) {
                        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("$weakCount", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFFEF4444))
                            Text("Weak", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                        }
                    }
                    ElevatedCard(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp)) {
                        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("$reusedCount", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFFF59E0B))
                            Text("Reused", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                        }
                    }
                }

                // Flagged entries
                if (flaggedList.isNotEmpty()) {
                    Text("Attention Needed:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    flaggedList.take(6).forEach { (entity, svc, issue) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                .padding(8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(svc, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                Text(issue, fontSize = 11.sp, color = Color(0xFFEF4444))
                            }
                            TextButton(onClick = { onFixPassword(entity) }) {
                                Text("Fix / Edit", fontSize = 12.sp)
                            }
                        }
                    }
                } else {
                    Text(
                        "All \${passwords.size} passwords have strong entropy and no reused credentials!",
                        fontSize = 12.sp,
                        color = Color(0xFF10B981)
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Done")
            }
        }
    )
}

// ==========================================
// 3. PASSWORD GENERATOR MODAL (Sparkles)
// ==========================================
@Composable
fun StandalonePasswordGeneratorDialog(
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var length by remember { mutableStateOf(16f) }
    var useUppercase by remember { mutableStateOf(true) }
    var useNumbers by remember { mutableStateOf(true) }
    var useSymbols by remember { mutableStateOf(true) }
    var generatedPassword by remember { mutableStateOf("") }

    fun generate() {
        val lower = "abcdefghijklmnopqrstuvwxyz"
        val upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        val digits = "0123456789"
        val symbols = "!@#$%^&*()-_=+[]{}<>?"

        val pool = StringBuilder(lower)
        if (useUppercase) pool.append(upper)
        if (useNumbers) pool.append(digits)
        if (useSymbols) pool.append(symbols)

        val chars = pool.toString()
        generatedPassword = (1..length.toInt()).map { chars[Random.nextInt(chars.length)] }.joinToString("")
    }

    LaunchedEffect(Unit) {
        generate()
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color(0xFF818CF8))
                Text("Password Generator", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = generatedPassword,
                            fontSize = 17.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = { generate() }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Regenerate")
                        }
                    }
                }

                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Length: \${length.toInt()} characters", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        val strength = when {
                            length >= 16 -> "Very Strong"
                            length >= 12 -> "Strong"
                            else -> "Moderate"
                        }
                        Text(strength, fontSize = 12.sp, color = Color(0xFF10B981), fontWeight = FontWeight.Bold)
                    }
                    Slider(
                        value = length,
                        onValueChange = {
                            length = it
                            generate()
                        },
                        valueRange = 8f..32f,
                        steps = 23
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Uppercase (A-Z)", fontSize = 13.sp)
                    Switch(checked = useUppercase, onCheckedChange = { useUppercase = it; generate() })
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Numbers (0-9)", fontSize = 13.sp)
                    Switch(checked = useNumbers, onCheckedChange = { useNumbers = it; generate() })
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Symbols (!@#$)", fontSize = 13.sp)
                    Switch(checked = useSymbols, onCheckedChange = { useSymbols = it; generate() })
                }

                Button(
                    onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        val clip = ClipData.newPlainText("Generated Password", generatedPassword)
                        clipboard.setPrimaryClip(clip)
                        Toast.makeText(context, "Password copied to clipboard!", Toast.LENGTH_SHORT).show()
                        onDismiss()
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Copy Password")
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

// ==========================================
// 4. SETTINGS MODAL (Gear)
// ==========================================
@Composable
fun SettingsDialog(
    totalCredentials: Int,
    isDarkTheme: Boolean,
    onToggleTheme: () -> Unit,
    onDismiss: () -> Unit,
    onWipeAll: () -> Unit
) {
    var confirmWipe by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Settings, contentDescription = null)
                Text("Vault Settings", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Theme Toggle Card
                ElevatedCard(shape = RoundedCornerShape(14.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Theme Appearance", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text(if (isDarkTheme) "Dark Mode active" else "Light Mode active", fontSize = 12.sp, color = MaterialTheme.colorScheme.outline)
                        }
                        IconButton(onClick = onToggleTheme) {
                            Icon(
                                if (isDarkTheme) Icons.Default.LightMode else Icons.Default.DarkMode,
                                contentDescription = "Toggle Theme",
                                tint = if (isDarkTheme) Color(0xFFFBBF24) else Color(0xFF6366F1)
                            )
                        }
                    }
                }

                // Security status
                ElevatedCard(shape = RoundedCornerShape(14.dp)) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Security Architecture", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(16.dp))
                            Text("Hardware KeyStore AES-256 Active", fontSize = 12.sp)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(16.dp))
                            Text("FLAG_SECURE Anti-Screenshot Active", fontSize = 12.sp)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(16.dp))
                            Text("100% Offline (Zero INTERNET permission)", fontSize = 12.sp)
                        }
                    }
                }

                // Vault info
                ElevatedCard(shape = RoundedCornerShape(14.dp)) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Storage Stats", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("$totalCredentials encrypted credentials saved locally", fontSize = 12.sp, color = MaterialTheme.colorScheme.outline)
                        Text("Database: SQLite Room (Hardware Keystore Encrypted)", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                    }
                }

                // Wipe Vault
                if (!confirmWipe) {
                    OutlinedButton(
                        onClick = { confirmWipe = true },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFEF4444)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.DeleteForever, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Erase Entire Local Vault")
                    }
                } else {
                    Button(
                        onClick = onWipeAll,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Confirm Permanent Erase (\${totalCredentials} items)")
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

// ==========================================
// PASSWORD ITEM CARD
// ==========================================
@Composable
fun PasswordItemCard(
    item: PasswordEntity,
    cryptoManager: CryptoManager,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onToggleFavorite: () -> Unit,
    onDelete: () -> Unit
) {
    val context = LocalContext.current
    var isPasswordVisible by remember { mutableStateOf(false) }
    var decryptedPassword by remember { mutableStateOf<String?>(null) }

    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.serviceName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = item.username,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.outline
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Favorite star
                    IconButton(onClick = onToggleFavorite, modifier = Modifier.size(34.dp)) {
                        Icon(
                            imageVector = if (item.isFavorite) Icons.Default.Star else Icons.Default.StarBorder,
                            contentDescription = "Favorite",
                            tint = if (item.isFavorite) Color(0xFFF59E0B) else MaterialTheme.colorScheme.outline
                        )
                    }
                    // Edit Button
                    IconButton(onClick = onEdit, modifier = Modifier.size(34.dp)) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit",
                            tint = Color(0xFF6366F1),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    // Delete Button
                    IconButton(onClick = onDelete, modifier = Modifier.size(34.dp)) {
                        Icon(
                            imageVector = Icons.Default.DeleteOutline,
                            contentDescription = "Delete",
                            tint = MaterialTheme.colorScheme.outline,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Password row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isPasswordVisible) (decryptedPassword ?: "••••••••") else "••••••••",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Row {
                    IconButton(
                        onClick = {
                            if (!isPasswordVisible && decryptedPassword == null) {
                                try {
                                    decryptedPassword = cryptoManager.decryptToString(item.encryptedPassword)
                                } catch (_: Exception) {
                                    decryptedPassword = "Error decrypting"
                                }
                            }
                            isPasswordVisible = !isPasswordVisible
                        },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = "Toggle visibility",
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    IconButton(
                        onClick = {
                            try {
                                val pwd = decryptedPassword ?: cryptoManager.decryptToString(item.encryptedPassword)
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val clip = ClipData.newPlainText("password", pwd)
                                clipboard.setPrimaryClip(clip)
                                Toast.makeText(context, "Password copied to clipboard", Toast.LENGTH_SHORT).show()
                            } catch (_: Exception) {
                                Toast.makeText(context, "Failed to copy", Toast.LENGTH_SHORT).show()
                            }
                        },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ContentCopy,
                            contentDescription = "Copy Password",
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}

// ==========================================
// ADD PASSWORD DIALOG
// ==========================================
@Composable
fun AddPasswordDialog(
    onDismiss: () -> Unit,
    onSave: (service: String, user: String, pass: String, category: String, url: String) -> Unit
) {
    var serviceName by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("website") }
    var url by remember { mutableStateOf("") }
    var isPasswordVisible by remember { mutableStateOf(false) }

    val categories = listOf("website", "app", "email", "wifi", "financial", "other")

    fun generateRandomPassword(): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
        return (1..16).map { chars[Random.nextInt(chars.length)] }.joinToString("")
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add New Password", fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = serviceName,
                    onValueChange = { serviceName = it },
                    label = { Text("Service / App Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("Username / Email") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        Row {
                            IconButton(onClick = { password = generateRandomPassword() }) {
                                Icon(Icons.Default.AutoAwesome, contentDescription = "Generate", tint = Color(0xFF818CF8))
                            }
                            IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                                Icon(
                                    if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = null
                                )
                            }
                        }
                    }
                )

                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text("Website URL (Optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (serviceName.isNotBlank() && password.isNotBlank()) {
                        onSave(serviceName.trim(), username.trim(), password.trim(), category, url.trim())
                    }
                },
                enabled = serviceName.isNotBlank() && password.isNotBlank()
            ) {
                Text("Save Encrypted")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    description: 'Instructions on building and installing the native debug APK',
    content: `# Passward — Android Native Offline Vault (Kotlin + Jetpack Compose)

100% offline personal password manager built natively for Android (API 26–34) using Kotlin, Jetpack Compose, Room, BiometricPrompt, and hardware-backed Android KeyStore AES-256.

## How to Open in Android Studio
1. Open Android Studio (Hedgehog, Iguana, Koala, or newer).
2. Click **Open** and select this directory.
3. Gradle 8.4 will automatically sync.

## How to Run on Physical Phone
1. Enable **Developer options** and **USB debugging** on your phone (Settings > About phone > tap Build number 7 times).
2. Connect your phone via USB cable and allow the prompt.
3. Click the green **Run (Play)** button in Android Studio.
`
  },
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml',
    language: 'groovy',
    description: 'GitHub Actions workflow to automatically compile and release Android APK',
    content: `name: Build Passward APK

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up Java JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'gradle'

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v3

      - name: Build Debug APK
        run: |
          if [ -f "./gradlew" ]; then
            chmod +x gradlew
            ./gradlew assembleDebug --no-daemon --stacktrace
          else
            gradle assembleDebug --no-daemon --stacktrace
          fi

      - name: Upload APK as Artifact
        uses: actions/upload-artifact@v4
        with:
          name: Passward-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk
          retention-days: 30
`
  }
];
