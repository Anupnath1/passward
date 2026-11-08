import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { motion } from 'motion/react';
import { PasswordEntry } from '../types/vault';
import { evaluatePasswordStrength } from '../utils/crypto';
import { triggerHaptic } from '../utils/biometrics';
import { getCategoryColor, getCategoryIcon } from './PasswordCard';

interface PasswordDetailModalProps {
  entry: PasswordEntry;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onCopyText: (text: string, label: string) => void;
}

export const PasswordDetailModal: React.FC<PasswordDetailModalProps> = ({
  entry,
  onClose,
  onEdit,
  onDelete,
  onCopyText,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const strength = evaluatePasswordStrength(entry.password);

  const handleCopy = (text: string, fieldName: string) => {
    triggerHaptic('tap');
    onCopyText(text, fieldName);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      triggerHaptic('tap');
    } else {
      triggerHaptic('success');
      onDelete(entry.id);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full max-w-md max-h-[calc(100%-1rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-auto"
      >
        {/* Top Header Bar - Fixed & Rock-solid */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-2xs ${getCategoryColor(entry.category)}`}>
              {getCategoryIcon(entry.category)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {entry.serviceName}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                {entry.category}
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Username / Account */}
          <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Username / Email
              </span>
              <button
                onClick={() => handleCopy(entry.username, 'Username')}
                className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold hover:underline flex items-center gap-1"
              >
                {copiedField === 'Username' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white select-all break-all">
              {entry.username || '—'}
            </p>
          </div>

          {/* Password Card */}
          <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Password
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                </button>
                <span className="text-slate-400 dark:text-slate-600">·</span>
                <button
                  onClick={() => handleCopy(entry.password, 'Password')}
                  className="text-xs text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  {copiedField === 'Password' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-sm font-mono font-bold text-slate-900 dark:text-white tracking-wider select-all break-all min-h-[20px]">
              {showPassword ? entry.password : '••••••••••••••••'}
            </p>

            {/* Strength feedback */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-250 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Strength:
                </span>
                <span className={`font-bold ${strength.color}`}>
                  {strength.label}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                {strength.entropyBits} bits entropy
              </span>
            </div>
          </div>

          {/* Website / App URL */}
          {entry.url && (
            <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Website / URL
              </span>
              <a
                href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1 break-all"
              >
                <span>{entry.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Notes
              </span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {entry.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Created {new Date(entry.createdAt).toLocaleDateString()}</span>
            </span>
            <span>Updated {new Date(entry.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="p-4 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 sticky bottom-0 z-10">
          <button
            onClick={handleDeleteClick}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              confirmDelete
                ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                : 'text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60'
            }`}
          >
            {confirmDelete ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Confirm Delete?</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2 px-3.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Entry</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
