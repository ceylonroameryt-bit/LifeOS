'use client';

import React from 'react';
import { LifeCard } from '@/components/ui/LifeCard';
import { Briefcase, Calendar, Clock, ChevronRight } from 'lucide-react';

export function CareerCard() {
  return (
    <LifeCard className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            CAREER
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-primary">
            2 active
          </span>
        </div>

        <div className="space-y-3">
          {/* Item 1: Interview */}
          <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/70 dark:border-blue-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">
                Interview tomorrow
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 2:00 PM
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
              ABC Security
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              SOC Analyst Role • Stage 2 Technical
            </p>
          </div>

          {/* Item 2: Follow-up */}
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Follow up with recruiter
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              XYZ Ltd
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Applied 6 days ago • Recruiter: Alex
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>Job Applications & Pipeline</span>
        <span className="inline-flex items-center text-primary hover:underline">
          Career <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </LifeCard>
  );
}
