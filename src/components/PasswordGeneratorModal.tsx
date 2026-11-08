import React, { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Sliders 
} from 'lucide-react';
import { motion } from 'motion/react';
import { generatePassword, evaluatePasswordStrength, GeneratorOptions } from '../utils/crypto';
import { triggerHaptic } from '../utils/biometrics';

interface PasswordGeneratorModalProps {
  onClose: () => void;
  onCopyPassword: (password: string) => void;
}

export const PasswordGeneratorModal: React.FC<PasswordGeneratorModalProps> = ({
  onClose,
  onCopyPassword,
}) => {
  const [options, setOptions] = useState<GeneratorOptions>({
    length: 20,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    avoidAmbiguous: true,
  });

  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const regenerate = () => {
    triggerHaptic('tap');
    const pwd = generatePassword(options);
    setGeneratedPassword(pwd);
  };

  useEffect(() => {
    regenerate();
  }, [options]);

  const handleCopy = () => {
    triggerHaptic('success');
    onCopyPassword(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = evaluatePasswordStrength(generatedPassword);

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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Password Generator
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Strong cryptographic entropy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          
          {/* Password Output Box */}
          <div className="p-4 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="min-h-[48px] flex items-center justify-between gap-3">
              <p className="text-base sm:text-lg font-mono font-bold text-slate-950 dark:text-white break-all tracking-wider select-all">
                {generatedPassword}
              </p>
              
              <button
                onClick={regenerate}
                title="Regenerate password"
                className="p-2 rounded-xl text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Strength bar */}
            <div className="mt-3 pt-3 border-t border-slate-250 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className={`font-bold ${strength.color}`}>{strength.label}</span>
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono font-semibold">
                {strength.entropyBits} bits entropy · {strength.crackTimeEstimate}
              </span>
            </div>
          </div>

          {/* Controls: Length Slider */}
          <div className="p-4 bg-slate-100/70 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Password Length</span>
              </span>
              <span className="font-mono text-indigo-700 dark:text-indigo-300 text-sm font-bold">
                {options.length}
              </span>
            </div>

            <input
              type="range"
              min="8"
              max="64"
              value={options.length}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, length: parseInt(e.target.value) }))
              }
              className="w-full accent-indigo-600 h-2 bg-slate-250 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Character Criteria Checkboxes */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="p-3 bg-slate-100/70 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={options.includeUppercase}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, includeUppercase: e.target.checked }))
                }
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Uppercase (A–Z)</span>
            </label>

            <label className="p-3 bg-slate-100/70 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={options.includeLowercase}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, includeLowercase: e.target.checked }))
                }
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Lowercase (a–z)</span>
            </label>

            <label className="p-3 bg-slate-100/70 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={options.includeNumbers}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, includeNumbers: e.target.checked }))
                }
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Numbers (0–9)</span>
            </label>

            <label className="p-3 bg-slate-100/70 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={options.includeSymbols}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, includeSymbols: e.target.checked }))
                }
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Symbols (!@#)</span>
            </label>
          </div>

          <label className="p-3 bg-slate-100/70 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={options.avoidAmbiguous}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, avoidAmbiguous: e.target.checked }))
              }
              className="w-4 h-4 rounded text-indigo-600"
            />
            <span>Avoid ambiguous characters (e.g. 0, O, l, 1, I)</span>
          </label>
        </div>

        {/* Action Button - Fixed */}
        <div className="p-4 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 sticky bottom-0 z-10">
          <button
            onClick={regenerate}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-200/90 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New</span>
          </button>

          <button
            onClick={handleCopy}
            className={`py-2.5 px-5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all ${
              copied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Password</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
