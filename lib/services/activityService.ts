import { FocusSession, WeeklyReview } from "@/types";
import { list, insert, update, upsert } from "./store";
import { startOfWeek, format } from "date-fns";
import { reviewMetrics } from "./reviewMetrics";
export const activityService = {
  getFocusSessions: () =>
    list<FocusSession & { remaining_seconds: number; ends_at: string | null }>(
      "focus_sessions",
    ),
  startFocus: (duration_minutes: number, task_title: string, ends_at: string) =>
    insert<FocusSession>(
      "focus_sessions",
      {
        duration_minutes,
        task_title,
        status: "in_progress",
        remaining_seconds: duration_minutes * 60,
        ends_at,
      },
      "focus",
    ),
  updateFocus: (id: string, input: object) =>
    update<FocusSession>("focus_sessions", id, input, "focus"),
  getReviews: () => list<WeeklyReview>("weekly_reviews"),
  async saveReview(input: {
    priority_1: string;
    priority_2: string;
    priority_3: string;
  }) {
    const week_start_date = format(
      startOfWeek(new Date(), { weekStartsOn: 1 }),
      "yyyy-MM-dd",
    );
    const metrics = await reviewMetrics();
    await upsert(
      "weekly_reviews",
      { ...input, ...metrics, week_start_date },
      "user_id,week_start_date",
      "review",
    );
  },
  async getNotifications() {
    return (
      (
        await list<{ id: string; task_reminders: boolean }>(
          "notification_preferences",
        )
      )[0] || null
    );
  },
  async setNotifications(enabled: boolean) {
    await upsert(
      "notification_preferences",
      {
        morning_summary: enabled,
        task_reminders: enabled,
        interview_reminders: enabled,
        followup_reminders: enabled,
        admin_reminders: enabled,
        subscription_renewal: enabled,
        evening_review: enabled,
        weekly_review: enabled,
      },
      "user_id",
      "notifications",
    );
  },
};
