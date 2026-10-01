'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Flame,
  Briefcase,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function WeeklyReviewView() {
  const [priority1, setPriority1] = useState('Ace technical interview at ABC Security');
  const [priority2, setPriority2] = useState('Build phishing training tool parser');
  const [priority3, setPriority3] = useState('Maintain £150 weekly budget target');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Weekly Review & Retrospective
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Evaluate what moved forward this week and commit to 3 priorities for next week
        </p>
      </div>

      {/* Real Performance Metrics Grid (Section 43 of specifications) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tasks
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">
            18/23
          </span>
          <span className="text-[11px] text-success font-medium">78% completed</span>
        </div>

        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Money
          </span>
          <span className="text-xl font-extrabold text-success mt-1 block">
            £42 left
          </span>
          <span className="text-[11px] text-slate-400">Under £150 budget</span>
        </div>

        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Gym Habit
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">
            4/5
          </span>
          <span className="text-[11px] text-slate-400">Days completed</span>
        </div>

        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Applications
          </span>
          <span className="text-xl font-extrabold text-primary mt-1 block">
            3 Active
          </span>
          <span className="text-[11px] text-primary/80 font-medium">1 interview</span>
        </div>

        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Key Dates
          </span>
          <span className="text-xl font-extrabold text-amber-500 mt-1 block">
            2 Due
          </span>
          <span className="text-[11px] text-slate-400">Netflix & Car Ins.</span>
        </div>
      </div>

      {/* Choose Top 3 Priorities for Next Week */}
      <form onSubmit={handleSave} className="bg-surface rounded-3xl border border-border/80 p-6 shadow-2xs space-y-5">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Choose 3 Priorities For Next Week
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Focus is about elimination. When everything is important, nothing is.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
              1
            </span>
            <input
              type="text"
              required
              value={priority1}
              onChange={(e) => setPriority1(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-border/80 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
              2
            </span>
            <input
              type="text"
              required
              value={priority2}
              onChange={(e) => setPriority2(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-border/80 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
              3
            </span>
            <input
              type="text"
              required
              value={priority3}
              onChange={(e) => setPriority3(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-border/80 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-bold text-success flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Next week priorities locked!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            Lock Priorities
          </button>
        </div>
      </form>
    </div>
  );
}
