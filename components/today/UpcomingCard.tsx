'use client';

import React from 'react';
import { LifeCard } from '@/components/ui/LifeCard';
import { SEED_UPCOMING } from '@/lib/data/seedData';
import { CalendarClock, Shield, Clapperboard, FileText, ChevronRight } from 'lucide-react';

export function UpcomingCard() {
  const getIcon = (cat: string) => {
    switch (cat) {
      case 'insurance':
        return <Shield className="w-3.5 h-3.5 text-blue-500" />;
      case 'subscription':
        return <Clapperboard className="w-3.5 h-3.5 text-rose-500" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <CalendarClock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <LifeCard className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-blue-500" />
            UPCOMING
          </span>
          <span className="text-[11px] font-normal lowercase tracking-normal text-slate-400">
            next 90 days
          </span>
        </div>

        <div className="space-y-2.5">
          {SEED_UPCOMING.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm py-1 group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg px-1 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  {getIcon(item.category)}
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {item.title}
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
                {item.days_left} days
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>Life Admin & Renewals</span>
        <span className="inline-flex items-center text-primary hover:underline">
          View all <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </LifeCard>
  );
}
