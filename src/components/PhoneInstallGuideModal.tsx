import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Check, 
  Copy, 
  ShieldCheck, 
  Zap, 
  Package, 
  Terminal
} from 'lucide-react';
import { motion } from 'motion/react';
import QRCode from 'qrcode';
import { downloadAndroidProjectZip } from '../utils/zipExport';
import { triggerHaptic } from '../utils/biometrics';

interface PhoneInstallGuideModalProps {
  onClose: () => void;
}

export const PhoneInstallGuideModal: React.FC<PhoneInstallGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'studio'>('pwa');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code:', err));
    }
  }, [currentUrl]);

  const handleCopyUrl = () => {
    triggerHaptic('tap');
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    triggerHaptic('success');
    try {
      await downloadAndroidProjectZip();
    } catch {
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
        className="w-full max-w-2xl max-h-[calc(100%-1rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-250 dark:border-slate-800 flex flex-col overflow-hidden my-auto"
      >
        {/* Top Header - Fixed & Rock-solid */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                How to Use on Your Phone
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Install directly on Android · Standalone App
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 shrink-0 rounded-full bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method Switcher Tabs */}
        <div className="px-5 pt-3 pb-2 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('pwa');
            }}
            className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Method 1: Direct App Install</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-1.5 py-0.2 rounded-md font-bold">
              Fastest
            </span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('apk');
            }}
            className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-indigo-500" />
            <span>Method 2: Sideload APK</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('studio');
            }}
            className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'studio'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4 text-slate-500" />
            <span>Method 3: Android Studio</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Direct Install */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/70 flex flex-col sm:flex-row items-center gap-4">
                {/* QR Code */}
                {qrDataUrl && (
                  <div className="bg-white p-2.5 rounded-2xl shadow-sm shrink-0 flex flex-col items-center border border-indigo-100">
                    <img src={qrDataUrl} alt="Scan QR Code" className="w-32 h-32 rounded-lg" />
                    <span className="text-[10px] text-slate-700 font-bold mt-1">Scan with phone</span>
                  </div>
                )}

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    Recommended: No Computer or Cables Required
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    Scan to Open Directly on Your Android Phone
                  </h4>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
                    Point your phone camera at the QR code, or copy the link to open in <strong>Google Chrome</strong>.
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="flex-1 h-8 px-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Step Instructions */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  How to Install on Android in 3 Steps:
                </h5>

                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Open in Google Chrome on your phone
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                      Open Chrome and visit the link or scan the QR code above.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Tap Chrome's Menu (⋮) &gt; "Install app" or "Add to Home screen"
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                      Chrome detects the application and shows the <strong>"Install app"</strong> button.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Done! It installs as an independent application
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                      It sits on your phone's Home Screen and App Drawer with its own icon, has no browser address bars, works without internet, and uses your phone's fingerprint sensor!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Sideload Native APK */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Installing a Native Android .APK File (Sideloading)
                </h4>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Android allows you to install apps directly from `.apk` files without using the Google Play Store.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Enable "Install Unknown Apps" on Android
                    </p>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                      Settings &gt; Apps &gt; Special app access &gt; Install unknown apps
                    </div>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      Select your phone's <strong>Files</strong> app and turn on <strong>"Allow from this source"</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Transfer or Download the `app-debug.apk` to your phone
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                      Send the compiled `.apk` to your phone via USB cable, Google Drive, or local storage.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Tap the file and click "Install"
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                      Open your phone's <strong>Files</strong> or <strong>Downloads</strong> folder, tap `app-debug.apk`, and tap <strong>Install</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Download Source Button */}
              <div className="pt-1">
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{isZipping ? 'Packaging Project...' : 'Download Android 14 Project (.ZIP) to Build APK'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Android Studio Direct */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Developer Direct Deploy via Android Studio
                </h4>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Run the native Kotlin + Jetpack Compose app directly onto your physical phone with live debugging.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Enable USB Debugging on your phone
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                      Go to <strong>Settings &gt; About phone</strong> and tap <strong>Build Number</strong> 7 times. In <strong>Developer options</strong>, turn on <strong>USB Debugging</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Open Project in Android Studio
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                      Download the project ZIP below, extract it, and select <strong>File &gt; Open</strong> in Android Studio.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Plug in your phone and hit Run (▶)
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                      Select your phone in the device toolbar and click the green <strong>Run</strong> button.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{isZipping ? 'Packaging Project...' : 'Download Android Studio Project (.ZIP)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70 rounded-xl flex items-center gap-2 text-xs font-medium text-indigo-900 dark:text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>All credentials remain encrypted on your device using AES-256.</span>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Got It
          </button>
        </div>
      </motion.div>
    </div>
  );
};
