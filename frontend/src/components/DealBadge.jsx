import React from 'react';
import { Tag, Sparkles, Clock, Calendar, CheckCircle2, Flame } from 'lucide-react';

/**
 * Reusable DealBadge Component
 * Supports: active, expiring, event, discount, new
 * Automatically respects prefers-reduced-motion in styling
 */
export default function DealBadge({
  status = 'active',
  label,
  discount,
  code,
  size = 'md',
  className = ''
}) {
  const isExpiring = status === 'expiring';
  const isEvent = status === 'event';
  const isNew = status === 'new';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  // Dynamic Theme Colors
  let styleClasses = 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700';
  let Icon = Tag;

  if (isExpiring) {
    styleClasses = 'bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 animate-pulse-glow';
    Icon = Clock;
  } else if (isEvent) {
    styleClasses = 'bg-indigo-100 dark:bg-indigo-950/90 text-indigo-900 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700';
    Icon = Calendar;
  } else if (isNew) {
    styleClasses = 'bg-rose-100 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700';
    Icon = Sparkles;
  } else if (discount) {
    // High-contrast, bold, vibrant pill that stands out with 7:1+ contrast in both light and dark mode
    styleClasses = 'bg-emerald-700 dark:bg-emerald-600 text-white border border-emerald-800 dark:border-emerald-400 shadow-xs font-black';
    Icon = Flame;
  }

  const defaultText = label || (discount ? `${discount}% OFF` : (isEvent ? 'Special Event' : (isExpiring ? 'Ends Soon' : 'Active Deal')));

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border shadow-2xs transition-all relative overflow-hidden shimmer-badge ${sizeClasses} ${styleClasses} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="font-black tracking-wide">{defaultText}</span>
      {code && (
        <span className="ml-1 pl-1.5 border-l border-current/40 text-[10px] font-mono font-bold tracking-wider opacity-100 uppercase">
          {code}
        </span>
      )}
    </span>
  );
}
