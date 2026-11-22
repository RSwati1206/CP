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
  let styleClasses = 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  let Icon = Tag;

  if (isExpiring) {
    styleClasses = 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse-glow';
    Icon = Clock;
  } else if (isEvent) {
    styleClasses = 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    Icon = Calendar;
  } else if (isNew) {
    styleClasses = 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    Icon = Sparkles;
  } else if (discount) {
    styleClasses = 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-sm shadow-emerald-500/20';
    Icon = Flame;
  }

  const defaultText = label || (discount ? `${discount}% OFF` : (isEvent ? 'Special Event' : (isExpiring ? 'Ends Soon' : 'Active Deal')));

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border shadow-2xs transition-all relative overflow-hidden shimmer-badge ${sizeClasses} ${styleClasses} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="font-extrabold tracking-wide">{defaultText}</span>
      {code && (
        <span className="ml-1 pl-1.5 border-l border-current/30 text-[10px] font-mono tracking-wider opacity-90 uppercase">
          {code}
        </span>
      )}
    </span>
  );
}
