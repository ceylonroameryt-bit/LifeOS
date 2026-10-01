"use client";
import { useData } from "@/lib/useData";
import { taskService } from "@/lib/services/taskService";
import { moneyService } from "@/lib/services/moneyService";
import { habitService } from "@/lib/services/habitService";
import { careerService } from "@/lib/services/careerService";
const load = async () => {
  const [tasks, expenses, habits, jobs] = await Promise.all([
    taskService.getTasks(),
    moneyService.getExpenses(),
    habitService.getHabits(),
    careerService.getJobs(),
  ]);
  return {
    completed: tasks.filter((t) => t.completed).length,
    total: tasks.length,
    spent: expenses.reduce((s, e) => s + e.amount, 0),
    habits: habits.length,
    streak: Math.max(0, ...habits.map((h) => h.streak)),
    applications: jobs.filter((j) => j.status !== "Saved").length,
    interviews: jobs.filter((j) => j.status === "Interview").length,
  };
};
export function InsightsView() {
  const data = useData(
    load,
    {
      completed: 0,
      total: 0,
      spent: 0,
      habits: 0,
      streak: 0,
      applications: 0,
      interviews: 0,
    },
    "lifeos-tasks-updated",
  );
  const pillars = [
    [
      "Productivity Observations",
      data.completed + " / " + data.total + " tasks completed",
    ],
    [
      "Financial Discipline",
      "£" + data.spent.toFixed(2) + " recorded spending",
    ],
    [
      "Habits & Triggers",
      data.habits + " habits • longest current streak " + data.streak + " days",
    ],
    [
      "Career Trajectory",
      data.applications +
        " applications • " +
        data.interviews +
        " at interview stage",
    ],
  ];
  return (
    <div className="space-y-6 pb-24 md:pb-12">
      <div>
        <h1 className="text-2xl font-bold">Personal Insights & Patterns</h1>
        <p className="text-sm text-slate-500">
          Observations from your recorded LifeOS activity
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pillars.map(([title, value]) => (
          <div
            key={title}
            className="bg-surface rounded-3xl border border-border/80 p-5 shadow-2xs space-y-3"
          >
            <h3 className="font-bold text-base">{title}</h3>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-sm">
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
