"use client";

import React from "react";
import { useData } from "@/lib/useData";
import { taskService } from "@/lib/services/taskService";
import { habitService } from "@/lib/services/habitService";
import { ideaService } from "@/lib/services/ideaService";
const loadSummary = async () => {
  const [tasks, habits, ideas] = await Promise.all([
    taskService.getTasks(),
    habitService.getHabits(),
    ideaService.getIdeas(),
  ]);
  return {
    completed: tasks.filter((t) => t.completed).length,
    total: tasks.length,
    habits: habits.length,
    ideas: ideas.length,
  };
};
import { LifeCard } from "@/components/ui/LifeCard";
import { CheckCircle2, TrendingDown, Dumbbell, Sparkles } from "lucide-react";

interface WeeklySummaryCardProps {
  onClick?: () => void;
}

export function WeeklySummaryCard({ onClick }: WeeklySummaryCardProps) {
  const summary = useData(
    loadSummary,
    { completed: 0, total: 0, habits: 0, ideas: 0 },
    "lifeos-tasks-updated",
  );
  return (
    <LifeCard
      onClick={onClick}
      className="p-5 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60 cursor-pointer hover:border-primary/40 transition-all select-none"
    >
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
        <span>LIFE SUMMARY</span>
        <span className="text-success font-semibold lowercase">overview</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>Tasks</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100">
            {summary.completed} / {summary.total}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-success" />
            <span>Money</span>
          </div>
          <div className="text-base font-bold text-success">View budget</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Dumbbell className="w-3.5 h-3.5 text-idea" />
            <span>Habits</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100">
            {summary.habits} active
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple" />
            <span>Ideas</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100">
            {summary.ideas} saved
          </div>
        </div>
      </div>
    </LifeCard>
  );
}
