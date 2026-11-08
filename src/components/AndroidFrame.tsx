import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Lock, 
  Smartphone, 
  Maximize2, 
  ShieldCheck, 
  Code2,
  Moon,
  Sun,
  EyeOff
} from 'lucide-react';
import { ThemeMode } from '../types/vault';

interface AndroidFrameProps {
  children: React.ReactNode;
  isUnlocked: boolean;
  onLockVault: () => void;
  onSimulateBackground: () => void;
  onOpenAndroidSource: () => void;
  onOpenInstallGuide: () => void;
  onOpenBackupRestore?: () => void;
  onOpenGitHubGuide?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  displayMode: 'phone-frame' | 'responsive';
  onToggleDisplayMode: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isUnlocked,
  onLockVault,
  onSimulateBackground,
  onOpenAndroidSource,
  onOpenInstallGuide,
  onOpenBackupRestore,
  onOpenGitHubGuide,
  theme,
  onToggleTheme,
  displayMode,
  onToggleDisplayMode,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 transition-colors duration-200">
      
      {/* Top Utility Controls Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-4 mb-3 px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Passward
            </h1>
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Offline Vault · Keystore AES-256
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
          {/* Backup & Restore */}
          {onOpenBackupRestore && (
            <button
              onClick={onOpenBackupRestore}
              title="Backup and Restore Passwords"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Backup</span>
            </button>
          )}

          {/* GitHub Guide */}
          {onOpenGitHubGuide && (
            <button
              onClick={onOpenGitHubGuide}
              title="Private GitHub Setup & Update Guide"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span>GitHub &amp; Updates</span>
            </button>
          )}

          {/* Install on Phone */}
          <button
            onClick={onOpenInstallGuide}
            title="Install and use directly on your phone"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/70 border border-indigo-200 dark:border-indigo-800/80 rounded-xl shadow-2xs transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Install on Phone</span>
            <span className="xs:hidden">Install</span>
          </button>

          {/* Simulate background lock */}
          {isUnlocked && (
            <button
              onClick={onSimulateBackground}
              title="Test Auto-Lock by sending app to background"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Simulate Background</span>
            </button>
          )}

          {/* Quick Lock */}
          {isUnlocked && (
            <button
              onClick={onLockVault}
              title="Lock Vault Now"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900/70 rounded-xl transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          )}

          {/* Android Source Code & APK Project */}
          <button
            onClick={onOpenAndroidSource}
            title="Inspect Android 14 Kotlin source and build APK"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Source &amp; APK</span>
            <span className="sm:hidden">APK</span>
          </button>

          {/* Frame vs Full Responsive Toggle */}
          <button
            onClick={onToggleDisplayMode}
            title={displayMode === 'phone-frame' ? 'Switch to Full Screen View' : 'Switch to Pixel 8 Pro Frame'}
            className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            {displayMode === 'phone-frame' ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title="Toggle Light / Dark Mode"
            className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container: Pixel Phone Frame or Fullscreen */}
      {displayMode === 'phone-frame' ? (
        <div className="relative w-full max-w-[412px] h-[860px] max-h-[calc(100vh-5.5rem)] bg-slate-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800/80 flex flex-col justify-between select-none">
          {/* Speaker Ear Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-700/60 rounded-full z-30" />

          {/* Inner Screen */}
          <div className="relative w-full h-full bg-white dark:bg-slate-950 rounded-[34px] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800/80 shadow-inner">
            
            {/* Android 14 Status Bar */}
            <div className="w-full h-8 px-6 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 z-20 shrink-0 select-none">
              <span className="tabular-nums tracking-tight">{currentTime}</span>
              
              {/* Front Camera Cutout */}
              <div className="w-3.5 h-3.5 rounded-full bg-slate-950 dark:bg-black ring-2 ring-slate-800/40" />

              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Wifi className="w-3.5 h-3.5" />
                <BatteryMedium className="w-4 h-4" />
              </div>
            </div>

            {/* Screen Content Body */}
            <div className="flex-1 w-full overflow-hidden relative flex flex-col">
              {children}
            </div>

            {/* Android 14 Gesture Navigation Bar */}
            <div className="w-full h-5 flex items-center justify-center shrink-0 z-20 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xs select-none">
              <div className="w-32 h-1 bg-slate-400/60 dark:bg-slate-600/70 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* Full-Width / Responsive Layout */
        <main className="w-full max-w-4xl flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-250 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {children}
        </main>
      )}

      {/* Clean Minimal Footer */}
      <footer className="mt-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
        Passward · Encrypted Personal Vault
      </footer>
    </div>
  );
};
