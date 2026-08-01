import React from 'react';
import { HelpCircle, X, Search, Camera, Flame, Globe, Mail } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-outfit text-white">Help & Support</h2>
            <p className="text-xs text-gray-400">Learn how to get the most out of Z-SeHealth</p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-emerald-400" /> AI Food Scanning
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Take a clear picture of any dish or raw ingredient. Our AI vision pipeline identifies food items, calculates macros (calories, protein, carbs, fats), and checks ingredient safety.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-blue-400" /> Food Search & Multi-Meal Logging
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Search over 1,000+ Indian foods. Use the multi-select tools to select multiple food items, adjust quantities, and batch log them directly to your daily macro summary.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-purple-400" /> Indian Language Translator
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Tap the Translator option on any food card to translate ingredient lists into 50+ regional Indian languages instantly.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-amber-400" /> Daily Streaks & Quotas
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Log in daily to keep your active streak alive! Free tier members receive 20 AI food scans per month. Upgrade to Starter, Pro, or Elite for higher scan quotas and premium Sarvam AI support.
            </p>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
            <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Need Personal Support?</p>
              <p className="text-xs text-emerald-300">Contact us at <span className="font-semibold text-emerald-200">support@z-sehealth.com</span></p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-emerald-950/40"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
