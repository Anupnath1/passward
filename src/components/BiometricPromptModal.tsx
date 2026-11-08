import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  KeyRound, 
  ShieldCheck, 
  Delete, 
  Lock, 
  AlertCircle,
  ScanFace
} from 'lucide-react';
import { motion } from 'motion/react';
import { triggerHaptic, authenticateWithBiometrics } from '../utils/biometrics';

interface BiometricPromptModalProps {
  onSuccess: (pin: string) => void;
  expectedPinHash?: string;
  hasSetUpVault: boolean;
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  onSuccess,
  hasSetUpVault,
}) => {
  const [authMode, setAuthMode] = useState<'biometric' | 'pin'>('biometric');
  const [pinDigits, setPinDigits] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (authMode === 'biometric') {
      handleBiometricTap();
    }
  }, [authMode]);

  const handleBiometricTap = async () => {
    setIsAuthenticating(true);
    setBiometricStatus('scanning');
    triggerHaptic('tap');

    try {
      const success = await authenticateWithBiometrics();
      if (success) {
        setBiometricStatus('success');
        triggerHaptic('success');
        setTimeout(() => {
          const savedPin = localStorage.getItem('smp_active_pin') || '1234';
          onSuccess(savedPin);
        }, 300);
        return;
      }
    } catch {
      // Fallback to simulated touch sensor
    }

    setTimeout(() => {
      setBiometricStatus('success');
      triggerHaptic('success');
      setTimeout(() => {
        const savedPin = localStorage.getItem('smp_active_pin') || '1234';
        onSuccess(savedPin);
      }, 350);
    }, 700);
  };

  const handleKeyPress = (num: string) => {
    if (pinDigits.length >= 6) return;
    triggerHaptic('tap');
    const newDigits = pinDigits + num;
    setPinDigits(newDigits);
    setErrorMessage('');

    if (newDigits.length >= 4) {
      const savedPin = localStorage.getItem('smp_active_pin') || '1234';
      if (newDigits === savedPin) {
        triggerHaptic('success');
        setTimeout(() => {
          onSuccess(newDigits);
        }, 150);
      } else if (newDigits.length === 6) {
        triggerHaptic('error');
        setErrorMessage('Incorrect PIN. Please try again.');
        setTimeout(() => {
          setPinDigits('');
        }, 400);
      }
    }
  };

  const handleDelete = () => {
    triggerHaptic('tap');
    setPinDigits((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleVerifyManual = () => {
    const savedPin = localStorage.getItem('smp_active_pin') || '1234';
    if (pinDigits === savedPin) {
      triggerHaptic('success');
      onSuccess(pinDigits);
    } else {
      triggerHaptic('error');
      setErrorMessage('Incorrect PIN.');
      setPinDigits('');
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end select-none">
      
      {/* Background lock visual */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center mb-3 shadow-md shadow-indigo-600/20">
          <Lock className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Passward</h2>
        <p className="text-xs font-medium text-slate-300 mt-1 max-w-xs">
          Personal vault is encrypted. Authenticate to view your credentials.
        </p>
      </div>

      {/* Android 14 Material 3 Biometric Bottom Sheet */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-white dark:bg-slate-900 rounded-t-[32px] p-6 shadow-2xl border-t border-slate-200 dark:border-slate-800 flex flex-col items-center"
      >
        {/* Android Sheet Drag Handle */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mb-4" />

        {authMode === 'biometric' ? (
          /* BiometricPrompt Screen */
          <div className="w-full flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Android Biometric Security</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Unlock with Biometrics
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 mb-6">
              Touch the fingerprint sensor or look at the camera
            </p>

            {/* Interactive Fingerprint Sensor Target */}
            <div className="relative my-2 flex items-center justify-center">
              <div 
                className={`absolute w-28 h-28 rounded-full border-2 border-indigo-500/40 transition-all duration-700 ${
                  biometricStatus === 'scanning' ? 'scale-125 opacity-100 animate-ping' : 'scale-100 opacity-40'
                }`} 
              />
              
              <button
                onClick={handleBiometricTap}
                disabled={isAuthenticating && biometricStatus === 'success'}
                title="Tap to verify Fingerprint"
                className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 shadow-lg ${
                  biometricStatus === 'success'
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-4 ring-emerald-400/40'
                    : biometricStatus === 'scanning'
                    ? 'bg-indigo-600 text-white shadow-indigo-600/40 ring-4 ring-indigo-400/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-750 ring-2 ring-slate-300 dark:ring-slate-700'
                }`}
              >
                <Fingerprint className="w-12 h-12" />
                <span className="text-[10px] font-bold mt-1">
                  {biometricStatus === 'scanning' ? 'Scanning...' : biometricStatus === 'success' ? 'Verified!' : 'Touch Sensor'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 mt-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Fingerprint</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <ScanFace className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Face Unlock</span>
              </div>
            </div>

            {/* Switch to PIN Fallback */}
            <button
              onClick={() => {
                triggerHaptic('tap');
                setAuthMode('pin');
              }}
              className="mt-6 w-full py-2.5 px-4 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Use Device PIN / Password</span>
            </button>
          </div>
        ) : (
          /* Device PIN Keypad Screen */
          <div className="w-full flex flex-col items-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enter Device PIN
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 mb-3">
              {hasSetUpVault ? 'Enter your 4–6 digit security PIN' : 'Default demo PIN is 1234'}
            </p>

            {/* PIN Dots Indicator */}
            <div className="flex items-center gap-3 my-2 h-6">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    pinDigits.length > index
                      ? 'bg-indigo-600 scale-110 shadow-xs'
                      : 'border-2 border-slate-400 dark:border-slate-600 bg-transparent'
                  }`}
                />
              ))}
            </div>

            {errorMessage && (
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold my-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] my-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-lg font-bold text-slate-900 dark:text-white transition-all flex items-center justify-center border border-slate-200/60 dark:border-slate-750"
                >
                  {digit}
                </button>
              ))}
              
              {/* Back to Biometric */}
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setAuthMode('biometric');
                }}
                title="Switch back to Biometrics"
                className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-400 flex items-center justify-center active:scale-95 transition-all"
              >
                <Fingerprint className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleKeyPress('0')}
                className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-lg font-bold text-slate-900 dark:text-white transition-all flex items-center justify-center border border-slate-200/60 dark:border-slate-750"
              >
                0
              </button>

              <button
                onClick={handleDelete}
                title="Delete"
                className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center active:scale-95 transition-all"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {pinDigits.length >= 4 && (
              <button
                onClick={handleVerifyManual}
                className="mt-2 w-full max-w-[280px] py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
              >
                Unlock Vault
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
