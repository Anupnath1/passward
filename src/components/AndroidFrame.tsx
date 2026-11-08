import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium 
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
