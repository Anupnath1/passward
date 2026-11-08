import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root folder
  const root = zip.folder('Passward-Android');
  if (!root) return;

  // Add all files
  for (const file of ANDROID_PROJECT_FILES) {
    root.file(file.path, file.content);
  }

  // Add .gitignore
  root.file(
    '.gitignore',
    `# Android & Gradle
.gradle/
build/
app/build/
*.iml
.idea/
local.properties
.DS_Store

# Keystores & Signing
*.jks
*.keystore
release-key.properties

# Secrets
.env
node_modules/
dist/
`
  );

  // Add GitHub Actions workflow for automatic APK building
  root.file(
    '.github/workflows/build-apk.yml',
    `name: Build Passward APK

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

      - name: Check for Android Project Files
        run: |
          if [ ! -d "app" ]; then
            echo "::error title=Missing Android Source Code::The 'app' folder was not found in your repository! Please upload the extracted Android project files (including 'app', 'gradlew', and 'build.gradle.kts') to this repository."
            exit 1
          fi

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

      - name: Upload APK as Artifact (Direct Laptop Download)
        uses: actions/upload-artifact@v4
        with:
          name: Passward-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk
          retention-days: 30

      - name: Create GitHub Release & Upload APK
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/')
        with:
          name: Passward \${{ github.ref_name }}
          draft: false
          prerelease: false
          files: app/build/outputs/apk/debug/app-debug.apk
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`
  );

  // Add settings.gradle.kts
  root.file(
    'settings.gradle.kts',
    `pluginManagement {
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
  );

  // Add root build.gradle.kts
  root.file(
    'build.gradle.kts',
    `plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
    id("com.google.devtools.ksp") version "2.0.21-1.0.28" apply false
}
`
  );

  // Add gradle wrapper properties
  root.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.10.2-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  // Generate zip blob and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'Passward-Android-Project.zip';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
