import React, { useState } from 'react';
import { 
  Globe, 
  Smartphone, 
  Mail, 
  Wifi, 
  Landmark, 
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
      return <Globe className="w-4 h-4" />;
  }
};

export const getCategoryColor = (category: PasswordCategory) => {
  switch (category) {
    case 'website':
      return 'bg-blue-50 text-blue-600 dark:bg-[#14213d] dark:text-blue-400 border border-blue-200 dark:border-blue-500/20';
    case 'app':
      return 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20';
    case 'email':
      return 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
    case 'wifi':
      return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
    case 'financial':
      return 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20';
    default:
      return 'bg-blue-50 text-blue-600 dark:bg-[#14213d] dark:text-blue-400 border border-blue-200 dark:border-blue-500/20';
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

  const handleCardClick = () => {
    triggerHaptic('tap');
    // Directly pop up the PasswordDetailModal on card click without needing to click "Details"
    onClick();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="group w-full p-3 bg-white dark:bg-[#101726] hover:bg-slate-50 dark:hover:bg-[#141d2e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-colors duration-150 cursor-pointer flex items-center justify-between gap-3 text-left"
    >
      {/* Left Icon */}
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs ${getCategoryColor(
          entry.category
        )}`}
      >
        {getCategoryIcon(entry.category)}
      </div>

      {/* Middle: App/Website Name & Gmail/Username (Clean display matching image_a89e4590.png) */}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">
          {entry.serviceName}
        </h4>

        <p className="text-xs text-blue-600 dark:text-blue-300/90 font-mono truncate mt-0.5 font-medium">
          {entry.username || 'No username'}
        </p>
      </div>

      {/* Right Controls: Star & Sleek Square Copy Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('tap');
            onToggleFavorite(e);
          }}
          title={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="p-1.5 rounded-xl transition-colors hover:scale-110 active:scale-95"
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              entry.isFavorite
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-400 dark:text-slate-500 hover:text-amber-400'
            }`}
          />
        </button>

        {/* Compact Square Copy Button matching image_a89e4590.png */}
        <button
          type="button"
          onClick={handleCopy}
          title="Copy Password"
          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
            copied
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-[#1a2333] hover:bg-slate-200 dark:hover:bg-[#223046] text-slate-700 dark:text-slate-300'
          }`}
        >
          {copied ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400 dark:text-slate-300" />
          )}
        </button>
      </div>
    </motion.div>
  );
};
