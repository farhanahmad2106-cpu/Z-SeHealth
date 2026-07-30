import { Zap } from 'lucide-react';
import { useUserStats } from '../context/UserStatsContext';

interface UsageIndicatorProps {
  /** If true, shows a compact inline version (for navbar). Defaults to full card version. */
  compact?: boolean;
  onUpgradeClick?: () => void;
}

export default function UsageIndicator({ compact = false, onUpgradeClick }: UsageIndicatorProps) {
  const { tier, scansUsed, scanLimit, loadingStats } = useUserStats();

  const used = scansUsed ?? 0;
  const limit = scanLimit ?? 20;
  const percent = Math.min((used / Math.max(limit, 1)) * 100, 100);

  // Color based on usage percentage
  const barColor =
    percent >= 100 ? 'from-rose-500 to-red-600' :
    percent >= 80  ? 'from-amber-500 to-orange-500' :
    'from-emerald-500 to-teal-500';

  const textColor =
    percent >= 100 ? 'text-rose-400' :
    percent >= 80  ? 'text-amber-400' :
    'text-emerald-400';

  if (loadingStats) {
    return (
      <div className={`${compact ? 'h-5 w-24' : 'h-14'} bg-slate-800/50 rounded-2xl animate-pulse`} />
    );
  }

  if (compact) {
    // Compact: inline bar for navbar / header
    return (
      <button
        onClick={onUpgradeClick}
        className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-full px-3 py-1.5 transition-all active:scale-95 group"
        title={`${used}/${limit} scans used this month`}
        id="usage-indicator-compact"
      >
        <Zap className={`w-3 h-3 ${textColor} flex-shrink-0`} />
        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={`text-[10px] font-black ${textColor}`}>{used}/{limit}</span>
      </button>
    );
  }

  // Full card version for Dashboard
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-4xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${textColor}`} />
          <span className="text-sm font-semibold text-white">AI Scans</span>
        </div>
        <span className={`text-xs font-black uppercase tracking-widest ${textColor}`}>
          {tier.toUpperCase()}
        </span>
      </div>

      {/* Bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          <span className={`font-semibold ${textColor}`}>{used}</span> / {limit} used this month
        </span>
        {percent >= 80 && onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
            id="usage-indicator-upgrade-cta"
          >
            Upgrade →
          </button>
        )}
      </div>

      {percent >= 100 && (
        <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 text-center font-medium">
          Monthly limit reached — upgrade to keep scanning
        </div>
      )}
    </div>
  );
}
