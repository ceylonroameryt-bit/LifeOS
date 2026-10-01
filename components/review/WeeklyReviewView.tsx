"use client";

import { activityService } from "@/lib/services/activityService";
import { reviewMetrics } from "@/lib/services/reviewMetrics";
import { useData } from "@/lib/useData";
import { format, startOfWeek } from "date-fns";
import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  CreditCard,
  Flame,
  Briefcase,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function WeeklyReviewView() {
  const metrics = useData(
    reviewMetrics,
    {
      tasks_completed: 0,
      tasks_total: 0,
      budget_spent: 0,
      budget_target: 0,
      habits_rate: 0,
      applications_count: 0,
      key_dates_count: 0,
    },
    "lifeos-review-updated",
  );
  const [priority1, setPriority1] = useState("");
  const [priority2, setPriority2] = useState("");
  const [priority3, setPriority3] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void activityService.getReviews().then((rows) => {
      const row = rows.find(
        (r) =>
          r.week_start_date ===
          format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
      );
      if (row) {
        setPriority1(row.priority_1 || "");
        setPriority2(row.priority_2 || "");
        setPriority3(row.priority_3 || "");
      }
    });
  }, []);
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await activityService.saveReview({
      priority_1: priority1,
      priority_2: priority2,
      priority_3: priority3,
    });
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
          Evaluate what moved forward this week and commit to 3 priorities for
          next week
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {[
          ["Tasks", `${metrics.tasks_completed}/${metrics.tasks_total}`],
          [
            "Money",
            `£${(metrics.budget_target - metrics.budget_spent).toFixed(2)} left`,
          ],
          ["Habits", `${metrics.habits_rate}% logged success`],
          ["Applications", String(metrics.applications_count)],
          ["Key Dates", `${metrics.key_dates_count} due`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs"
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              {label}
            </span>
            <span className="block text-xl font-bold mt-1">{value}</span>
          </div>
        ))}
      </div>
      {/* Choose Top 3 Priorities for Next Week */}
      <form
        onSubmit={handleSave}
        className="bg-surface rounded-3xl border border-border/80 p-6 shadow-2xs space-y-5"
      >
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Choose 3 Priorities For Next Week
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Focus is about elimination. When everything is important, nothing
            is.
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
              aria-label="Priority 1"
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
              aria-label="Priority 2"
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
              aria-label="Priority 3"
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
