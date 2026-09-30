'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface TodayHeroProps {
  userName: string;
  greeting: string;
  formattedDate: string;
}

export function TodayHero({ userName, greeting, formattedDate }: TodayHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-amber-50/40 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-amber-950/10 border border-slate-200/60 dark:border-slate-800/60 p-6 sm:p-8">
      {/* Decorative Soft Sunrise Arc & Scenery Element */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-40 dark:opacity-20 flex items-center justify-end pr-6">
        <svg
          viewBox="0 0 200 200"
          className="w-48 h-48 text-amber-300 dark:text-amber-500 fill-current blur-2xl transform translate-x-12 -translate-y-8"
        >
          <circle cx="100" cy="100" r="80" />
        </svg>
      </div>

      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{formattedDate}</span>
        </div>

        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {greeting}
        </p>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">
          {userName}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium italic">
          “A better day starts with a clearer mind.”
        </p>
      </div>
    </div>
  );
}
