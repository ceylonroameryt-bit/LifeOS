'use client';

import React, { useState, useEffect } from 'react';
import { Habit, SlipTrigger } from '@/types';
import { habitService } from '@/lib/services/habitService';
import { Flame, Check, X, ShieldAlert, Award, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HabitsView() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'build' | 'avoid'>('all');
  const [slipModalHabit, setSlipModalHabit] = useState<Habit | null>(null);

  const loadHabits = async () => {
    const data = await habitService.getHabits();
    setHabits(data);
  };

  useEffect(() => {
    loadHabits();
    const handleUpdate = () => loadHabits();
    window.addEventListener('lifeos-habits-updated', handleUpdate);
    return () => window.removeEventListener('lifeos-habits-updated', handleUpdate);
  }, []);

  const handleToggleDay = async (habitId: string, dayIndex: number) => {
    await habitService.toggleDaySuccess(habitId, dayIndex);
    loadHabits();
  };

  const handleResist = async (habitId: string) => {
    await habitService.recordResisted(habitId);
    loadHabits();
  };

  const handleSlip = (habit: Habit) => {
    setSlipModalHabit(habit);
  };

  const submitSlip = async (trigger: SlipTrigger) => {
    if (!slipModalHabit) return;
    await habitService.recordSlip(slipModalHabit.id, trigger);
    setSlipModalHabit(null);
    loadHabits();
  };

  const filtered = habits.filter((h) => {
    if (activeTab === 'build') return h.type === 'positive';
    if (activeTab === 'avoid') return h.type === 'avoid';
    return true;
  });

  const daysLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Habits
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Build consistency and eliminate impulse behaviors
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-border/60 self-start sm:self-auto">
          {(['all', 'build', 'avoid'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all',
                activeTab === tab
                  ? 'bg-surface text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {tab === 'all' ? 'All Habits' : tab === 'build' ? 'Build' : 'Avoid'}
            </button>
          ))}
        </div>
      </div>

      {/* Habit Insights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-danger flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Best Streak
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              6 Days (No impulse buying)
            </span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-success flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Weekly Target
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              Gym (4/5 completed)
            </span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-idea flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Top Slip Trigger
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              Saw something online
            </span>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {filtered.map((habit) => (
          <div
            key={habit.id}
            className="bg-surface rounded-2xl border border-border/80 p-5 shadow-2xs space-y-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs',
                    habit.type === 'positive'
                      ? 'bg-emerald-50 text-success dark:bg-emerald-950/40'
                      : 'bg-rose-50 text-danger dark:bg-rose-950/40'
                  )}
                >
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    {habit.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {habit.type === 'positive'
                      ? `${habit.weekly_progress || '0/5'} this week • ${habit.target}`
                      : `${habit.streak}-day streak • Target: ${habit.target}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full',
                    habit.type === 'positive'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-success'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-danger'
                  )}
                >
                  {habit.streak} day streak
                </span>
              </div>
            </div>

            {/* If Positive Habit: Render M T W T F S S Day Checkers */}
            {habit.type === 'positive' && (
              <div className="pt-2 border-t border-border/60">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  This Week&apos;s Progress
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  {daysLabels.map((day, idx) => {
                    const isDone = habit.days_completed?.[idx] || false;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleDay(habit.id, idx)}
                        className={cn(
                          'flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95',
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-border/80 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                        )}
                      >
                        <span className="text-[10px] opacity-80 mb-0.5">{day}</span>
                        {isDone ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span className="w-4 h-4 flex items-center justify-center font-normal">○</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If Avoid Habit: Render Resist vs Slipped Actions */}
            {habit.type === 'avoid' && (
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {habit.common_trigger
                    ? `Most common trigger: ${habit.common_trigger}`
                    : 'Log daily resistance or slip'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleResist(habit.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-success hover:bg-emerald-100 transition-colors"
                  >
                    I resisted
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSlip(habit)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-danger hover:bg-rose-100 transition-colors"
                  >
                    I slipped
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Slip Trigger Modal (Section 26 of specifications) */}
      {slipModalHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSlipModalHabit(null)}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-card rounded-3xl p-6 shadow-float border border-border z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                What happened?
              </h3>
              <button
                type="button"
                onClick={() => setSlipModalHabit(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Identifying triggers helps build awareness without guilt.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {(['Bored', 'Stress', 'Saw something online', 'Other'] as SlipTrigger[]).map(
                (trig) => (
                  <button
                    key={trig}
                    type="button"
                    onClick={() => submitSlip(trig)}
                    className="p-3 text-left rounded-xl border border-border/80 hover:border-danger/40 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all hover:bg-rose-50/50 dark:hover:bg-rose-950/20"
                  >
                    {trig}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => setSlipModalHabit(null)}
              className="w-full text-center text-xs text-slate-400 font-medium hover:text-slate-600 pt-2"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
