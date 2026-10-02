import { authenticated, syncQueue } from "./store";
import { offline } from "@/lib/offline";

export const accountExportTables = [
  "profiles",
  "user_settings",
  "expense_categories",
  "tasks",
  "expenses",
  "income",
  "budgets",
  "subscriptions",
  "savings_goals",
  "habits",
  "habit_entries",
  "jobs",
  "interviews",
  "job_followups",
  "recruiters",
  "cv_versions",
  "ideas",
  "goals",
  "notes",
  "admin_items",
  "wishlist_items",
  "inbox_items",
  "focus_sessions",
  "weekly_reviews",
  "notification_preferences",
  "notifications",
] as const;

type ExportTable = (typeof accountExportTables)[number];
type Row = Record<string, unknown>;

export type AccountDataExport = {
  format: "lifeos-account-export";
  version: 1;
  exported_at: string;
  account_id: string;
  records: Record<ExportTable, Row[]>;
};

function requireOnline() {
  if (typeof navigator !== "undefined" && !navigator.onLine)
    throw new Error("Connect to the internet before exporting your data.");
}

async function requireSynced(userId: string) {
  if (
    typeof indexedDB !== "undefined" &&
    (await offline.pending()).some((change) => change.userId === userId)
  )
    throw new Error(
      "Finish syncing your pending changes before exporting your data.",
    );
}

/** Account data only: this is neither an auth backup nor an automatic restore. */
export const backupService = {
  async exportData(): Promise<AccountDataExport> {
    requireOnline();
    const { client, user } = await authenticated();
    const userId = user.id;
    const verifyAccount = async () => {
      requireOnline();
      const { data, error } = await client.auth.getUser();
      if (error || !data.user || data.user.id !== userId)
        throw new Error(
          "Your account changed or the session expired. Sign in and export again.",
        );
    };

    await syncQueue();
    await verifyAccount();
    await requireSynced(userId);

    const entries = await Promise.all(
      accountExportTables.map(async (table) => {
        const rows: Row[] = [];
        for (let offset = 0; ; offset += 1000) {
          requireOnline();
          let query = client.from(table).select("*");
          query =
            table === "expense_categories"
              ? query.or(`user_id.is.null,user_id.eq.${userId}`)
              : query.eq(table === "profiles" ? "id" : "user_id", userId);
          const { data, error } = await query
            .order("id")
            .range(offset, offset + 999);
          if (error)
            throw new Error(`Export failed for ${table}: ${error.message}`);
          const page = (data || []) as Row[];
          if (
            page.some((row) =>
              table === "profiles"
                ? row.id !== userId
                : table === "expense_categories"
                  ? row.user_id !== null && row.user_id !== userId
                  : row.user_id !== userId,
            )
          )
            throw new Error(
              "Export stopped because a record does not belong to your account.",
            );
          rows.push(...page);
          if (page.length < 1000) break;
        }
        return [table, rows] as const;
      }),
    );

    await verifyAccount();
    await requireSynced(userId);
    requireOnline();
    const records = Object.fromEntries(entries) as AccountDataExport["records"];
    if (records.profiles.length !== 1)
      throw new Error(
        "Your profile could not be exported. Check account access and database setup.",
      );
    return {
      format: "lifeos-account-export",
      version: 1,
      exported_at: new Date().toISOString(),
      account_id: userId,
      records,
    };
  },
};
