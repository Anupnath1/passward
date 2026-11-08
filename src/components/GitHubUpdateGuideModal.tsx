import React, { useState } from 'react';
import { 
  X, 
  GitBranch, 
  Terminal, 
  Copy, 
  Check, 
  ShieldCheck, 
  Download, 
  Lock, 
  Play, 
  Smartphone,
  ExternalLink,
  HelpCircle,
  FileCode2,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { triggerHaptic } from '../utils/biometrics';
import { downloadAndroidProjectZip } from '../utils/zipExport';

interface GitHubUpdateGuideModalProps {
  onClose: () => void;
}

export const GitHubUpdateGuideModal: React.FC<GitHubUpdateGuideModalProps> = ({ onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleCopy = (text: string, index: number) => {
    triggerHaptic('tap');
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    triggerHaptic('success');
    try {
      await downloadAndroidProjectZip();
    } catch {
      alert('Failed to package project zip.');
    } finally {
      setIsDownloading(false);
    }
  };

  const gitignoreContent = `# Android / Gradle ignores
.gradle/
build/
app/build/
*.iml
.idea/
local.properties
.DS_Store

# KeyStore files (NEVER commit signing keys)
*.jks
*.keystore
release-key.properties

# Secrets
.env
.env.local
node_modules/
dist/
`;

  const githubActionWorkflow = `name: Build Passward APK

on:
  push:
    tags:
      - 'v*' # Triggers whenever you push a version tag like v1.0.1, v1.1.0
  workflow_dispatch: # Allows manual one-click trigger from GitHub Actions tab

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

      - name: Upload APK as Artifact (Direct Download to Laptop)
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
`;

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full max-w-2xl max-h-[calc(100%-1rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-auto"
      >
        {/* Top Header - Fixed & Rock-solid */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Private GitHub & Sideload Update Guide
                </h3>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  No Play Store Needed
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Private version control · Auto APK builds · Zero data loss updates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 shrink-0 rounded-full bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="px-5 pt-3 pb-2 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          {[
            { num: 1, label: '1. Create Private Repo' },
            { num: 2, label: '2. Push Source Code' },
            { num: 3, label: '3. GitHub Actions APK' },
            { num: 4, label: '4. Update On Phone' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                triggerHaptic('tap');
                setActiveStep(s.num);
              }}
              className={`py-2 px-3 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeStep === s.num
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          
          {/* STEP 1 */}
          {activeStep === 1 && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Step 1: Create a Private Repository on GitHub
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Keeping your password manager code in a <strong>Private</strong> GitHub repository ensures that only you have access to your custom builds, release notes, and updates.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3.5 bg-slate-100/60 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Go to GitHub and click "New repository"</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Visit <strong>github.com/new</strong> in your browser.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/60 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Name your repository and select "Private"</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      e.g., <code className="font-mono font-bold text-indigo-700 dark:text-indigo-300">passward-android</code>. Crucial: Mark the radio button as <strong>Private</strong> so no one else can view your code.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/60 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Do NOT add README or .gitignore yet</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Leave "Add a README file" unchecked so your repository starts empty and ready for your first commit. Click <strong>Create repository</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {activeStep === 2 && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Step 2: Initialize Git & Push Initial Code
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Download the project files from this app, extract the folder, and run these commands in your computer's terminal:
                </p>
              </div>

              {/* Terminal Snippet */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-slate-200 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span>Terminal / Command Prompt</span>
                  <button
                    onClick={() => handleCopy(`git init\ngit add .\ngit commit -m "feat: initial Passward release"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/passward-android.git\ngit push -u origin main`, 1)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 1 ? 'Copied Commands' : 'Copy All'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto whitespace-pre text-[11px] leading-relaxed select-all">
{`# 1. Initialize git
git init

# 2. Stage all files (using the provided .gitignore)
git add .

# 3. Create your initial commit
git commit -m "feat: initial Passward offline vault v1.0.0"

# 4. Set branch to main and connect to your private repo
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/passward-android.git

# 5. Push code
git push -u origin main`}
                </pre>
              </div>

              {/* Gitignore helper */}
              <div className="p-3 bg-slate-100/80 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Pre-configured .gitignore</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Protects keys and build artifacts from accidental upload</span>
                </div>
                <button
                  onClick={() => handleCopy(gitignoreContent, 2)}
                  className="py-1 px-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 2 ? 'Copied' : 'Copy .gitignore'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {activeStep === 3 && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Step 3: Auto-Build APK with GitHub Actions (Free & Cloud-Based)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  You don't even need Android Studio installed on your computer! GitHub Actions can automatically compile the Android APK in the cloud whenever you push a version tag.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-slate-200 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span>File: .github/workflows/build-apk.yml</span>
                  <button
                    onClick={() => handleCopy(githubActionWorkflow, 3)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 3 ? 'Copied Workflow' : 'Copy Workflow File'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto whitespace-pre text-[11px] leading-relaxed max-h-56 select-all">
                  {githubActionWorkflow}
                </pre>
              </div>

              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/70 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>How to trigger an automated APK build:</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  Run <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded font-mono font-bold">git tag v1.0.1 && git push origin v1.0.1</code>. GitHub will build the APK and place it under your repository's <strong>Releases</strong> tab in ~2 minutes!
                </p>
              </div>

              {/* Troubleshooting: Missing APK in Assets */}
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/70 text-xs text-amber-950 dark:text-amber-200 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Only seeing "Source code (zip)" and NO APK?</span>
                </p>
                <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-200">
                  1. In your GitHub repository, go to <strong>Settings &gt; Actions &gt; General</strong>.<br />
                  2. Scroll down to <strong>Workflow permissions</strong> and select <strong>"Read and write permissions"</strong>, then click <strong>Save</strong>.<br />
                  3. Make sure the file <code className="font-mono font-bold">.github/workflows/build-apk.yml</code> exists in your repository branch. Click your repo's <strong>Actions</strong> tab to see build progress or download the APK directly from <strong>Artifacts</strong>!
                </p>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {activeStep === 4 && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/70 space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Step 4: Update Directly on Your Phone (Zero Data Loss)
                  </h4>
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
                  Here is how you download and update Passward on your phone whenever you make improvements:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Always Export a Backup First (.passward)
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Open <strong>Passward &gt; Backup Center &gt; Download .passward Backup</strong>. Store it in your Downloads or Google Drive.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Open your Private GitHub Repo in Mobile Chrome
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Go to <code className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">github.com/YOUR_USERNAME/passward-android/releases</code> and tap on the newest <code className="font-mono font-bold">app-debug.apk</code> to download.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Tap the downloaded APK and select "Update"
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      <strong>Do NOT uninstall the app!</strong> Tap the notification or open your phone's <em>Files / Downloads</em> folder, click the APK, and tap <strong>Update</strong>. Android will replace the binary while keeping your encrypted database and passwords completely intact!
                    </p>
                  </div>
                </div>
              </div>

              {/* Why Data Is Preserved Box */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Why Android retains your passwords:</span>
                Android packages are identified by their unique <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">applicationId</code> (<code className="font-mono">com.passward.app</code>). When an APK with the same ID and key is installed over an existing one, the Android package manager performs an in-place upgrade, preserving <code className="font-mono">/data/data/com.passward.app/databases/</code> and Keystore keys.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 sticky bottom-0 z-10">
          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Packaging...' : 'Download Ready-to-Push Repo (.ZIP)'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Got It
          </button>
        </div>
      </motion.div>
    </div>
  );
};
