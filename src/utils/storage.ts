/**
 * Local encrypted storage management for Passward
 * Strictly 100% offline. No cloud, no analytics, no external calls.
 */

import { EncryptedVaultEnvelope, PasswordEntry, VaultSettings } from '../types/vault';
import { encryptVault, decryptVault } from './crypto';

const STORAGE_KEY_ENCRYPTED_VAULT = 'smp_encrypted_vault';
const STORAGE_KEY_SETTINGS = 'smp_vault_settings';

export const DEFAULT_SETTINGS: VaultSettings = {
  theme: 'system',
  autoLockTimeoutSeconds: 60, // Auto-lock after 1 minute of inactivity
  lockOnBackground: true,     // Lock immediately when app goes to background / tab blurred
  clipboardClearSeconds: 30,  // Auto-clear clipboard after 30 seconds
  displayMode: 'phone-frame',  // Start in beautiful Android 14 Pixel frame
  hasSetUpVault: false,
};

// Load saved settings
export function loadSettings(): VaultSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Save settings
export function saveSettings(settings: VaultSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// Load encrypted vault envelope
export function loadEncryptedVaultEnvelope(): EncryptedVaultEnvelope | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENCRYPTED_VAULT);
    if (!raw) return null;
    return JSON.parse(raw) as EncryptedVaultEnvelope;
  } catch {
    return null;
  }
}

// Save encrypted vault envelope
export function saveEncryptedVaultEnvelope(envelope: EncryptedVaultEnvelope): void {
  try {
    localStorage.setItem(STORAGE_KEY_ENCRYPTED_VAULT, JSON.stringify(envelope));
  } catch (err) {
    console.error('Failed to save encrypted vault to localStorage:', err);
  }
}

// Erase entire vault from device
export function wipeDeviceVault(): void {
  localStorage.removeItem(STORAGE_KEY_ENCRYPTED_VAULT);
  localStorage.removeItem(STORAGE_KEY_SETTINGS);
}

// Sample offline entries created on first setup so user can immediately experience the app
export const INITIAL_SAMPLE_PASSWORDS: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    serviceName: 'Google Account',
    category: 'email',
    username: 'alex.taylor@gmail.com',
    password: 'vT9#xP4$kM9!qW2&',
    url: 'https://accounts.google.com',
    notes: 'Primary personal Google account with 2FA backup codes stored offline.',
    isFavorite: true,
  },
  {
    serviceName: 'GitHub Work',
    category: 'website',
    username: 'alex-dev',
    password: 'Gk8*mZ2$wP9!rL4#vN1@',
    url: 'https://github.com',
    notes: 'Personal access tokens generated for offline local repos.',
    isFavorite: true,
  },
  {
    serviceName: 'Home Fiber Wi-Fi',
    category: 'wifi',
    username: 'PixelNet_5G_Secure',
    password: 'Cedar-Pine-Ridge-7429!',
    url: '',
    notes: 'WPA3 Personal router located in living room cabinet.',
    isFavorite: true,
  },
  {
    serviceName: 'Chase Mobile Banking',
    category: 'financial',
    username: 'ataylor_finance',
    password: 'kB8%uN4@xQ7!mP2#',
    url: 'https://www.chase.com',
    notes: 'Checking and savings accounts. Biometric login enabled on phone.',
    isFavorite: false,
  },
  {
    serviceName: 'Slack Workspace',
    category: 'app',
    username: 'alex.taylor@company.io',
    password: 'yT3$jW9*mK2#fR7!',
    url: 'https://company.slack.com',
    notes: 'Engineering team channel access.',
    isFavorite: false,
  },
  {
    serviceName: 'Proton Mail',
    category: 'email',
    username: 'alex.privacy@pm.me',
    password: 'zX7#mW2$vQ9!kP4*',
    url: 'https://mail.proton.me',
    notes: 'Encrypted privacy email address.',
    isFavorite: false,
  },
];

// Helper: Copy text to clipboard and schedule automatic clearing
let clipboardClearTimeout: ReturnType<typeof setTimeout> | null = null;

export async function copyToClipboardWithAutoClear(
  text: string,
  autoClearSeconds: number,
  onCleared?: () => void
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);

    if (clipboardClearTimeout) {
      clearTimeout(clipboardClearTimeout);
    }

    if (autoClearSeconds > 0) {
      clipboardClearTimeout = setTimeout(async () => {
        try {
          // Overwrite clipboard with empty spaces or dummy text
          await navigator.clipboard.writeText('');
          if (onCleared) onCleared();
        } catch {
          // Clipboard write might fail if window lost focus
        }
      }, autoClearSeconds * 1000);
    }

    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

// Export encrypted backup (.passward)
export function exportVaultBackupFile(envelope: EncryptedVaultEnvelope, format: 'passward' | 'json' = 'passward'): void {
  const payloadWithMeta = {
    ...envelope,
    appName: 'Passward',
    exportedAt: new Date().toISOString(),
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payloadWithMeta, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  const extension = format === 'passward' ? 'passward' : 'json';
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Passward_Encrypted_Backup_${dateStr}.${extension}`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Export unencrypted Plaintext JSON (guarded by explicit user consent & PIN verification)
export function exportPlaintextJson(passwords: PasswordEntry[]): void {
  const exportData = {
    app: 'Passward',
    type: 'PLAINTEXT_VAULT_BACKUP',
    exportedAt: new Date().toISOString(),
    totalEntries: passwords.length,
    entries: passwords,
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Passward_Plaintext_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Export unencrypted CSV for spreadsheet or KeePass import
export function exportPlaintextCsv(passwords: PasswordEntry[]): void {
  const headers = ['ServiceName', 'Category', 'Username', 'Password', 'URL', 'Notes', 'IsFavorite', 'CreatedAt', 'UpdatedAt'];
  const rows = passwords.map((p) => [
    `"${(p.serviceName || '').replace(/"/g, '""')}"`,
    `"${(p.category || 'website').replace(/"/g, '""')}"`,
    `"${(p.username || '').replace(/"/g, '""')}"`,
    `"${(p.password || '').replace(/"/g, '""')}"`,
    `"${(p.url || '').replace(/"/g, '""')}"`,
    `"${(p.notes || '').replace(/"/g, '""')}"`,
    p.isFavorite ? 'true' : 'false',
    new Date(p.createdAt).toISOString(),
    new Date(p.updatedAt).toISOString(),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `Passward_Export_${dateStr}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

// Smart Import & Restore logic
export async function restoreVaultFromBackup(
  parsedData: any,
  pin: string,
  currentPasswords: PasswordEntry[],
  strategy: 'merge' | 'replace'
): Promise<{ success: boolean; newPasswords: PasswordEntry[]; summary: { total: number; added: number; updated: number; skipped: number }; error?: string }> {
  try {
    let importedEntries: PasswordEntry[] = [];

    // Case 1: Encrypted envelope (.passward or .smpvault)
    if (parsedData.ciphertext && parsedData.salt && parsedData.iv) {
      const decrypted = await decryptVault(parsedData as EncryptedVaultEnvelope, pin);
      if (!decrypted) {
        return {
          success: false,
          newPasswords: currentPasswords,
          summary: { total: 0, added: 0, updated: 0, skipped: 0 },
          error: 'Decryption failed. The PIN or master password does not match this backup file.',
        };
      }
      importedEntries = decrypted;
    } 
    // Case 2: Plaintext JSON array or object
    else if (Array.isArray(parsedData)) {
      importedEntries = parsedData;
    } else if (parsedData.entries && Array.isArray(parsedData.entries)) {
      importedEntries = parsedData.entries;
    } else {
      return {
        success: false,
        newPasswords: currentPasswords,
        summary: { total: 0, added: 0, updated: 0, skipped: 0 },
        error: 'Unrecognized file format. Must be a valid .passward or JSON backup.',
      };
    }

    // Validate imported entries
    const validEntries = importedEntries.filter(
      (e) => e && typeof e.serviceName === 'string' && typeof e.password === 'string'
    );

    if (validEntries.length === 0) {
      return {
        success: false,
        newPasswords: currentPasswords,
        summary: { total: 0, added: 0, updated: 0, skipped: 0 },
        error: 'No valid password entries were found in the selected file.',
      };
    }

    if (strategy === 'replace') {
      return {
        success: true,
        newPasswords: validEntries,
        summary: {
          total: validEntries.length,
          added: validEntries.length,
          updated: 0,
          skipped: 0,
        },
      };
    }

    // Strategy === 'merge': Intelligently match existing by (serviceName + username)
    let added = 0;
    let updated = 0;
    let skipped = 0;
    const mergedList = [...currentPasswords];

    for (const incoming of validEntries) {
      const existingIndex = mergedList.findIndex(
        (p) =>
          p.serviceName.trim().toLowerCase() === incoming.serviceName.trim().toLowerCase() &&
          p.username.trim().toLowerCase() === incoming.username.trim().toLowerCase()
      );

      if (existingIndex >= 0) {
        // Compare updatedAt timestamp or password changes
        const existing = mergedList[existingIndex];
        if (incoming.updatedAt > existing.updatedAt || incoming.password !== existing.password) {
          mergedList[existingIndex] = {
            ...incoming,
            id: existing.id, // keep existing id
            updatedAt: Date.now(),
          };
          updated++;
        } else {
          skipped++;
        }
      } else {
        mergedList.push({
          ...incoming,
          id: incoming.id || `pwd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          createdAt: incoming.createdAt || Date.now(),
          updatedAt: incoming.updatedAt || Date.now(),
        });
        added++;
      }
    }

    return {
      success: true,
      newPasswords: mergedList,
      summary: {
        total: validEntries.length,
        added,
        updated,
        skipped,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      newPasswords: currentPasswords,
      summary: { total: 0, added: 0, updated: 0, skipped: 0 },
      error: err?.message || 'Failed to parse backup file.',
    };
  }
}
