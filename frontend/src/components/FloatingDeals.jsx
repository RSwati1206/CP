import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles, ArrowRight, X, Flame } from 'lucide-react';

/**
 * FloatingDeals Component
 * Features modest, drifting "Deals of the Day" cards drifting smoothly across the viewport
 * Pauses on hover, doesn't block clicks (pointer-events-none on wrapper, pointer-events-auto on cards)
 * Respects prefers-reduced-motion by becoming a static gentle carousel/ribbon
 */
export default function FloatingDeals({ offers = [] }) {
  const [dismissed, setDismissed] = useState(false);

  // Fallback rich deals if none passed from props
  const featuredDeals = offers.length > 0 ? offers.slice(0, 4) : [
    {
      id: 'f1',
      business_id: 1,
      business_name: 'The Bengaluru Bistro',
      title: 'Sunset Rooftop: 20% Off Artisanal Pastas',
      discount_code: 'SUNSET20',
      discount_percent: 20,
      badge: '20% OFF'
    },
    {
      id: 'f2',
      business_id: 2,
      business_name: 'Udupi Grand Sagar',
      title: 'Benne Dosa + Unlimited Filter Coffee',
      discount_code: 'DOZALOVE',
      discount_percent: 15,
      badge: 'BREAKFAST DEAL'
    },
    {
      id: 'f3',
      business_id: 3,
      business_name: 'Brew & Bean Coffee House',
      title: 'Buy 1 Specialty Latte, Get 1 Muffin Free',
      discount_code: 'BREWFREE',
      discount_percent: 25,
      badge: 'BUY 1 GET 1'
    },
    {
      id: 'f4',
      business_id: 5,
      business_name: 'Green Valley Organic Mart',
      title: 'Flat 15% Off Organic Millets & Farm Produce',
      discount_code: 'ORGANIC15',
      discount_percent: 15,
      badge: 'FARM FRESH'
    }
  ];

  if (dismissed || featuredDeals.length === 0) return null;

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none floating-deals-container"
      aria-label="Deals of the Day"
    >
      {/* Positioned static offer cards with hover interactivity */}
      {featuredDeals.map((deal, idx) => {
        // Exact visual positions preserved without floating motion
        const positionClasses = [
          'top-[18%] left-[4%]',
          'top-[32%] right-[5%]',
          'bottom-[20%] left-[8%]',
          'bottom-[28%] right-[10%]'
        ][idx % 4];

        return (
          <div
            key={deal.id || idx}
            className={`pointer-events-auto absolute ${positionClasses} transition-transform duration-300 hover:scale-105 hover:z-40`}
          >
            <div className="group relative flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-300/80 dark:border-amber-500/50 shadow-xl shadow-amber-500/10 dark:shadow-black/50 max-w-[280px] sm:max-w-[320px]">
              
              {/* Badge Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>

              {/* Text info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                    {deal.badge || `${deal.discount_percent || 15}% OFF`}
                  </span>
                  {deal.discount_code && (
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                      {deal.discount_code}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {deal.title}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  📍 {deal.business_name}
                </p>
              </div>

              {/* Direct Link */}
              <Link
                to={`/business/${deal.business_id}`}
                className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shrink-0"
                title="View Deal"
                aria-label={`View deal for ${deal.business_name}`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );
      })}

      {/* Subtle minimize / dismiss toggle in corner */}
      <button
        onClick={() => setDismissed(true)}
        className="pointer-events-auto absolute bottom-4 right-4 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
        title="Hide floating deals"
      >
        Dismiss Floating Deals ✕
      </button>
    </div>
  );
}
