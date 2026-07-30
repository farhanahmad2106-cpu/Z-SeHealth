import { X, Crown, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { useUserStats } from '../context/UserStatsContext';

interface UpgradeModalProps {
  onClose: () => void;
  onGoToPricing: () => void;
}

const TIER_LABELS: Record<string, { name: string; color: string }> = {
  free:    { name: 'Z-Free',    color: 'text-gray-400' },
  starter: { name: 'Z-Starter', color: 'text-amber-400' },
  pro:     { name: 'Z-Pro',     color: 'text-violet-400' },
  elite:   { name: 'Z-Elite',   color: 'text-emerald-400' },
};

export default function UpgradeModal({ onClose, onGoToPricing }: UpgradeModalProps) {
  const { tier, scansUsed, scanLimit } = useUserStats();
  const used = scansUsed ?? 0;
  const limit = scanLimit ?? 20;
  const progress = Math.min((used / Math.max(limit, 1)) * 100, 100);
  const tierInfo = TIER_LABELS[tier] ?? TIER_LABELS['free'];

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-4xl p-7 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-gray-400 hover:text-white transition-all active:scale-95"
          aria-label="Close upgrade modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
          <Zap className="w-6 h-6 text-rose-400" />
        </div>

        {/* Text */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-outfit text-white mb-2 leading-tight">
            Monthly Scan Limit Reached
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            You've used <span className="text-white font-semibold">{used}/{limit}</span> scans this month on your <span className={`font-semibold ${tierInfo.color}`}>{tierInfo.name}</span> plan. Upgrade to continue scanning.
          </p>
        </div>

        {/* Usage Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Scans Used</span>
            <span>{used} / {limit}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Upgrade options */}
        <div className="space-y-3 mb-6">
          {tier === 'free' && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Z-Starter — ₹366/month</p>
                <p className="text-xs text-gray-400">80 scans · NVIDIA LLaMA + Gemini</p>
              </div>
            </div>
          )}
          {(tier === 'free' || tier === 'starter') && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Z-Pro — ₹732/month</p>
                <p className="text-xs text-gray-400">200 scans · NVIDIA Advanced + Barcode</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <Crown className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Z-Elite — ₹998/month</p>
              <p className="text-xs text-gray-400">500 scans · Sarvam AI + All 50 Languages</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onGoToPricing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95"
            id="upgrade-modal-cta"
          >
            <Crown className="w-4 h-4" />
            View All Plans
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700 text-sm font-medium transition-all active:scale-95"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
