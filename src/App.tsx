import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  ShieldCheck, 
  SlidersHorizontal, 
  Lock, 
  Sparkles, 
  Key, 
  X, 
  Star, 
  CheckCircle2, 
  ShieldAlert, 
  Settings as SettingsIcon,
  Code2,
  FolderArchive,
  Menu,
  Smartphone,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PasswordEntry, 
  PasswordCategory, 
  EncryptedVaultEnvelope, 
  VaultSettings,
  ThemeMode 
} from './types/vault';
import { 
  encryptVault, 
  decryptVault 
} from './utils/crypto';
import { 
  loadSettings, 
  saveSettings, 
  loadEncryptedVaultEnvelope, 
  saveEncryptedVaultEnvelope, 
  wipeDeviceVault, 
  copyToClipboardWithAutoClear, 
  INITIAL_SAMPLE_PASSWORDS 
} from './utils/storage';
import { triggerHaptic } from './utils/biometrics';

import { AndroidFrame } from './components/AndroidFrame';
import { BiometricPromptModal } from './components/BiometricPromptModal';
import { VaultSetupModal } from './components/VaultSetupModal';
import { PasswordCard } from './components/PasswordCard';
import { PasswordDetailModal } from './components/PasswordDetailModal';
import { AddEditPasswordModal } from './components/AddEditPasswordModal';
import { PasswordGeneratorModal } from './components/PasswordGeneratorModal';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { SettingsModal } from './components/SettingsModal';
import { AndroidProjectModal } from './components/AndroidProjectModal';
import { PhoneInstallGuideModal } from './components/PhoneInstallGuideModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { GitHubUpdateGuideModal } from './components/GitHubUpdateGuideModal';

export default function App() {
  // Vault State
  const [settings, setSettings] = useState<VaultSettings>(() => loadSettings());
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [encryptedEnvelope, setEncryptedEnvelope] = useState<EncryptedVaultEnvelope | null>(() =>
    loadEncryptedVaultEnvelope()
  );

  // Active Master PIN in memory for session encryption operations
  const masterPinRef = useRef<string>(localStorage.getItem('smp_active_pin') || '1234');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Modal Dialogs
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [viewingEntry, setViewingEntry] = useState<PasswordEntry | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAndroidSourceOpen, setIsAndroidSourceOpen] = useState<boolean>(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState<boolean>(false);
  const [isBackupRestoreOpen, setIsBackupRestoreOpen] = useState<boolean>(false);
  const [isGitHubGuideOpen, setIsGitHubGuideOpen] = useState<boolean>(false);

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync Theme with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System Theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Check if first-time setup is needed
  useEffect(() => {
    if (!settings.hasSetUpVault && !encryptedEnvelope) {
      setIsSetupOpen(true);
    }
  }, [settings.hasSetUpVault, encryptedEnvelope]);

  // Inactivity Auto-Lock & Background Lock Lifecycle
  const lastActiveRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isUnlocked) return;

    const handleUserActivity = () => {
      lastActiveRef.current = Date.now();
    };

    // Activity listeners
    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('pointerdown', handleUserActivity, { passive: true });

    // Inactivity check interval
    const interval = setInterval(() => {
      if (!isUnlocked) return;
      const timeoutMs = (settings.autoLockTimeoutSeconds || 60) * 1000;
      if (timeoutMs > 0 && Date.now() - lastActiveRef.current >= timeoutMs) {
        lockVault();
        showToast('Vault auto-locked due to inactivity');
      }
    }, 5000);

    // Auto-lock when tab is blurred or hidden (phone screen off or app switched)
    const handleVisibilityChange = () => {
      if (document.hidden && settings.lockOnBackground && isUnlocked) {
        lockVault();
        showToast('Vault locked as app entered background');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('pointerdown', handleUserActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [isUnlocked, settings.autoLockTimeoutSeconds, settings.lockOnBackground]);

  // Lock Vault
  const lockVault = () => {
    triggerHaptic('lock');
    setIsUnlocked(false);
    setPasswords([]); // Wipe sensitive decrypted passwords from memory
    setIsDetailOpen(false);
    setIsAddEditOpen(false);
    setIsGeneratorOpen(false);
    setIsAuditOpen(false);
    setIsSettingsOpen(false);
    setIsMenuOpen(false);
  };

  // Unlock Vault
  const handleUnlockSuccess = async (enteredPin: string) => {
    masterPinRef.current = enteredPin;
    localStorage.setItem('smp_active_pin', enteredPin);

    if (encryptedEnvelope) {
      try {
        const decrypted = await decryptVault(encryptedEnvelope, enteredPin);
        setPasswords(decrypted);
        setIsUnlocked(true);
        lastActiveRef.current = Date.now();
        showToast('Personal vault unlocked successfully');
      } catch (err) {
        triggerHaptic('error');
        showToast('Failed to decrypt: Incorrect PIN');
      }
    } else {
      // Setup initial empty or sample vault
      initializeVaultWithData(enteredPin, true);
    }
  };

  // First-time setup onboarding completion
  const handleCompleteSetup = async (pin: string, includeSamples: boolean) => {
    masterPinRef.current = pin;
    localStorage.setItem('smp_active_pin', pin);
    const newSettings = { ...settings, hasSetUpVault: true };
    setSettings(newSettings);
    saveSettings(newSettings);
    setIsSetupOpen(false);

    await initializeVaultWithData(pin, includeSamples);
  };

  // Initialize vault and encrypt immediately
  const initializeVaultWithData = async (pin: string, includeSamples: boolean) => {
    let initialList: PasswordEntry[] = [];
    if (includeSamples) {
      const now = Date.now();
      initialList = INITIAL_SAMPLE_PASSWORDS.map((item, idx) => ({
        ...item,
        id: `pwd_${now}_${idx}`,
        createdAt: now - (idx + 1) * 86400000,
        updatedAt: now,
      }));
    }

    const envelope = await encryptVault(initialList, pin);
    saveEncryptedVaultEnvelope(envelope);
    setEncryptedEnvelope(envelope);
    setPasswords(initialList);
    setIsUnlocked(true);
    lastActiveRef.current = Date.now();
    showToast(includeSamples ? 'Vault initialized with sample passwords' : 'Empty vault ready');
  };

  // Save new or edited entry
  const handleSaveEntry = async (entryData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    let updatedList: PasswordEntry[];

    if (editingEntry) {
      updatedList = passwords.map((p) =>
        p.id === editingEntry.id
          ? { ...editingEntry, ...entryData, updatedAt: now }
          : p
      );
    } else {
      const newEntry: PasswordEntry = {
        ...entryData,
        id: `pwd_${now}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      updatedList = [newEntry, ...passwords];
    }

    setPasswords(updatedList);
    setIsAddEditOpen(false);
    setEditingEntry(null);

    // Encrypt updated vault and persist to local storage
    const envelope = await encryptVault(updatedList, masterPinRef.current);
    saveEncryptedVaultEnvelope(envelope);
    setEncryptedEnvelope(envelope);

    showToast(editingEntry ? 'Password updated & encrypted' : 'Password saved to offline vault');
  };

  // Delete entry
  const handleDeleteEntry = async (id: string) => {
    const updatedList = passwords.filter((p) => p.id !== id);
    setPasswords(updatedList);
    setIsDetailOpen(false);
    setViewingEntry(null);

    const envelope = await encryptVault(updatedList, masterPinRef.current);
    saveEncryptedVaultEnvelope(envelope);
    setEncryptedEnvelope(envelope);

    showToast('Password permanently deleted from device');
  };

  // Toggle favorite
  const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    triggerHaptic('tap');
    const updatedList = passwords.map((p) =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    );
    setPasswords(updatedList);

    const envelope = await encryptVault(updatedList, masterPinRef.current);
    saveEncryptedVaultEnvelope(envelope);
    setEncryptedEnvelope(envelope);
  };

  // Copy password helper with auto-clear
  const handleCopyPassword = async (password: string, serviceName: string) => {
    const autoClearSec = settings.clipboardClearSeconds || 30;
    const success = await copyToClipboardWithAutoClear(password, autoClearSec, () => {
      showToast('Clipboard cleared for security');
    });

    if (success) {
      showToast(`Copied ${serviceName} password · Clears in ${autoClearSec}s`);
    } else {
      showToast('Failed to copy');
    }
  };

  // Wipe vault
  const handleWipeVault = () => {
    wipeDeviceVault();
    setPasswords([]);
    setEncryptedEnvelope(null);
    setIsUnlocked(false);
    setSettings((prev) => ({ ...prev, hasSetUpVault: false }));
    setIsSetupOpen(true);
    showToast('All local passwords erased');
  };

  // Import backup envelope
  const handleImportBackup = async (importedEnvelope: EncryptedVaultEnvelope) => {
    try {
      const pin = prompt('Enter the Master PIN that was used to encrypt this backup:') || '';
      if (!pin) return;

      const decrypted = await decryptVault(importedEnvelope, pin);
      masterPinRef.current = pin;
      localStorage.setItem('smp_active_pin', pin);
      setPasswords(decrypted);
      saveEncryptedVaultEnvelope(importedEnvelope);
      setEncryptedEnvelope(importedEnvelope);
      setIsUnlocked(true);
      showToast(`Imported ${decrypted.length} passwords successfully`);
    } catch {
      alert('Failed to decrypt backup. Incorrect PIN or corrupted file.');
    }
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return passwords
      .filter((entry) => {
        // Favorite filter
        if (showFavoritesOnly && !entry.isFavorite) {
          return false;
        }
        // Query search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchService = entry.serviceName.toLowerCase().includes(q);
          const matchUser = entry.username.toLowerCase().includes(q);
          const matchUrl = entry.url?.toLowerCase().includes(q);
          const matchNotes = entry.notes?.toLowerCase().includes(q);
          return matchService || matchUser || matchUrl || matchNotes;
        }
        return true;
      })
      .sort((a, b) => {
        // Favorites first, then alphabetical by service name
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.serviceName.localeCompare(b.serviceName);
      });
  }, [passwords, showFavoritesOnly, searchQuery]);

  return (
    <AndroidFrame
      isUnlocked={isUnlocked}
      onLockVault={lockVault}
      onSimulateBackground={() => {
        lockVault();
        showToast('App sent to background · Auto-locked');
      }}
      onOpenAndroidSource={() => setIsAndroidSourceOpen(true)}
      onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
      onOpenBackupRestore={() => setIsBackupRestoreOpen(true)}
      onOpenGitHubGuide={() => setIsGitHubGuideOpen(true)}
      theme={settings.theme}
      onToggleTheme={() => {
        const next: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark';
        setSettings((prev) => {
          const updated: VaultSettings = { ...prev, theme: next };
          saveSettings(updated);
          return updated;
        });
      }}
      displayMode={settings.displayMode}
      onToggleDisplayMode={() => {
        const next: 'phone-frame' | 'responsive' = settings.displayMode === 'phone-frame' ? 'responsive' : 'phone-frame';
        setSettings((prev) => {
          const updated: VaultSettings = { ...prev, displayMode: next };
          saveSettings(updated);
          return updated;
        });
      }}
    >
      {/* Biometric Prompt Overlay if Locked */}
      {!isUnlocked && (
        <BiometricPromptModal
          onSuccess={handleUnlockSuccess}
          hasSetUpVault={settings.hasSetUpVault}
        />
      )}

      {/* First-time Onboarding Modal */}
      {isSetupOpen && (
        <VaultSetupModal onCompleteSetup={handleCompleteSetup} />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-2 left-4 right-4 z-50 bg-slate-900/95 text-white text-xs px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
        
        {/* Top App Header */}
        <div className="px-4 pt-3.5 pb-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Three-line Hamburger Menu (☰) in Top-Left Corner */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setIsMenuOpen((prev) => !prev);
                  }}
                  aria-label="Navigation & features menu"
                  title="Menu (☰)"
                  className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-800 dark:text-slate-100 transition-all border border-slate-200 dark:border-slate-700/60 shadow-xs"
                >
                  <Menu className="w-5 h-5 stroke-[2.2]" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <>
                      {/* Click outside backdrop */}
                      <div 
                        className="fixed inset-0 z-40 bg-slate-950/30 dark:bg-black/50 backdrop-blur-2xs" 
                        onClick={() => setIsMenuOpen(false)}
                      />

                      <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className="absolute top-12 left-0 z-50 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800/80"
                      >
                        {/* Menu Header */}
                        <div className="px-4 py-3 bg-slate-50/90 dark:bg-slate-850/90 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                              P
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">Passward Menu</div>
                              <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">100% Offline · AES-256</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsMenuOpen(false)}
                            aria-label="Close menu"
                            className="w-7 h-7 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Section 1: Vault Tools */}
                        <div className="p-2 space-y-0.5">
                          <div className="px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                            Vault Tools
                          </div>

                          <button
                            onClick={() => {
                              triggerHaptic('tap');
                              setIsMenuOpen(false);
                              setIsBackupRestoreOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <FolderArchive className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">Backup & Restore</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Export or import encrypted vault</div>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              triggerHaptic('tap');
                              setIsMenuOpen(false);
                              setIsAuditOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">Security Health Audit</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Vulnerability score & weak password check</div>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              triggerHaptic('tap');
                              setIsMenuOpen(false);
                              setIsGeneratorOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">Password Generator</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Create strong passwords with entropy meter</div>
                            </div>
                          </button>
                        </div>

                        {/* Section 2: Mobile & Source */}
                        <div className="p-2 space-y-0.5">
                          <div className="px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                            Android Phone & Code
                          </div>

                          <button
                            onClick={() => {
                              triggerHaptic('tap');
                              setIsMenuOpen(false);
                              setIsInstallGuideOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">Install on Phone / APK</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Direct install, sideload APK, QR code</div>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              triggerHaptic('tap');
                              setIsMenuOpen(false);
                              setIsAndroidSourceOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Code2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">Android Studio Source</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Export complete Kotlin .ZIP project</div>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              triggerHaptic('tap');
                              setIsMenuOpen(false);
                              setIsGitHubGuideOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <SlidersHorizontal className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">GitHub Actions & Releases</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Automated APK compilation guide</div>
                            </div>
                          </button>
                        </div>

                        {/* Section 3: Settings & Lock */}
                        <div className="p-2 space-y-0.5">
                          <button
                            onClick={() => {
                              triggerHaptic('tap');
                              const next: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark';
                              setSettings((prev) => {
                                const updated: VaultSettings = { ...prev, theme: next };
                                saveSettings(updated);
                                return updated;
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                                {settings.theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-slate-900 dark:text-white">Theme Mode</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{settings.theme} theme</div>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60">
                              Switch
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              triggerHaptic('tap');
                              setIsMenuOpen(false);
                              setIsSettingsOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <SettingsIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">Vault Settings</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Security specs, auto-lock timeout, wipe</div>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              lockVault();
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-3 transition-colors group mt-1"
                          >
                            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Lock className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">Lock Vault Now</div>
                              <div className="text-[10px] text-amber-700 dark:text-amber-300 truncate">Instantly wipe memory & require PIN/biometrics</div>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Prominent Password Heading & Subtitle */}
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">
                  Passward
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  <span>{passwords.length} credentials</span>
                  <span>·</span>
                  <span>Encrypted Vault</span>
                </div>
              </div>
            </div>

            {/* Clean Minimal Right Side: Quick Lock Button */}
            <button
              onClick={lockVault}
              title="Lock Vault Now"
              className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 flex items-center justify-center transition-colors shrink-0 shadow-xs"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input Bar with Compact Favorites Filter (Matching Screenshot) */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services, usernames, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-8 bg-slate-100 dark:bg-[#162032] border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowFavoritesOnly(!showFavoritesOnly);
              }}
              title={showFavoritesOnly ? 'Show all credentials' : 'Show starred favorites only'}
              className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-colors shrink-0 ${
                showFavoritesOnly
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-slate-100 dark:bg-[#162032] border-slate-250 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Password Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <PasswordCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => {
                    triggerHaptic('tap');
                    setViewingEntry(entry);
                    setIsDetailOpen(true);
                  }}
                  onToggleFavorite={(e) => handleToggleFavorite(e, entry.id)}
                  onCopyPassword={handleCopyPassword}
                />
              ))
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[260px] flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-200/80 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-600 dark:text-slate-300 shadow-xs">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {searchQuery || showFavoritesOnly
                    ? 'No matching passwords found'
                    : 'Your personal vault is empty'}
                </h3>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 max-w-xs">
                  {searchQuery
                    ? 'Try a different search keyword or clear filters'
                    : 'Tap the + button below to securely store your first password'}
                </p>
                {(searchQuery || showFavoritesOnly) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowFavoritesOnly(false);
                    }}
                    className="mt-3 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline bg-indigo-50 dark:bg-indigo-950/60 rounded-lg"
                  >
                    Clear filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Action Button (FAB) in Natural Thumb Zone */}
        <div className="absolute bottom-5 right-5 z-30">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setEditingEntry(null);
              setIsAddEditOpen(true);
            }}
            title="Add New Password"
            className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all duration-150"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {isDetailOpen && viewingEntry && (
        <PasswordDetailModal
          entry={viewingEntry}
          onClose={() => {
            setIsDetailOpen(false);
            setViewingEntry(null);
          }}
          onEdit={() => {
            setEditingEntry(viewingEntry);
            setIsDetailOpen(false);
            setIsAddEditOpen(true);
          }}
          onDelete={handleDeleteEntry}
          onCopyText={(text, label) => {
            const autoClearSec = settings.clipboardClearSeconds || 30;
            copyToClipboardWithAutoClear(text, autoClearSec, () => {
              showToast('Clipboard cleared for security');
            });
            showToast(`Copied ${label} · Clears in ${autoClearSec}s`);
          }}
        />
      )}

      {isAddEditOpen && (
        <AddEditPasswordModal
          initialEntry={editingEntry}
          onSave={handleSaveEntry}
          onClose={() => {
            setIsAddEditOpen(false);
            setEditingEntry(null);
          }}
        />
      )}

      {isGeneratorOpen && (
        <PasswordGeneratorModal
          onClose={() => setIsGeneratorOpen(false)}
          onCopyPassword={(pwd) => {
            const autoClearSec = settings.clipboardClearSeconds || 30;
            copyToClipboardWithAutoClear(pwd, autoClearSec, () => {
              showToast('Clipboard cleared for security');
            });
            showToast(`Generated password copied · Clears in ${autoClearSec}s`);
          }}
        />
      )}

      {isAuditOpen && (
        <SecurityAuditModal
          entries={passwords}
          onClose={() => setIsAuditOpen(false)}
          onSelectEntry={(entry) => {
            setViewingEntry(entry);
            setIsDetailOpen(true);
          }}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
            showToast('Settings saved');
          }}
          vaultEnvelope={encryptedEnvelope}
          onImportBackup={handleImportBackup}
          onWipeVault={handleWipeVault}
          onClose={() => setIsSettingsOpen(false)}
          onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
          onOpenBackupRestore={() => setIsBackupRestoreOpen(true)}
          onOpenGitHubGuide={() => setIsGitHubGuideOpen(true)}
          onOpenAndroidSource={() => setIsAndroidSourceOpen(true)}
        />
      )}

      {isAndroidSourceOpen && (
        <AndroidProjectModal onClose={() => setIsAndroidSourceOpen(false)} />
      )}

      {isInstallGuideOpen && (
        <PhoneInstallGuideModal onClose={() => setIsInstallGuideOpen(false)} />
      )}

      {isBackupRestoreOpen && (
        <BackupRestoreModal
          passwords={passwords}
          vaultEnvelope={encryptedEnvelope}
          onRestoreSuccess={async (newPasswords, msg) => {
            setPasswords(newPasswords);
            try {
              const pin = masterPinRef.current || '1234';
              const envelope = await encryptVault(newPasswords, pin);
              setEncryptedEnvelope(envelope);
              saveEncryptedVaultEnvelope(envelope);
              showToast(msg);
            } catch (err) {
              console.error('Failed to encrypt restored vault:', err);
            }
          }}
          onClose={() => setIsBackupRestoreOpen(false)}
        />
      )}

      {isGitHubGuideOpen && (
        <GitHubUpdateGuideModal onClose={() => setIsGitHubGuideOpen(false)} />
      )}
    </AndroidFrame>
  );
}
