import { Habit, HabitEntry, HabitType, SlipTrigger } from "@/types";
import { list, insert, upsert } from "./store";
import { startOfWeek, format, addDays, subDays } from "date-fns";
const date = (d: Date) => format(d, "yyyy-MM-dd");
export const habitService = {
  async getHabits(): Promise<Habit[]> {
    const [habits, entries] = await Promise.all([
      list<Habit>("habits"),
      list<HabitEntry>("habit_entries"),
    ]);
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return habits.map((h) => {
      const own = entries.filter((e) => e.habit_id === h.id);
      const days = Array.from({ length: 7 }, (_, i) =>
        own.some(
          (e) =>
            e.entry_date === date(addDays(start, i)) && e.status === "success",
        ),
      );
      let streak = 0;
      let day = new Date();
      if (
        !own.some((e) => e.entry_date === date(day) && e.status === "success")
      )
        day = subDays(day, 1);
      while (
        own.some((e) => e.entry_date === date(day) && e.status === "success")
      ) {
        streak++;
        day = subDays(day, 1);
      }
      return {
        ...h,
        streak,
        days_completed: days,
        weekly_progress: days.filter(Boolean).length + "/7",
        slip_count: own.filter((e) => e.status === "slip").length,
        common_trigger: own.filter((e) => e.status === "slip").at(-1)?.trigger,
      };
    });
  },
  async createHabit(input: {
    name: string;
    type: HabitType;
    target?: string;
  }): Promise<Habit> {
    const row = await insert<Habit>(
      "habits",
      { ...input, target: input.target || "", is_active: true },
      "habits",
    );
    return { ...row, streak: 0, days_completed: Array(7).fill(false) };
  },
  async entry(
    habit_id: string,
    entry_date: string,
    status: HabitEntry["status"],
    trigger?: SlipTrigger,
    notes?: string,
  ) {
    await upsert(
      "habit_entries",
      { habit_id, entry_date, status, trigger, notes },
      "habit_id,entry_date",
      "habits",
    );
  },
  async toggleDaySuccess(id: string, index: number) {
    if (index < 0 || index > 6) throw new Error("Invalid day");
    const day = date(
      addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), index),
    );
    const existing = (await list<HabitEntry>("habit_entries")).find(
      (e) => e.habit_id === id && e.entry_date === day,
    );
    await this.entry(
      id,
      day,
      existing?.status === "success" ? "skipped" : "success",
    );
  },
  async recordResisted(id: string) {
    await this.entry(id, date(new Date()), "success");
  },
  async recordSlip(id: string, trigger: SlipTrigger, notes?: string) {
    await this.entry(id, date(new Date()), "slip", trigger, notes);
  },
};
