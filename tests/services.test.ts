import { beforeEach, describe, expect, it, vi } from "vitest";
import { offline } from "@/lib/offline";
const mock = vi.hoisted(() => ({
  user: { id: "user-a" },
  error: null as null | { message: string },
  rows: [] as Record<string, unknown>[],
  calls: [] as { table: string; method: string; args: unknown[] }[],
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: mock.user }, error: null }),
      getSession: async () => ({ data: { session: { user: mock.user } } }),
    },
    from: (table: string) => {
      const builder: Record<string, unknown> = {};
      for (const method of [
        "select",
        "eq",
        "insert",
        "upsert",
        "update",
        "delete",
        "single",
        "order",
        "range",
      ])
        builder[method] = (...args: unknown[]) => {
          mock.calls.push({ table, method, args });
          return builder;
        };
      builder.then = (resolve: (x: unknown) => void) =>
        resolve({
          data:
            mock.calls.at(-1)?.method === "single" ? mock.rows[0] : mock.rows,
          error: mock.error,
        });
      return builder;
    },
  }),
}));
import { taskService } from "@/lib/services/taskService";
import { careerService } from "@/lib/services/careerService";
import { moneyService } from "@/lib/services/moneyService";
import { syncQueue, insert, update, list } from "@/lib/services/store";
beforeEach(async () => {
  mock.calls = [];
  mock.rows = [];
  mock.error = null;
  mock.user = { id: "user-a" };
  Object.defineProperty(navigator, "onLine", {
    value: true,
    configurable: true,
  });
  await offline.clear();
});
describe("production persistence", () => {
  it("returns empty accounts without examples", async () => {
    expect(await taskService.getTasks()).toEqual([]);
    expect(mock.calls).toContainEqual({
      table: "tasks",
      method: "eq",
      args: ["user_id", "user-a"],
    });
  });
  it("rejects failed reads and writes instead of using device storage", async () => {
    mock.error = { message: "RLS denied" };
    await expect(taskService.getTasks()).rejects.toThrow("RLS denied");
    await expect(taskService.createTask({ title: "Read" })).rejects.toThrow(
      "RLS denied",
    );
    expect(await offline.pending()).toHaveLength(0);
  });
  it("writes task ownership from authenticated user", async () => {
    mock.rows = [{ id: "task", title: "Read" }];
    await taskService.createTask({ title: "  Read  " });
    const call = mock.calls.find((c) => c.method === "insert")!;
    expect(call.args[0]).toMatchObject({
      user_id: "user-a",
      title: "Read",
      completed: false,
    });
  });
  it("updates and deletes jobs through the database", async () => {
    mock.rows = [{ id: "job" }];
    await careerService.updateJobStatus("job", "Offer");
    expect(mock.calls).toContainEqual({
      table: "jobs",
      method: "update",
      args: [{ status: "Offer" }],
    });
    expect(mock.calls).toContainEqual({
      table: "jobs",
      method: "eq",
      args: ["user_id", "user-a"],
    });
  });
  it("maps UI job names into database columns", async () => {
    mock.rows = [
      { id: "job", job_title: "Engineer", applied_at: "2026-01-01" },
    ];
    const job = await careerService.createJob({
      title: "Engineer",
      company: "Team",
      salary: "40k",
      applied_date: "2026-01-01",
    });
    expect(job.title).toBe("Engineer");
    expect(
      mock.calls.find((c) => c.method === "insert")?.args[0],
    ).toMatchObject({
      job_title: "Engineer",
      salary_raw: "40k",
      applied_at: "2026-01-01",
    });
    expect(
      mock.calls.find((c) => c.method === "insert")?.args[0],
    ).not.toHaveProperty("title");
  });
  it("rejects invalid expense amounts", async () => {
    await expect(
      moneyService.addExpense({
        amount: NaN,
        description: "bad",
        category: "Other",
      }),
    ).rejects.toThrow();
  });
  it("writes category_id and notes without the UI category field", async () => {
    mock.rows = [{ id: "category", name: "Food", user_id: null }];
    await moneyService.addExpense({
      amount: 2.345,
      description: " lunch ",
      category: "Food",
      notes: " note ",
    });
    const payload = mock.calls.find(
      (c) => c.table === "expenses" && c.method === "insert",
    )!.args[0];
    expect(payload).toMatchObject({
      amount: 2.35,
      description: "lunch",
      category_id: "category",
      notes: "note",
    });
    expect(payload).not.toHaveProperty("category");
  });
  it("rounds actual expense totals to pennies", () => {
    expect(
      moneyService.getCategoryBreakdown([
        {
          id: "a",
          user_id: "u",
          amount: 0.1,
          category: "Food",
          description: "a",
          expense_date: "",
        },
        {
          id: "b",
          user_id: "u",
          amount: 0.2,
          category: "Food",
          description: "b",
          expense_date: "",
        },
      ])[0].total,
    ).toBe(0.3);
  });
});
describe("offline queue integration", () => {
  it("queues writes, reads cached changes, and flushes on reconnect", async () => {
    await offline.write("user-a", "tasks", []);
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });
    const row = await insert<{ id: string }>(
      "tasks",
      { title: "Offline" },
      "tasks",
    );
    await update("tasks", row.id, { title: "Updated" }, "tasks");
    expect(await list("tasks")).toMatchObject([{ title: "Updated" }]);
    expect(await offline.pending()).toHaveLength(2);
    mock.rows = [{ id: row.id, title: "Offline" }];
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
    await syncQueue();
    expect(await offline.pending()).toHaveLength(0);
    expect(mock.calls.some((c) => c.method === "upsert")).toBe(true);
  });
  it("retains conflicting updates instead of overwriting another device", async () => {
    await offline.write("user-a", "tasks", [{ id: "a", title: "Original" }]);
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });
    await update("tasks", "a", { title: "Offline edit" }, "tasks");
    mock.rows = [{ id: "a", title: "Other device edit" }];
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
    await expect(syncQueue()).rejects.toThrow("Sync conflict");
    expect(await offline.pending()).toHaveLength(1);
    expect(mock.calls.some((c) => c.method === "update")).toBe(false);
  });
  it("does not replay another account’s queued data", async () => {
    await offline.queue({
      key: 1,
      userId: "user-b",
      table: "tasks",
      id: "b",
      kind: "insert",
      input: { title: "Private" },
      event: "tasks",
    });
    await syncQueue();
    expect(await offline.pending()).toHaveLength(1);
    expect(mock.calls).toHaveLength(0);
  });
  it("retains failed sync for retry", async () => {
    await offline.queue({
      key: 1,
      userId: "user-a",
      table: "tasks",
      id: "a",
      kind: "insert",
      input: { title: "Retry" },
      event: "tasks",
    });
    mock.error = { message: "database unavailable" };
    await expect(syncQueue()).rejects.toThrow("Sync stopped");
    expect(await offline.pending()).toHaveLength(1);
  });
  it("does not show another user’s cache", async () => {
    await offline.write("user-b", "tasks", [{ title: "Private" }]);
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });
    await expect(taskService.getTasks()).rejects.toThrow("No offline copy");
  });
});
