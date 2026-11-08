import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FolderGit2, 
  Terminal, 
  ShieldCheck, 
  Smartphone 
} from 'lucide-react';
import { motion } from 'motion/react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidProjectFiles';
import { downloadAndroidProjectZip } from '../utils/zipExport';
import { triggerHaptic } from '../utils/biometrics';

interface AndroidProjectModalProps {
  onClose: () => void;
}

export const AndroidProjectModal: React.FC<AndroidProjectModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleCopyCode = () => {
    triggerHaptic('tap');
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    triggerHaptic('success');
    try {
      await downloadAndroidProjectZip();
    } catch (err) {
      console.error('Failed to create project zip:', err);
      alert('Failed to package project zip.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full max-w-3xl max-h-[calc(100%-1rem)] h-[88vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-250 dark:border-slate-800 flex flex-col overflow-hidden my-auto"
      >
        {/* Top Header - Fixed & Rock-solid */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Native Android 14 Source & APK Project
                </h3>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                  API 34 · Kotlin · Compose
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Android KeyStore AES-256 · BiometricPrompt · Zero Internet Permission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Zipping...' : 'Download Project (.ZIP)'}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 shrink-0 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-95 flex items-center justify-center text-slate-800 dark:text-slate-200 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Explorer & Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left File Tree Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 flex flex-col shrink-0">
            <div className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Android Files</span>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
              {ANDROID_PROJECT_FILES.map((file) => (
                <button
                  key={file.path}
                  onClick={() => {
                    triggerHaptic('tap');
                    setSelectedFile(file);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-start gap-2 ${
                    selectedFile.path === file.path
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                      : 'text-slate-800 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-medium'
                  }`}
                >
                  <FileCode className="w-4 h-4 shrink-0 mt-0.5 text-slate-500 dark:text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{file.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                      {file.path.split('/')[0]}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Build Command Box */}
            <div className="p-3 bg-slate-100 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white mb-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Build APK via CLI</span>
              </div>
              <code className="block bg-slate-900 text-indigo-300 p-1.5 rounded-md font-mono text-[10px] select-all">
                ./gradlew assembleDebug
              </code>
            </div>
          </div>

          {/* Right Code Content Pane */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
            {/* File Path & Copy Bar */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-medium truncate">{selectedFile.path}</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
              <pre className="text-slate-200 whitespace-pre">
                {selectedFile.content}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer with Installation Guidance - Fixed */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0 sticky bottom-0 z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Target SDK: Android 14 (API 34) · Ready to open in Android Studio & deploy</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP Archive</span>
            </button>
            <button
              onClick={onClose}
              className="py-1.5 px-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
