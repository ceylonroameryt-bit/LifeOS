'use client';

import React from 'react';
import {
  TrendingUp,
  CreditCard,
  Flame,
  Briefcase,
  Lightbulb,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function InsightsView() {
  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Personal Insights & Patterns
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Factual behavioural observations derived strictly from your LifeOS activity
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Productivity */}
        <div className="bg-surface rounded-3xl border border-border/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-primary">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Productivity Observations
            </h3>
          </div>
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border/60">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                78% Task Completion Rate
              </span>
              <span>18 out of 23 planned tasks were completed on time this week.</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border/60">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Peak Execution Window: 9:00 AM – 11:30 AM
              </span>
              <span>Highest concentration of completed tasks occurs in morning blocks.</span>
            </div>
          </div>
        </div>

        {/* 2. Finances & Impulse Control */}
        <div className="bg-surface rounded-3xl border border-border/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-success">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Financial Discipline
            </h3>
          </div>
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border/60">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                £24 less spent than last week
              </span>
              <span>Weekly spending is £108 of your £150 budget (72% spent, £42 remaining).</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border/60">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Impulse Delay: Sony Lens (£450)
              </span>
              <span>41 hours remaining in mandatory cooling-off period. Zero unplanned purchases.</span>
            </div>
          </div>
        </div>

        {/* 3. Habits & Resistance */}
        <div className="bg-surface rounded-3xl border border-border/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-danger">
            <Flame className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Habits & Triggers
            </h3>
          </div>
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border/60">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                6-Day Streak: No impulse buying
              </span>
              <span>Longest unbroken resistance streak recorded this month.</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border/60">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Slip Trigger Factual Summary
              </span>
              <span>Most common logged trigger: &quot;Saw something online&quot; (typically 9:00 PM – midnight).</span>
            </div>
          </div>
        </div>

        {/* 4. Career Velocity */}
        <div className="bg-surface rounded-3xl border border-border/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-primary">
            <Briefcase className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Career Trajectory
            </h3>
          </div>
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border/60">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                3 Active Applications • 1 Technical Interview
              </span>
              <span>SOC CV v12 currently used on all submissions with 33% interview conversion.</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border/60">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Next Immediate Action
              </span>
              <span>Tomorrow 2:00 PM: Stage 2 Technical Interview with ABC Security.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
