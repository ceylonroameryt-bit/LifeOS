'use client';

import React from 'react';
import { LifeCard } from '@/components/ui/LifeCard';
import { Flame, ChevronRight } from 'lucide-react';

export function HabitCard() {
  const habits = [
    { name: 'No impulse buying', status: '6 days streak', streak: true, color: 'text-rose-500' },
    { name: 'Gym', status: '4/5 this week', streak: false, color: 'text-amber-500' },
    { name: 'Sleep before 12', status: '3/7 this week', streak: false, color: 'text-blue-500' },
  ];

  return (
    <LifeCard className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            HABITS
          </span>
          <span className="text-[11px] font-normal lowercase tracking-normal text-slate-400">
            active
          </span>
        </div>

        <div className="space-y-2.5">
          {habits.map((habit, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm py-1">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {habit.name}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {habit.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>3 active habits</span>
        <span className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
          Habits <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </LifeCard>
  );
}
