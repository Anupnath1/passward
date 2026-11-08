import React, { useState } from 'react';
import { 
  Globe, 
  Smartphone, 
  Mail, 
  Wifi, 
  Landmark, 
  Key, 
  Copy, 
  Check, 
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { PasswordEntry, PasswordCategory } from '../types/vault';
import { triggerHaptic } from '../utils/biometrics';

interface PasswordCardProps {
  entry: PasswordEntry;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onCopyPassword: (password: string, serviceName: string) => void;
}

export const getCategoryIcon = (category: PasswordCategory) => {
  switch (category) {
    case 'website':
      return <Globe className="w-4 h-4" />;
    case 'app':
      return <Smartphone className="w-4 h-4" />;
    case 'email':
      return <Mail className="w-4 h-4" />;
    case 'wifi':
      return <Wifi className="w-4 h-4" />;
    case 'financial':
      return <Landmark className="w-4 h-4" />;
    default:
      return <Key className="w-4 h-4" />;
  }
};

export const getCategoryColor = (category: PasswordCategory) => {
  switch (category) {
    case 'website':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60';
    case 'app':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60';
    case 'email':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60';
    case 'wifi':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60';
    case 'financial':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60';
    default:
      return 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700';
  }
};

export const PasswordCard: React.FC<PasswordCardProps> = ({
  entry,
  onClick,
  onToggleFavorite,
  onCopyPassword,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('tap');
    onCopyPassword(entry.password, entry.serviceName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group w-full p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-150 cursor-pointer flex items-center justify-between gap-3 text-left"
    >
      {/* Left Icon & Service Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs ${getCategoryColor(
            entry.category
          )}`}
        >
          {getCategoryIcon(entry.category)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">
              {entry.serviceName}
            </h4>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-200 font-mono truncate mt-0.5 font-medium">
            {entry.username || 'No username'}
          </p>
        </div>
      </div>

      {/* Right Controls: Star & Copy Password */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggleFavorite}
          title={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-2 rounded-xl transition-colors ${
            entry.isFavorite
              ? 'text-amber-500 hover:text-amber-600'
              : 'text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400'
          }`}
        >
          <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handleCopy}
          title="Copy Password"
          className={`min-w-[42px] h-10 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            copied
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 hover:text-indigo-800 dark:hover:text-indigo-200'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden xs:inline">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden xs:inline">Copy</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
