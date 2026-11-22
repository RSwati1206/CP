import React from 'react';

export default function BizConnectLogo({ className = "w-9 h-9", showText = false, textClassName = "" }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="bizBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="bizAmberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          
          {/* Background Rounded Shield / Tile */}
          <rect width="36" height="36" rx="10" fill="url(#bizBlueGradient)" />
          
          {/* Storefront Awning Profile */}
          <path 
            d="M7 13.5L10.5 7.5C11 6.6 11.9 6 12.9 6H23.1C24.1 6 25 6.6 25.5 7.5L29 13.5" 
            stroke="#ffffff" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Upper Connection Arch */}
          <path 
            d="M11 19.5C11 15.5 14.5 14 18 14C21.5 14 25 15.5 25 19.5" 
            stroke="#ffffff" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
          />
          
          {/* Business Hub Node (Left) */}
          <circle cx="11.5" cy="23" r="3.75" fill="#ffffff" />
          <circle cx="11.5" cy="23" r="1.8" fill="#2563eb" />
          
          {/* Customer / Community Node (Right - Golden Amber) */}
          <circle cx="24.5" cy="23" r="3.75" fill="url(#bizAmberGradient)" />
          <circle cx="24.5" cy="23" r="1.8" fill="#ffffff" />
          
          {/* Interconnecting Smile / Bridge */}
          <path 
            d="M11.5 26.5C14.5 29.5 21.5 29.5 24.5 26.5" 
            stroke="url(#bizAmberGradient)" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
          />
          
          {/* Central Connection Pulse */}
          <circle cx="18" cy="19.5" r="1.8" fill="#fbbf24" />
        </svg>
      </div>

      {showText && (
        <div className={textClassName}>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 dark:from-blue-400 dark:via-indigo-300 dark:to-amber-300 bg-clip-text text-transparent">
            BizConnect
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block -mt-1 tracking-widest uppercase">
            Local Commerce & Community
          </span>
        </div>
      )}
    </div>
  );
}
