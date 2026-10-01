'use client';

import React from 'react';
import { LifeCard } from '@/components/ui/LifeCard';
import { Flame, ChevronRight } from 'lucide-react';

interface HabitCardProps {
  onClick?: () => void;
}

export function HabitCard({ onClick }: HabitCardProps) {
  const habits = [
    { name: 'No impulse buying', status: '6d streak', color: 'text-rose-500' },
    { name: 'Gym', status: '4/5 week', color: 'text-emerald-500' },
    { name: 'Sleep before 12', status: '3/7 week', color: 'text-blue-500' },
  ];

  return (
    <LifeCard
      onClick={onClick}
      className="p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-danger/30 transition-all select-none group"
    >
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-danger" />
            HABITS
          </span>
          <span className="text-[10px] font-bold text-danger bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">
            6d streak
          </span>
        </div>

        <div className="space-y-2">
          {habits.map((habit, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-0.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                {habit.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {habit.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>3 active</span>
        <span className="inline-flex items-center text-primary group-hover:translate-x-0.5 transition-transform font-semibold text-[11px]">
          Habits <ChevronRight className="w-3 h-3 ml-0.5" />
        </span>
      </div>
    </LifeCard>
  );
}
