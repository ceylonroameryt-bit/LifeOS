import { format, startOfWeek, endOfWeek } from "date-fns";
import { taskService } from "./taskService";
import { moneyService } from "./moneyService";
import { careerService } from "./careerService";
import { adminService } from "./adminService";
import { list } from "./store";
import type { HabitEntry } from "@/types";
export async function reviewMetrics() {
  const start = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );
  const end = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const today = format(new Date(), "yyyy-MM-dd");
  const [tasks, expenses, budget, entries, jobs, admin] = await Promise.all([
    taskService.getTasks(),
    moneyService.getExpenses(),
    moneyService.getBudget(),
    list<HabitEntry>("habit_entries"),
    careerService.getJobs(),
    adminService.getAdminItems(),
  ]);
  const inWeek = (date?: string | null) =>
    !!date && date.slice(0, 10) >= start && date.slice(0, 10) <= end;
  const weekEntries = entries.filter((e) => inWeek(e.entry_date));
  return {
    tasks_completed: tasks.filter((t) => t.completed && inWeek(t.completed_at))
      .length,
    tasks_total: tasks.filter(
      (t) => inWeek(t.due_date) || inWeek(t.completed_at),
    ).length,
    budget_spent:
      Math.round(
        expenses
          .filter((e) => e.expense_date >= start && e.expense_date <= today)
          .reduce((s, e) => s + e.amount, 0) * 100,
      ) / 100,
    budget_target: budget,
    habits_rate: weekEntries.length
      ? Math.round(
          (weekEntries.filter((e) => e.status === "success").length /
            weekEntries.length) *
            100,
        )
      : 0,
    applications_count: jobs.filter(
      (j) => inWeek(j.applied_date) && j.status !== "Saved",
    ).length,
    key_dates_count: admin.filter(
      (a) => a.status === "active" && inWeek(a.due_date),
    ).length,
  };
}
