'use client';

import React from 'react';
import { LifeCard } from '@/components/ui/LifeCard';
import { CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface MoneyCardProps {
  remaining?: number;
  spent?: number;
  budget?: number;
  currency?: string;
}

export function MoneyCard({
  remaining = 42,
  spent = 108,
  budget = 150,
  currency = '£',
}: MoneyCardProps) {
  const percentage = Math.min(Math.round((spent / budget) * 100), 100);

  return (
    <LifeCard className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
            MONEY
          </span>
          <span className="text-[11px] font-normal lowercase tracking-normal text-slate-400">
            this week
          </span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            {currency}{remaining}
          </span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            left
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currency}{spent} of {currency}{budget} spent
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>72% of budget used</span>
        <span className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
          Money <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </LifeCard>
  );
}
