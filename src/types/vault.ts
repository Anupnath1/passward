export type PasswordCategory = 'website' | 'app' | 'email' | 'wifi' | 'financial' | 'other';

export interface PasswordEntry {
  id: string;
  serviceName: string;
  category: PasswordCategory;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface EncryptedVaultEnvelope {
  version: number;
  algorithm: string;
  kdf: string;
  salt: string;       // base64
  iv: string;         // base64
  ciphertext: string; // base64
  authCheck: string;  // base64 check tag
  updatedAt: number;
  entryCount: number;
  appName?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface VaultSettings {
  theme: ThemeMode;
  autoLockTimeoutSeconds: number; // 0 = immediate, 30, 60, 120, 300
  lockOnBackground: boolean;
  clipboardClearSeconds: number;
  displayMode: 'phone-frame' | 'responsive';
  hasSetUpVault: boolean;
  pinHash?: string;
  biometricCredentialId?: string;
  lastActiveTimestamp?: number;
}

export interface BackupImportSummary {
  totalInFile: number;
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
}
