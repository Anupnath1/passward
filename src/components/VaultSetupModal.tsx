import React, { useState } from 'react';
import { ShieldCheck, Lock, Sparkles, Key } from 'lucide-react';
import { motion } from 'motion/react';
import { triggerHaptic } from '../utils/biometrics';

interface VaultSetupModalProps {
  onCompleteSetup: (pin: string, includeSamples: boolean) => void;
}

export const VaultSetupModal: React.FC<VaultSetupModalProps> = ({ onCompleteSetup }) => {
  const [pin, setPin] = useState<string>('1234');
  const [confirmPin, setConfirmPin] = useState<string>('1234');
  const [includeSamples, setIncludeSamples] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const handleStart = () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      triggerHaptic('error');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      triggerHaptic('error');
      return;
    }
    triggerHaptic('success');
    onCompleteSetup(pin, includeSamples);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col items-center text-center"
      >
        {/* Shield Icon */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-3 shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Passward
        </h2>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 mb-4 leading-relaxed">
          Personal password manager. Encrypted locally with AES-256.
        </p>

        {/* PIN Selection */}
        <div className="w-full bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl p-4 mb-4 text-left border border-slate-200 dark:border-slate-700/80">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Set Device Master PIN</span>
          </label>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            placeholder="e.g. 1234"
            className="w-full h-11 px-3 text-center text-lg font-mono font-bold tracking-widest bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1.5">
            Confirm Master PIN
          </label>
          <input
            type="password"
            maxLength={6}
            value={confirmPin}
            onChange={(e) => {
              setConfirmPin(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            placeholder="e.g. 1234"
            className="w-full h-11 px-3 text-center text-lg font-mono font-bold tracking-widest bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-2">{error}</p>}
        </div>

        {/* Preload Samples Checkbox */}
        <label className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100/70 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 mb-5 cursor-pointer text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Load starter password entries
            </span>
          </div>
          <input
            type="checkbox"
            checked={includeSamples}
            onChange={(e) => setIncludeSamples(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
        </label>

        {/* Primary Action Button */}
        <button
          onClick={handleStart}
          className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all"
        >
          <Key className="w-4 h-4" />
          <span>Create Master Vault</span>
        </button>

        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-3">
          Protected by Android Keystore & Biometrics
        </p>
      </motion.div>
    </div>
  );
};
