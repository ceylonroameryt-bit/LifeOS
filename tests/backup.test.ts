import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const owner = "11111111-1111-4111-8111-111111111111";
const stranger = "22222222-2222-4222-8222-222222222222";
const mock = vi.hoisted(() => ({
  rows: {} as Record<string, Record<string, unknown>[]>,
  errorTable: "",
  goOfflineOnTable: "",
  verifiedUsers: [] as (string | null)[],
  calls: [] as { table: string; method: string; args: unknown[] }[],
  pendingBatches: [] as { userId: string }[][],
  syncError: "",
  syncWait: null as Promise<void> | null,
  sync: vi.fn(),
  authenticated: vi.fn(),
}));

vi.mock("@/lib/services/store", () => ({
  authenticated: async () => {
    mock.authenticated();
    return {
      user: {
        id: "11111111-1111-4111-8111-111111111111",
        access_token: "must-never-be-exported",
      },
      client: {
        auth: {
          getUser: async () => {
            const id = mock.verifiedUsers.shift();
            return { data: { user: id ? { id } : null }, error: null };
          },
        },
        from: (table: string) => {
          const builder = {
            select: (...args: unknown[]) => {
              mock.calls.push({ table, method: "select", args });
              return builder;
            },
            eq: (...args: unknown[]) => {
              mock.calls.push({ table, method: "eq", args });
              return builder;
            },
            or: (...args: unknown[]) => {
              mock.calls.push({ table, method: "or", args });
              return builder;
            },
            order: (...args: unknown[]) => {
              mock.calls.push({ table, method: "order", args });
              return builder;
            },
            range: async (start: number, end: number) => {
              mock.calls.push({ table, method: "range", args: [start, end] });
              if (table === mock.goOfflineOnTable)
                Object.defineProperty(navigator, "onLine", { value: false });
              return {
                data: (mock.rows[table] || []).slice(start, end + 1),
                error:
                  table === mock.errorTable ? { message: "Read denied" } : null,
              };
            },
          };
          return builder;
        },
      },
    };
  },
  syncQueue: async () => {
    mock.sync();
    if (mock.syncWait) await mock.syncWait;
    if (mock.syncError) throw new Error(mock.syncError);
  },
}));
vi.mock("@/lib/offline", () => ({
  offline: { pending: async () => mock.pendingBatches.shift() || [] },
}));
vi.mock("@/lib/services/profileService", () => ({
  profileService: { getProfile: async () => ({ email: "me@example.test" }) },
}));
vi.mock("@/lib/services/activityService", () => ({
  activityService: {
    getNotifications: async () => ({ task_reminders: false }),
  },
}));
vi.mock("@/components/me/NotificationHistory", () => ({
  NotificationHistory: () => null,
}));

import { backupService } from "@/lib/services/backupService";
import { MeView } from "@/components/me/MeView";

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(navigator, "onLine", {
    value: true,
    configurable: true,
  });
  mock.rows = {
    profiles: [{ id: owner, name: "Actual profile", email: "me@example.test" }],
    user_settings: [{ id: "settings", user_id: owner, theme: "dark" }],
    income: [{ id: "income", user_id: owner, amount: 1000 }],
    subscriptions: [{ id: "subscription", user_id: owner, amount: 12 }],
    savings_goals: [{ id: "saving", user_id: owner, title: "Emergency fund" }],
    expense_categories: [
      { id: "default", user_id: null, name: "Other" },
      { id: "custom", user_id: owner, name: "Travel" },
    ],
  };
  mock.errorTable = "";
  mock.goOfflineOnTable = "";
  mock.calls = [];
  mock.verifiedUsers = [owner, owner];
  mock.pendingBatches = [[], []];
  mock.syncError = "";
  mock.syncWait = null;
});

describe("complete account data export", () => {
  it("includes every application data table and actual profile/settings/money records", async () => {
    const data = await backupService.exportData();
    const directory = join(process.cwd(), "supabase", "migrations");
    const schemaTables = new Set(
      readdirSync(directory)
        .filter((file) => file.endsWith(".sql"))
        .flatMap((file) =>
          Array.from(
            readFileSync(join(directory, file), "utf8").matchAll(
              /CREATE TABLE(?: IF NOT EXISTS)? public\.(\w+)/gi,
            ),
            (match) => match[1],
          ),
        )
        .filter((table) => table !== "private_app_owner"),
    );
    expect(Object.keys(data.records).sort()).toEqual([...schemaTables].sort());
    expect(data).toMatchObject({
      format: "lifeos-account-export",
      version: 1,
      account_id: owner,
      records: {
        profiles: mock.rows.profiles,
        user_settings: mock.rows.user_settings,
        income: mock.rows.income,
        subscriptions: mock.rows.subscriptions,
        savings_goals: mock.rows.savings_goals,
        expense_categories: mock.rows.expense_categories,
      },
    });
    expect(Number.isNaN(Date.parse(data.exported_at))).toBe(false);
    expect(mock.sync).toHaveBeenCalledOnce();
    expect(JSON.stringify(data)).not.toContain("must-never-be-exported");
    expect(data.records).not.toHaveProperty("private_app_owner");
  });

  it("queries owner and shared categories under RLS and paginates every row", async () => {
    mock.rows.expense_categories = Array.from({ length: 1001 }, (_, id) => ({
      id: `category-${id}`,
      user_id: id % 2 ? owner : null,
      name: `Category ${id}`,
    }));
    mock.rows.tasks = Array.from({ length: 1001 }, (_, id) => ({
      id: `task-${id}`,
      user_id: owner,
      title: `Task ${id}`,
    }));
    const data = await backupService.exportData();
    expect(data.records.expense_categories).toHaveLength(1001);
    expect(data.records.tasks).toHaveLength(1001);
    expect(mock.calls).toContainEqual({
      table: "expense_categories",
      method: "or",
      args: [`user_id.is.null,user_id.eq.${owner}`],
    });
    expect(mock.calls).toContainEqual({
      table: "tasks",
      method: "eq",
      args: ["user_id", owner],
    });
    expect(mock.calls).toContainEqual({
      table: "profiles",
      method: "eq",
      args: ["id", owner],
    });
    for (const table of ["tasks", "expense_categories"])
      expect(mock.calls).toContainEqual({
        table,
        method: "range",
        args: [1000, 1999],
      });
  });

  it("rejects a read failure instead of returning a partial export", async () => {
    mock.errorTable = "subscriptions";
    await expect(backupService.exportData()).rejects.toThrow(
      "Export failed for subscriptions: Read denied",
    );
  });

  it("refuses offline cached exports before authentication or reads", async () => {
    Object.defineProperty(navigator, "onLine", { value: false });
    await expect(backupService.exportData()).rejects.toThrow(
      "Connect to the internet",
    );
    expect(mock.authenticated).not.toHaveBeenCalled();
    expect(mock.calls).toHaveLength(0);
  });

  it("refuses export when synchronization fails", async () => {
    mock.syncError = "Sync conflict";
    await expect(backupService.exportData()).rejects.toThrow("Sync conflict");
    expect(mock.calls).toHaveLength(0);
  });

  it("discards a partial read if the connection goes offline during export", async () => {
    mock.goOfflineOnTable = "profiles";
    await expect(backupService.exportData()).rejects.toThrow(
      "Connect to the internet",
    );
  });

  it("refuses export if own pending changes remain after synchronization", async () => {
    mock.pendingBatches = [[{ userId: owner }]];
    await expect(backupService.exportData()).rejects.toThrow(
      "Finish syncing your pending changes",
    );
    expect(mock.calls).toHaveLength(0);
  });

  it("refuses a completed read if a new offline change arrived during export", async () => {
    mock.pendingBatches = [[], [{ userId: owner }]];
    await expect(backupService.exportData()).rejects.toThrow(
      "Finish syncing your pending changes",
    );
  });

  it("does not block on retained changes belonging to another account", async () => {
    mock.pendingBatches = [[{ userId: stranger }], [{ userId: stranger }]];
    await expect(backupService.exportData()).resolves.toHaveProperty(
      "account_id",
      owner,
    );
  });

  it("refuses a different account after sync before reading any data", async () => {
    mock.verifiedUsers = [stranger];
    await expect(backupService.exportData()).rejects.toThrow(
      "Your account changed or the session expired",
    );
    expect(mock.calls).toHaveLength(0);
  });

  it.each([stranger, null])(
    "refuses a changed or signed-out account after reading (%j)",
    async (id) => {
      mock.verifiedUsers = [owner, id];
      await expect(backupService.exportData()).rejects.toThrow(
        "Your account changed or the session expired",
      );
    },
  );

  it("refuses foreign records even if a database response bypasses its filters", async () => {
    mock.rows.tasks = [{ id: "foreign", user_id: stranger, title: "Private" }];
    await expect(backupService.exportData()).rejects.toThrow(
      "a record does not belong to your account",
    );
  });

  it("refuses an empty profile caused by missing setup or denied owner access", async () => {
    mock.rows.profiles = [];
    await expect(backupService.exportData()).rejects.toThrow(
      "Your profile could not be exported",
    );
  });

  it("shows export progress, prevents duplicate clicks, and displays a local error without success", async () => {
    let finishSync!: () => void;
    mock.syncWait = new Promise((resolve) => {
      finishSync = resolve;
    });
    mock.syncError = "Sync conflict";
    render(
      createElement(MeView, {
        userName: "Owner",
        onUpdateName: () => {},
        isDark: false,
        onToggleTheme: () => {},
      }),
    );
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: /Export LifeOS Data/ });
    await user.click(button);
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Preparing…");
    await user.click(button);
    expect(mock.sync).toHaveBeenCalledOnce();
    finishSync();
    expect(await screen.findByRole("alert")).toHaveTextContent("Sync conflict");
    expect(button).toBeEnabled();
    expect(screen.queryByText("Download started")).not.toBeInTheDocument();
  });
});
