import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Monitor, 
  Clock, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  KeyRound,
  Smartphone,
  ChevronRight,
  Code2
} from 'lucide-react';
import { motion } from 'motion/react';
import { VaultSettings, ThemeMode, EncryptedVaultEnvelope } from '../types/vault';
import { exportVaultBackupFile } from '../utils/storage';
import { triggerHaptic } from '../utils/biometrics';

interface SettingsModalProps {
  settings: VaultSettings;
  onUpdateSettings: (newSettings: VaultSettings) => void;
  vaultEnvelope: EncryptedVaultEnvelope | null;
  onImportBackup: (importedEnvelope: EncryptedVaultEnvelope) => void;
  onWipeVault: () => void;
  onClose: () => void;
  onOpenInstallGuide?: () => void;
  onOpenBackupRestore?: () => void;
  onOpenGitHubGuide?: () => void;
  onOpenAndroidSource?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  vaultEnvelope,
  onImportBackup,
  onWipeVault,
  onClose,
  onOpenInstallGuide,
  onOpenBackupRestore,
  onOpenGitHubGuide,
  onOpenAndroidSource,
}) => {
  const [confirmWipe, setConfirmWipe] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState<boolean>(false);

  const handleThemeChange = (mode: ThemeMode) => {
    triggerHaptic('tap');
    onUpdateSettings({ ...settings, theme: mode });
  };

  const handleAutoLockChange = (seconds: number) => {
    triggerHaptic('tap');
    onUpdateSettings({ ...settings, autoLockTimeoutSeconds: seconds });
  };

  const handleClipboardClearChange = (seconds: number) => {
    triggerHaptic('tap');
    onUpdateSettings({ ...settings, clipboardClearSeconds: seconds });
  };

  const handleExportBackup = () => {
    if (vaultEnvelope) {
      triggerHaptic('success');
      exportVaultBackupFile(vaultEnvelope);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.ciphertext && parsed.salt) {
          triggerHaptic('success');
          onImportBackup(parsed);
          onClose();
        } else {
          alert('Invalid .smpvault backup file format.');
        }
      } catch {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleChangePin = () => {
    if (newPin.length < 4) {
      alert('PIN must be at least 4 digits');
      return;
    }
    triggerHaptic('success');
    localStorage.setItem('smp_active_pin', newPin);
    setPinChangeSuccess(true);
    setNewPin('');
    setTimeout(() => setPinChangeSuccess(false), 2500);
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full max-w-md max-h-[calc(100%-1rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-auto"
      >
        {/* Top Header - Fixed & Rock-solid */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Vault Settings
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Security & preferences
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="w-9 h-9 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Settings */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 overscroll-contain">
          
          {/* Install on Phone Banner */}
          {onOpenInstallGuide && (
            <div
              onClick={() => {
                onClose();
                onOpenInstallGuide();
              }}
              className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Use on Your Phone (Install Guide)
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    Scan QR code, 1-tap web install, or build &amp; sideload APK
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            </div>
          )}

          {/* Android Studio Source & APK Project */}
          {onOpenAndroidSource && (
            <div
              onClick={() => {
                onClose();
                onOpenAndroidSource();
              }}
              className="p-3.5 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-2xl border border-slate-250 dark:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Android Studio Project &amp; APK
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    Kotlin, Compose, Android KeyStore &amp; download .zip
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>
          )}

          {/* Appearance / Theme */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  settings.theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 shadow-2xs'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  settings.theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 shadow-2xs'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => handleThemeChange('system')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  settings.theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 shadow-2xs'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Auto-Lock Inactivity Period */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Auto-Lock on Inactivity</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { sec: 30, label: '30s' },
                { sec: 60, label: '1 min' },
                { sec: 120, label: '2 min' },
                { sec: 300, label: '5 min' },
              ].map((item) => (
                <button
                  key={item.sec}
                  onClick={() => handleAutoLockChange(item.sec)}
                  className={`py-2 px-1 rounded-xl border text-xs font-bold text-center transition-all ${
                    settings.autoLockTimeoutSeconds === item.sec
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lock on Background / Tab Switch */}
          <label className="flex items-center justify-between p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Auto-Lock on Background
              </p>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Immediately lock when phone screen turns off or app is minimized
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.lockOnBackground}
              onChange={(e) =>
                onUpdateSettings({ ...settings, lockOnBackground: e.target.checked })
              }
              className="w-4 h-4 rounded text-indigo-600"
            />
          </label>

          {/* Clipboard Auto-Clear Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Auto-Clear Clipboard Memory
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { sec: 15, label: '15 seconds' },
                { sec: 30, label: '30 seconds' },
                { sec: 60, label: '60 seconds' },
              ].map((item) => (
                <button
                  key={item.sec}
                  onClick={() => handleClipboardClearChange(item.sec)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition-all ${
                    settings.clipboardClearSeconds === item.sec
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Change Device PIN */}
          <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white mb-2">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Change Master PIN</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                maxLength={6}
                placeholder="New 4–6 digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="flex-1 h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold tracking-widest text-slate-950 dark:text-white"
              />
              <button
                onClick={handleChangePin}
                disabled={newPin.length < 4}
                className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Update
              </button>
            </div>
            {pinChangeSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Master PIN updated successfully!</span>
              </p>
            )}
          </div>

          {/* Backup & Restore Center */}
          <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Backup &amp; Restore Center
                </span>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  Export .passward backups, import, and review pre-update checklist.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  if (onOpenBackupRestore) {
                    onClose();
                    onOpenBackupRestore();
                  } else {
                    handleExportBackup();
                  }
                }}
                className="py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Export / Backup</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenBackupRestore) {
                    onClose();
                    onOpenBackupRestore();
                  }
                }}
                className="py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Restore / Import</span>
              </button>
            </div>
          </div>

          {/* GitHub & Updates Guide Link */}
          {onOpenGitHubGuide && (
            <div
              onClick={() => {
                onClose();
                onOpenGitHubGuide();
              }}
              className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Private GitHub &amp; Update Setup
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    Version control, automated APK builds, and update guide
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>
          )}

          {/* Factory Reset / Wipe Vault */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (!confirmWipe) {
                  setConfirmWipe(true);
                  triggerHaptic('tap');
                } else {
                  triggerHaptic('error');
                  onWipeVault();
                  onClose();
                }
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                confirmWipe
                  ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                  : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 hover:bg-rose-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmWipe ? 'Confirm Erase Entire Vault?' : 'Erase Local Vault'}</span>
            </button>
            {confirmWipe && (
              <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 text-center mt-1">
                This permanently erases all encrypted credentials from this device.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Close Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
};
