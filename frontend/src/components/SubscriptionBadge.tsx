import { Crown, Zap, Sparkles, Star } from 'lucide-react';
import { useUserStats } from '../context/UserStatsContext';

interface SubscriptionBadgeProps {
  /** 'full' shows icon + label, 'icon' shows icon only */
  variant?: 'full' | 'icon';
  onUpgradeClick?: () => void;
}

const TIER_CONFIG: Record<string, {
  label: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  text: string;
}> = {
  free: {
    label: 'FREE',
    icon: <Star className="w-3 h-3" />,
    bg: 'bg-slate-800/80',
    border: 'border-slate-700',
    text: 'text-gray-400',
  },
  starter: {
    label: 'STARTER',
    icon: <Zap className="w-3 h-3" />,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
  pro: {
    label: 'PRO',
    icon: <Sparkles className="w-3 h-3" />,
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
  },
  elite: {
    label: 'ELITE',
    icon: <Crown className="w-3 h-3" />,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
  },
};

export default function SubscriptionBadge({ variant = 'full', onUpgradeClick }: SubscriptionBadgeProps) {
  const { tier } = useUserStats();
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG['free'];
  const isClickable = !!onUpgradeClick;

  const badge = (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bg} ${config.border} ${config.text} ${isClickable ? 'cursor-pointer hover:scale-105 hover:border-emerald-400 hover:shadow-md transition-all active:scale-95' : ''}`}
      onClick={isClickable ? onUpgradeClick : undefined}
      id="subscription-badge"
      title={isClickable ? 'Upgrade your plan' : `Current plan: ${config.label}`}
    >
      {config.icon}
      {variant === 'full' && (
        <span className="text-[9px] font-black uppercase tracking-widest">{config.label}</span>
      )}
    </div>
  );

  return badge;
}
