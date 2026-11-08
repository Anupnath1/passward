import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Lock, 
  KeyRound, 
  Sparkles,
  RefreshCw,
  HardDriveDownload,
  FolderArchive
} from 'lucide-react';
import { motion } from 'motion/react';
import { PasswordEntry, EncryptedVaultEnvelope } from '../types/vault';
import { 
  exportVaultBackupFile, 
  exportPlaintextJson, 
  exportPlaintextCsv, 
  restoreVaultFromBackup 
} from '../utils/storage';
import { triggerHaptic } from '../utils/biometrics';

interface BackupRestoreModalProps {
  passwords: PasswordEntry[];
  vaultEnvelope: EncryptedVaultEnvelope | null;
  onRestoreSuccess: (newPasswords: PasswordEntry[], message: string) => void;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  passwords,
  vaultEnvelope,
  onRestoreSuccess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'guide'>('export');
  
  // Export tab states
  const [showPlaintextWarning, setShowPlaintextWarning] = useState<boolean>(false);
  const [plaintextFormat, setPlaintextFormat] = useState<'json' | 'csv'>('json');
  const [confirmPinForPlaintext, setConfirmPinForPlaintext] = useState<string>('');
  const [plaintextPinError, setPlaintextPinError] = useState<string>('');

  // Import tab states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileContent, setImportFileContent] = useState<any>(null);
  const [importPin, setImportPin] = useState<string>('');
  const [mergeStrategy, setMergeStrategy] = useState<'merge' | 'replace'>('merge');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string>('');

  const handleExportEncrypted = (format: 'passward' | 'json') => {
    if (!vaultEnvelope) {
      alert('Vault is currently locked or empty.');
      return;
    }
    triggerHaptic('success');
    exportVaultBackupFile(vaultEnvelope, format);
  };

  const handlePlaintextExportClick = (format: 'json' | 'csv') => {
    setPlaintextFormat(format);
    setShowPlaintextWarning(true);
    setConfirmPinForPlaintext('');
    setPlaintextPinError('');
  };

  const handleConfirmPlaintextExport = () => {
    const savedPin = localStorage.getItem('smp_active_pin') || '1234';
    if (confirmPinForPlaintext !== savedPin) {
      triggerHaptic('error');
      setPlaintextPinError('Incorrect PIN. Plaintext export canceled.');
      return;
    }

    triggerHaptic('success');
    if (plaintextFormat === 'json') {
      exportPlaintextJson(passwords);
    } else {
      exportPlaintextCsv(passwords);
    }
    setShowPlaintextWarning(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError('');
    setImportSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        setImportFileContent(parsed);
      } catch {
        setImportError('Failed to parse file. Please upload a valid .passward or JSON file.');
        setImportFileContent(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!importFileContent) {
      setImportError('Please select a backup file first.');
      triggerHaptic('error');
      return;
    }

    setIsProcessing(true);
    setImportError('');
    setImportSuccessMsg('');

    // If file is encrypted envelope, require PIN
    const isEncrypted = Boolean(importFileContent.ciphertext && importFileContent.salt);
    const pinToUse = isEncrypted ? importPin : '';

    if (isEncrypted && !pinToUse) {
      setImportError('This backup is encrypted. Please enter the master PIN or passphrase.');
      setIsProcessing(false);
      triggerHaptic('error');
      return;
    }

    const result = await restoreVaultFromBackup(
      importFileContent,
      pinToUse,
      passwords,
      mergeStrategy
    );

    setIsProcessing(false);

    if (result.success) {
      triggerHaptic('success');
      const msg = `Restored ${result.summary.total} passwords (${result.summary.added} added, ${result.summary.updated} updated, ${result.summary.skipped} unchanged).`;
      setImportSuccessMsg(msg);
      onRestoreSuccess(result.newPasswords, msg);
    } else {
      triggerHaptic('error');
      setImportError(result.error || 'Failed to restore backup.');
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full max-w-xl max-h-[calc(100%-1rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-auto"
      >
        {/* Top Header - Fixed & Rock-solid */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Backup & Restore Center
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Data ownership · Encrypted exports · Pre-update safety
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

        {/* Tab switcher */}
        <div className="px-5 pt-3 pb-2 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('export');
            }}
            className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('import');
            }}
            className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import & Restore</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('guide');
            }}
            className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Pre-Update Checklist</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Primary Encrypted Export Card */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Encrypted Passward Backup (.passward)
                      </h4>
                      <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                        AES-256-GCM · PBKDF2 100,000 Rounds · Safe for USB or Drive
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 px-2.5 py-0.5 rounded-full shrink-0">
                    {passwords.length} Entries
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Generates an encrypted backup file containing all your passwords, notes, and usernames. This file can only be unlocked with your Passward master PIN or password.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleExportEncrypted('passward')}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <HardDriveDownload className="w-4 h-4" />
                    <span>Download .passward Backup</span>
                  </button>

                  <button
                    onClick={() => handleExportEncrypted('json')}
                    title="Export encrypted JSON envelope"
                    className="py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    .json
                  </button>
                </div>
              </div>

              {/* Plaintext Exports Section with Guard */}
              <div className="p-4 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Unencrypted Exports (For Migration / Printing)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Export your credentials in plain format to print, view in Excel, or import into other tools like KeePass. Requires master PIN verification.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handlePlaintextExportClick('json')}
                    className="py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Plaintext JSON</span>
                  </button>

                  <button
                    onClick={() => handlePlaintextExportClick('csv')}
                    className="py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Plaintext CSV</span>
                  </button>
                </div>
              </div>

              {/* Warning Modal for Plaintext */}
              {showPlaintextWarning && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-300 dark:border-amber-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Security Warning: Passwords will be readable in plain text</span>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    Anyone who gets access to this exported file will be able to read all your passwords without encryption. Please store it in a secure location and delete it after use.
                  </p>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1">
                      Enter Master PIN to confirm:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="Master PIN"
                        value={confirmPinForPlaintext}
                        onChange={(e) => {
                          setConfirmPinForPlaintext(e.target.value.replace(/\D/g, ''));
                          setPlaintextPinError('');
                        }}
                        className="h-9 px-3 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={handleConfirmPlaintextExport}
                        disabled={confirmPinForPlaintext.length < 4}
                        className="h-9 px-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Authorize & Export
                      </button>
                      <button
                        onClick={() => setShowPlaintextWarning(false)}
                        className="h-9 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                    {plaintextPinError && (
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">
                        {plaintextPinError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPORT & RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Select Backup File (.passward or .json)</span>
                </h4>

                <label className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-white dark:bg-slate-900">
                  <FolderArchive className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-1" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {importFile ? importFile.name : 'Tap to select .passward or .json backup'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : 'Supports Passward encrypted envelopes'}
                  </span>
                  <input
                    type="file"
                    accept=".passward,.smpvault,.json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* If encrypted envelope detected, ask for PIN */}
                {importFileContent && importFileContent.ciphertext && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Enter Master PIN or Backup Password:</span>
                    </label>
                    <input
                      type="password"
                      placeholder="PIN used when backup was created"
                      value={importPin}
                      onChange={(e) => {
                        setImportPin(e.target.value);
                        setImportError('');
                      }}
                      className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Conflict resolution strategy */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Restore Strategy:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMergeStrategy('merge')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        mergeStrategy === 'merge'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                      }`}
                    >
                      <span className="block font-bold">Merge with Vault</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Keeps existing passwords, updates matches.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMergeStrategy('replace')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        mergeStrategy === 'replace'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                      }`}
                    >
                      <span className="block font-bold">Replace Everything</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Overwrites current vault with backup.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {importError && (
                  <div className="p-3 bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-900 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-200">
                    {importError}
                  </div>
                )}

                {/* Success message */}
                {importSuccessMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{importSuccessMsg}</span>
                  </div>
                )}

                {/* Execute Button */}
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={!importFile || isProcessing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{isProcessing ? 'Decrypting & Restoring...' : 'Restore Passwords Now'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PRE-UPDATE SAFETY CHECKLIST */}
          {activeTab === 'guide' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Safe App Update Procedure
                  </h4>
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-300 mt-1 leading-relaxed">
                  Android preserves your local database when updating an app if both APKs share the same package name and signing key. Follow this 3-step checklist to eliminate any risk of data loss:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      Export Your Vault Backup First
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Switch to the <strong>Export Backup</strong> tab and click <strong>Download .passward Backup</strong>. Save it to your phone's <em>Downloads</em> or an external USB.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      Install the Updated APK Directly
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Download the new version from your private GitHub release. Tap the APK file and select <strong>"Update"</strong> (do <em>NOT</em> uninstall the old app first, as Android wipes app data when uninstalling).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      Launch Passward & Verify Credentials
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Authenticate with your fingerprint or PIN. All your passwords will be waiting for you. If you ever switch to a new phone or format your device, use the <strong>Import & Restore</strong> tab to instantly recover your vault!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
