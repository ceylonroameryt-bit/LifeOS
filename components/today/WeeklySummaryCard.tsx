'use client';

import React from 'react';
import { LifeCard } from '@/components/ui/LifeCard';
import { CheckCircle2, TrendingDown, Dumbbell, Sparkles } from 'lucide-react';

export function WeeklySummaryCard() {
  return (
    <LifeCard className="p-5 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
        <span>THIS WEEK SUMMARY</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold lowercase">
          on track
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Tasks</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100">
            18 / 23
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
            <span>Money</span>
          </div>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            £14 under
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
            <span>Habits</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100">
            4 / 5 gym
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Ideas</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100">
            3 new
          </div>
        </div>
      </div>
    </LifeCard>
  );
}
