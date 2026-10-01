'use client';

import React, { useState, useEffect } from 'react';
import { Goal } from '@/types';
import { goalService } from '@/lib/services/goalService';
import { Target, TrendingUp, Plus, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GoalsView() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const loadGoals = async () => {
    const data = await goalService.getGoals();
    setGoals(data);
  };

  useEffect(() => {
    loadGoals();
    const handleUpdate = () => loadGoals();
    window.addEventListener('lifeos-goals-updated', handleUpdate);
    return () => window.removeEventListener('lifeos-goals-updated', handleUpdate);
  }, []);

  const handleAdjustProgress = async (id: string, delta: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const nextVal = Math.min(100, Math.max(0, goal.progress_percentage + delta));
    await goalService.updateProgress(id, nextVal);
    loadGoals();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Goals & Milestones
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Long-term trajectory across Career, Finances, and Life
        </p>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="bg-surface rounded-3xl border border-border/80 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full',
                    goal.category === 'Career'
                      ? 'bg-blue-50 text-primary dark:bg-blue-950/60'
                      : goal.category === 'Money'
                      ? 'bg-emerald-50 text-success dark:bg-emerald-950/60'
                      : 'bg-purple-light text-purple dark:bg-purple/20'
                  )}
                >
                  {goal.category}
                </span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                  {goal.progress_percentage}%
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {goal.title}
              </h3>

              {goal.target_value && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Target: <span className="font-semibold text-slate-700 dark:text-slate-300">{goal.target_value}</span>
                </p>
              )}

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-3">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${goal.progress_percentage}%` }}
                />
              </div>

              {goal.next_action && (
                <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-border/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{goal.next_action}</span>
                </div>
              )}
            </div>

            {/* Quick Adjustment Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <span className="text-[11px] text-slate-400 font-medium">Update Progress</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAdjustProgress(goal.id, -5)}
                  className="p-1.5 rounded-lg border border-border text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustProgress(goal.id, +5)}
                  className="p-1.5 rounded-lg border border-border text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
