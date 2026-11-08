import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Star, 
  Globe, 
  Smartphone, 
  Mail, 
  Wifi, 
  Landmark, 
  Key 
} from 'lucide-react';
import { motion } from 'motion/react';
import { PasswordEntry, PasswordCategory } from '../types/vault';
import { generatePassword, evaluatePasswordStrength, GeneratorOptions } from '../utils/crypto';
import { triggerHaptic } from '../utils/biometrics';

interface AddEditPasswordModalProps {
  initialEntry?: PasswordEntry | null;
  onSave: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const AddEditPasswordModal: React.FC<AddEditPasswordModalProps> = ({
  initialEntry,
  onSave,
  onClose,
}) => {
  const [serviceName, setServiceName] = useState<string>(initialEntry?.serviceName || '');
  const [category, setCategory] = useState<PasswordCategory>(initialEntry?.category || 'website');
  const [username, setUsername] = useState<string>(initialEntry?.username || '');
  const [password, setPassword] = useState<string>(initialEntry?.password || '');
  const [url, setUrl] = useState<string>(initialEntry?.url || '');
  const [notes, setNotes] = useState<string>(initialEntry?.notes || '');
  const [isFavorite, setIsFavorite] = useState<boolean>(initialEntry?.isFavorite || false);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [genLength, setGenLength] = useState<number>(18);
  const [genSymbols, setGenSymbols] = useState<boolean>(true);
  const [genNumbers, setGenNumbers] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const strength = evaluatePasswordStrength(password);

  const handleQuickGenerate = () => {
    triggerHaptic('tap');
    const options: GeneratorOptions = {
      length: genLength,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: genNumbers,
      includeSymbols: genSymbols,
      avoidAmbiguous: true,
    };
    const generated = generatePassword(options);
    setPassword(generated);
    setShowPassword(true);
  };

  const handleSave = () => {
    if (!serviceName.trim()) {
      setError('Service name is required');
      triggerHaptic('error');
      return;
    }
    if (!password) {
      setError('Password is required');
      triggerHaptic('error');
      return;
    }

    triggerHaptic('success');
    onSave({
      serviceName: serviceName.trim(),
      category,
      username: username.trim(),
      password,
      url: url.trim(),
      notes: notes.trim(),
      isFavorite,
    });
  };

  const categories: { key: PasswordCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'website', label: 'Website', icon: <Globe className="w-3.5 h-3.5" /> },
    { key: 'app', label: 'App', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { key: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
    { key: 'wifi', label: 'Wi-Fi', icon: <Wifi className="w-3.5 h-3.5" /> },
    { key: 'financial', label: 'Finance', icon: <Landmark className="w-3.5 h-3.5" /> },
    { key: 'other', label: 'Other', icon: <Key className="w-3.5 h-3.5" /> },
  ];

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
              {initialEntry ? 'Edit Password' : 'Save New Password'}
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              AES-256 local encrypted storage
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              title={isFavorite ? 'Starred' : 'Star as favorite'}
              className={`p-2 rounded-xl transition-colors ${
                isFavorite ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500 hover:text-amber-500'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {error && (
            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-200 font-bold">
              {error}
            </div>
          )}

          {/* Service Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Service / Platform Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Google, GitHub, Wi-Fi Living Room"
              value={serviceName}
              onChange={(e) => {
                setServiceName(e.target.value);
                setError('');
              }}
              className="w-full h-11 px-3.5 bg-slate-100/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setCategory(cat.key);
                  }}
                  className={`h-8 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    category === cat.key
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.icon}
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Username / Email */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Username, Email, or Account ID
            </label>
            <input
              type="text"
              placeholder="e.g. user@gmail.com or alex_dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-100/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-medium text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password with Generator Button & Strength */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Password *
              </label>
              <button
                type="button"
                onClick={() => setShowGenerator(!showGenerator)}
                className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showGenerator ? 'Close Generator' : 'Generate Password'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter or generate password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full h-11 pl-3.5 pr-20 bg-slate-100/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Inline Quick Generator Bar */}
            {showGenerator && (
              <div className="mt-2.5 p-3 bg-indigo-50 dark:bg-slate-850 rounded-2xl border border-indigo-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Generator Options
                  </span>
                  <span className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">
                    {genLength} chars
                  </span>
                </div>

                <input
                  type="range"
                  min="8"
                  max="40"
                  value={genLength}
                  onChange={(e) => setGenLength(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-250 dark:bg-slate-700 rounded-lg cursor-pointer mb-3"
                />

                <div className="flex items-center justify-between gap-2 text-xs mb-3">
                  <label className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={genSymbols}
                      onChange={(e) => setGenSymbols(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-indigo-600"
                    />
                    <span>Symbols (!@#)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={genNumbers}
                      onChange={(e) => setGenNumbers(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-indigo-600"
                    />
                    <span>Numbers (0-9)</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleQuickGenerate}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate & Fill Password</span>
                </button>
              </div>
            )}

            {/* Password Strength Meter */}
            {password && (
              <div className="mt-2 pt-1 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Strength:</span>
                  <span className={`font-bold ${strength.color}`}>{strength.label}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{strength.entropyBits} bits</span>
              </div>
            )}
          </div>

          {/* URL (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Website / App URL (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. https://github.com/login"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-100/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Secure Notes (Encrypted)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Security questions, backup codes, router IP address..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-100/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Bottom Actions - Fixed */}
        <div className="p-4 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            {initialEntry ? 'Save Changes' : 'Save Password'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
