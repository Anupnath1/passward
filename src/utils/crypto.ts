/**
 * Cryptographic operations for Passward
 * Uses standard WebCrypto API for AES-GCM-256 encryption and PBKDF2 key derivation.
 * Zero plaintext passwords are ever persisted to disk.
 */

import { EncryptedVaultEnvelope, PasswordEntry } from '../types/vault';

// Helper: Uint8Array <-> Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate cryptographically random bytes
export function getRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

// Derive AES-256 key from a user PIN/Master Passphrase using PBKDF2
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passBuffer = enc.encode(passphrase);

  // Import raw passphrase as key material
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive AES-GCM 256-bit key using 100,000 iterations of SHA-256
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// SHA-256 hash helper (used for fast verification tag)
export async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', enc.encode(text));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypts an array of PasswordEntry objects into an EncryptedVaultEnvelope.
 */
export async function encryptVault(
  entries: PasswordEntry[],
  passphrase: string
): Promise<EncryptedVaultEnvelope> {
  const salt = getRandomBytes(16);
  const iv = getRandomBytes(12); // Standard 12-byte IV for AES-GCM
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  const enc = new TextEncoder();
  const plaintext = JSON.stringify(entries);
  const data = enc.encode(plaintext);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    data
  );

  // Create an authCheck token by hashing the passphrase + salt so we can quickly verify incorrect PINs
  const authCheckHash = await sha256Hex(`AUTH_CHECK_${passphrase}_${bufferToBase64(salt)}`);

  return {
    version: 1,
    algorithm: 'AES-GCM-256',
    kdf: 'PBKDF2-SHA256-100K',
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertextBuffer),
    authCheck: authCheckHash,
    updatedAt: Date.now(),
    entryCount: entries.length,
  };
}

/**
 * Decrypts an EncryptedVaultEnvelope using the user's PIN/Passphrase.
 * Throws an Error if the key is incorrect or tampering is detected.
 */
export async function decryptVault(
  envelope: EncryptedVaultEnvelope,
  passphrase: string
): Promise<PasswordEntry[]> {
  const salt = base64ToBuffer(envelope.salt);
  const iv = base64ToBuffer(envelope.iv);
  const ciphertext = base64ToBuffer(envelope.ciphertext);

  // Fast check: verify the auth hash if present
  if (envelope.authCheck) {
    const expectedAuth = await sha256Hex(`AUTH_CHECK_${passphrase}_${envelope.salt}`);
    if (expectedAuth !== envelope.authCheck) {
      throw new Error('Incorrect PIN or Passphrase.');
    }
  }

  const key = await deriveKeyFromPassphrase(passphrase, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      ciphertext as unknown as BufferSource
    );

    const dec = new TextDecoder();
    const jsonString = dec.decode(decryptedBuffer);
    return JSON.parse(jsonString) as PasswordEntry[];
  } catch (err) {
    throw new Error('Failed to decrypt vault. Incorrect authentication key.');
  }
}

// -------------------------------------------------------------
// Password Generator
// -------------------------------------------------------------
export interface GeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  avoidAmbiguous: boolean; // e.g. 0, O, l, 1, I
}

export function generatePassword(options: GeneratorOptions): string {
  let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lower = 'abcdefghijklmnopqrstuvwxyz';
  let numbers = '0123456789';
  let symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';

  if (options.avoidAmbiguous) {
    upper = upper.replace(/[IO]/g, '');
    lower = lower.replace(/[lo]/g, '');
    numbers = numbers.replace(/[01]/g, '');
    symbols = symbols.replace(/[|;:,.<>]/g, '');
  }

  let charset = '';
  const mandatoryChars: string[] = [];

  if (options.includeUppercase) {
    charset += upper;
    mandatoryChars.push(upper[Math.floor(Math.random() * upper.length)]);
  }
  if (options.includeLowercase) {
    charset += lower;
    mandatoryChars.push(lower[Math.floor(Math.random() * lower.length)]);
  }
  if (options.includeNumbers) {
    charset += numbers;
    mandatoryChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
  }
  if (options.includeSymbols) {
    charset += symbols;
    mandatoryChars.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }

  if (charset.length === 0) {
    charset = lower + numbers;
  }

  const length = Math.max(8, Math.min(64, options.length));
  const remainingCount = length - mandatoryChars.length;

  const randomValues = new Uint32Array(remainingCount);
  window.crypto.getRandomValues(randomValues);

  const result: string[] = [...mandatoryChars];
  for (let i = 0; i < remainingCount; i++) {
    const randomIndex = randomValues[i] % charset.length;
    result.push(charset[randomIndex]);
  }

  // Shuffle the result array cryptographically
  const shuffleValues = new Uint32Array(result.length);
  window.crypto.getRandomValues(shuffleValues);
  for (let i = result.length - 1; i > 0; i--) {
    const j = shuffleValues[i] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}

// -------------------------------------------------------------
// Password Strength & Entropy Calculator
// -------------------------------------------------------------
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4; // 0 = Very Weak, 1 = Weak, 2 = Fair, 3 = Strong, 4 = Very Strong
  label: string;
  color: string;
  entropyBits: number;
  crackTimeEstimate: string;
  feedback: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Empty',
      color: 'text-slate-400',
      entropyBits: 0,
      crackTimeEstimate: '0 seconds',
      feedback: ['Enter a password'],
    };
  }

  let poolSize = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 33;

  const length = password.length;
  // Entropy = L * log2(poolSize)
  const entropy = Math.round(length * (poolSize > 0 ? Math.log2(poolSize) : 0));

  const feedback: string[] = [];
  if (length < 8) feedback.push('Too short (minimum 8 characters)');
  if (!hasUpper) feedback.push('Add uppercase letters');
  if (!hasNumber) feedback.push('Add numbers');
  if (!hasSymbol) feedback.push('Add special symbols');

  let score: 0 | 1 | 2 | 3 | 4 = 0;
  let label = 'Very Weak';
  let color = 'text-rose-500';
  let crackTimeEstimate = 'Instantly';

  if (entropy < 28 || length < 6) {
    score = 0;
    label = 'Very Weak';
    color = 'text-rose-500';
    crackTimeEstimate = 'Instantly';
  } else if (entropy < 45 || length < 8) {
    score = 1;
    label = 'Weak';
    color = 'text-amber-500';
    crackTimeEstimate = 'A few seconds to hours';
  } else if (entropy < 65) {
    score = 2;
    label = 'Fair';
    color = 'text-yellow-500';
    crackTimeEstimate = 'Several days to months';
  } else if (entropy < 85) {
    score = 3;
    label = 'Strong';
    color = 'text-emerald-500';
    crackTimeEstimate = 'Thousands of years';
  } else {
    score = 4;
    label = 'Very Strong';
    color = 'text-emerald-400';
    crackTimeEstimate = 'Billions of years (quantum-resistant)';
  }

  return {
    score,
    label,
    color,
    entropyBits: entropy,
    crackTimeEstimate,
    feedback,
  };
}
