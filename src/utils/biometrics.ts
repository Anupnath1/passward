/**
 * Biometric authentication & Device Lock helpers
 * Uses WebAuthn Platform Authenticator (Android Fingerprint / Windows Hello / Touch ID)
 * with seamless fallback to Android Device PIN.
 */

export interface BiometricSupport {
  available: boolean;
  type: 'fingerprint' | 'face' | 'device-pin' | 'unsupported';
}

export async function checkBiometricSupport(): Promise<BiometricSupport> {
  if (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  ) {
    try {
      const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return {
        available: isAvailable,
        type: isAvailable ? 'fingerprint' : 'device-pin',
      };
    } catch {
      return { available: false, type: 'device-pin' };
    }
  }
  return { available: false, type: 'device-pin' };
}

/**
 * Triggers hardware vibration for Android tactile feedback
 */
export function triggerHaptic(type: 'tap' | 'success' | 'error' | 'lock'): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'tap':
          navigator.vibrate(15);
          break;
        case 'success':
          navigator.vibrate([25, 40, 25]);
          break;
        case 'error':
          navigator.vibrate([50, 60, 50, 60, 50]);
          break;
        case 'lock':
          navigator.vibrate([30, 30]);
          break;
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }
}

/**
 * Register a biometric credential using WebAuthn
 */
export async function registerBiometricKey(userId: string, userName: string): Promise<string | null> {
  if (!window.PublicKeyCredential) return null;

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Passward Vault',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userName,
          displayName: 'Vault Owner',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'none',
      },
    })) as PublicKeyCredential | null;

    if (credential && credential.id) {
      return credential.id;
    }
  } catch (err) {
    console.warn('Biometric registration deferred or cancelled by user:', err);
  }
  return null;
}

/**
 * Authenticate with biometric hardware
 */
export async function authenticateWithBiometrics(credentialId?: string): Promise<boolean> {
  if (!window.PublicKeyCredential) return false;

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const options: CredentialRequestOptions = {
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        ...(credentialId
          ? {
              allowCredentials: [
                {
                  id: new TextEncoder().encode(credentialId),
                  type: 'public-key',
                },
              ],
            }
          : {}),
      },
    };

    const assertion = await navigator.credentials.get(options);
    if (assertion) {
      triggerHaptic('success');
      return true;
    }
  } catch (err) {
    console.warn('Biometric authentication failed or canceled:', err);
  }
  return false;
}
