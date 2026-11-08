import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CopyCheck, 
  CheckCircle2, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { PasswordEntry } from '../types/vault';
import { evaluatePasswordStrength } from '../utils/crypto';
import { getCategoryColor, getCategoryIcon } from './PasswordCard';

interface SecurityAuditModalProps {
  entries: PasswordEntry[];
  onClose: () => void;
  onSelectEntry: (entry: PasswordEntry) => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({
  entries,
  onClose,
  onSelectEntry,
}) => {
  const weakEntries: PasswordEntry[] = [];
  const passwordCounts: Record<string, number> = {};

  entries.forEach((e) => {
    const strength = evaluatePasswordStrength(e.password);
    if (strength.score <= 1) {
      weakEntries.push(e);
    }
    passwordCounts[e.password] = (passwordCounts[e.password] || 0) + 1;
  });

  const reusedEntries = entries.filter((e) => passwordCounts[e.password] > 1);

  const totalEntries = entries.length;
  let healthScore = 100;
  if (totalEntries > 0) {
    const weakPenalty = (weakEntries.length / totalEntries) * 50;
    const reusedPenalty = (reusedEntries.length / totalEntries) * 40;
    healthScore = Math.max(10, Math.round(100 - weakPenalty - reusedPenalty));
  }

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
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Security & Vault Audit
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Password hygiene & vulnerability analysis
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

        {/* Scrollable Audit Report */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          
          {/* Health Score Card */}
          <div className="p-4 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Vault Health Rating
              </span>
              <div className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <span>{healthScore}%</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  healthScore >= 80
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : healthScore >= 60
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {healthScore >= 80 ? 'Good Security' : healthScore >= 60 ? 'Needs Attention' : 'Vulnerable'}
                </span>
              </div>
            </div>

            <div className="text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
              <p><strong className="text-slate-950 dark:text-white">{entries.length}</strong> total passwords</p>
              <p><strong className="text-slate-950 dark:text-white">{weakEntries.length}</strong> weak</p>
              <p><strong className="text-slate-950 dark:text-white">{reusedEntries.length}</strong> reused</p>
            </div>
          </div>

          {/* Reused Passwords Section */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2">
              <CopyCheck className="w-3.5 h-3.5" />
              <span>Reused Across Services ({reusedEntries.length})</span>
            </div>

            {reusedEntries.length === 0 ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero duplicate passwords detected. Great hygiene!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {reusedEntries.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      onClose();
                      onSelectEntry(e);
                    }}
                    className="p-2.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${getCategoryColor(e.category)}`}>
                        {getCategoryIcon(e.category)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {e.serviceName}
                        </p>
                        <p className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 truncate">
                          {e.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-300 shrink-0">
                      <span>Update</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weak Passwords Section */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Weak or Short Passwords ({weakEntries.length})</span>
            </div>

            {weakEntries.length === 0 ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>All passwords satisfy minimum security strength standards.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {weakEntries.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      onClose();
                      onSelectEntry(e);
                    }}
                    className="p-2.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${getCategoryColor(e.category)}`}>
                        {getCategoryIcon(e.category)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {e.serviceName}
                        </p>
                        <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400">
                          Low entropy ({evaluatePasswordStrength(e.password).entropyBits} bits)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                      <span>Strengthen</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Audit runs entirely within your device's memory. No passwords are ever checked against external APIs or web services.
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
