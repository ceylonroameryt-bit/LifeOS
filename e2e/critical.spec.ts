import { test, expect } from "@playwright/test";
test("private app rejects a second valid account and has no public signup", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: /Create.*account/i }),
  ).toHaveCount(0);
  await page.getByLabel("Email").fill("other@lifeos.test");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?error=access/);
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "available only to its owner",
  );
  await page.goto("/money");
  await expect(page).toHaveURL(/\/login/);
});
test("protected routes redirect to sign in", async ({ page }) => {
  await page.goto("/career");
  await expect(page).toHaveURL(/\/login\?next=%2Fcareer/);
  await expect(
    page.getByRole("heading", { name: "LifeOS", exact: true }),
  ).toBeVisible();
});
test("sign in, real navigation, task persistence and sign out", async ({
  page,
}) => {
  page.on("pageerror", (error) => console.error("Browser error:", error.stack));
  await page.goto("/login");
  await page.getByLabel("Email").fill("test@lifeos.test");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today/);
  await expect(
    page.getByText("Test User", { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "Tasks", exact: true }).first().click();
  await expect(page).toHaveURL(/\/tasks/);
  await page.getByRole("button", { name: "New Task", exact: true }).click();
  await page.getByRole("button", { name: "Task", exact: true }).click();
  await page
    .getByPlaceholder("What needs to be done?")
    .fill("Persisted browser task");
  await page.getByRole("button", { name: /Save Task/i }).click();
  await expect(page.getByText("Persisted browser task")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Persisted browser task")).toBeVisible();
  await page.context().setOffline(true);
  await page.getByRole("button", { name: "New Task", exact: true }).click();
  await page.getByRole("button", { name: "Task", exact: true }).click();
  await page
    .getByPlaceholder("What needs to be done?")
    .fill("Offline browser task");
  await page.getByRole("button", { name: /Save Task/i }).click();
  await expect(page.getByText("Offline browser task")).toBeVisible();
  await expect(page.getByText("1 pending changes")).toBeVisible();
  await page.context().setOffline(false);
  await expect(page.getByText("1 pending changes")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Offline browser task")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/today/);
  await page
    .getByRole("button", { name: "Sign out", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/tasks");
  await expect(page).toHaveURL(/\/login/);
});
test("service worker provides an explicit offline launch screen", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await page.evaluate(async () => {
    await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto("/today");
  await expect(
    page.getByRole("heading", { name: "LifeOS is offline" }),
  ).toBeVisible();
  await context.setOffline(false);
});
test("career records, linked CV/recruiter and status changes persist", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("test@lifeos.test");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today/);
  await page.goto("/career");
  const recruiters = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Recruiters", exact: true }),
  });
  await recruiters.getByText("Add recruiter", { exact: true }).click();
  await recruiters
    .getByLabel("Name", { exact: true })
    .fill("Browser Recruiter");
  await recruiters.getByRole("button", { name: "Save recruiter" }).click();
  await expect(
    recruiters.getByText("Browser Recruiter", { exact: false }).first(),
  ).toBeVisible();
  const cvs = page.locator("section").filter({
    has: page.getByRole("heading", { name: "CV versions", exact: true }),
  });
  await cvs.getByText("Add CV version", { exact: true }).click();
  await cvs.getByLabel("Name", { exact: true }).fill("Browser CV");
  await cvs.getByRole("button", { name: "Save CV version" }).click();
  await expect(cvs.getByText(/^Browser CV/).first()).toBeVisible();
  await page.getByRole("button", { name: "Add Job", exact: true }).click();
  await page
    .getByPlaceholder("Job Title (e.g. SOC Analyst)")
    .fill("Browser Role");
  await page
    .getByPlaceholder("Company (e.g. ABC Security)")
    .fill("Browser Company");
  await page
    .getByRole("combobox", { name: "Recruiter", exact: true })
    .selectOption({ label: "Browser Recruiter" });
  await page
    .getByRole("combobox", { name: "CV version", exact: true })
    .selectOption({ label: "Browser CV" });
  await page.getByRole("button", { name: "Save Job", exact: true }).click();
  await page.getByRole("heading", { name: /Browser Role/ }).click();
  await page.getByRole("button", { name: "Offer", exact: true }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await expect(page.getByText("Offer", { exact: true })).toBeVisible();
  const interviews = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Interviews", exact: true }),
  });
  await interviews.getByText("Schedule interview", { exact: true }).click();
  await interviews
    .getByRole("combobox", { name: "Job", exact: true })
    .selectOption({ label: "Browser Role — Browser Company" });
  await interviews.getByLabel("Date", { exact: true }).fill("2026-10-02");
  await interviews.getByRole("button", { name: "Save interview" }).click();
  await expect(interviews.getByText(/Browser Role • 2026-10-02/)).toBeVisible();
  const followups = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Follow-ups", exact: true }),
  });
  await followups.getByText("Add follow-up", { exact: true }).click();
  await followups
    .getByRole("combobox", { name: "Job", exact: true })
    .selectOption({ label: "Browser Role — Browser Company" });
  await followups.getByLabel("Date", { exact: true }).fill("2026-10-03");
  await followups.getByRole("button", { name: "Save follow-up" }).click();
  await followups
    .getByRole("button", { name: "Complete", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByText(/Browser Company • 2026-10-03 • completed/),
  ).toBeVisible();
});
test("focus sessions and weekly priorities survive reloads", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("test@lifeos.test");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today/);
  await page.goto("/focus");
  await page.getByLabel("Focus task").fill("Browser focus");
  await page.getByRole("button", { name: "Start Focus", exact: true }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("Focus task")).toHaveValue("Browser focus");
  await page.getByTitle("Complete Session").click();
  await page.goto("/weekly-review");
  await page.getByLabel("Priority 1").fill("First priority");
  await page.getByLabel("Priority 2").fill("Second priority");
  await page.getByLabel("Priority 3").fill("Third priority");
  await page.getByRole("button", { name: "Lock Priorities" }).click();
  await expect(page.getByText("Next week priorities locked!")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Priority 1")).toHaveValue("First priority");
});

test("online data export includes the full account without auth secrets", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("test@lifeos.test");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/today/);
  await page.goto("/settings");
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export LifeOS Data Download JSON", exact: true })
    .click();
  const download = await downloaded;
  const file = await download.path();
  expect(file).toBeTruthy();
  const { readFileSync } = await import("node:fs");
  const content = readFileSync(file!, "utf8");
  const backup = JSON.parse(content);
  expect(backup.format).toBe("lifeos-account-export");
  expect(backup.version).toBe(1);
  expect(backup.account_id).toBe("00000000-0000-4000-8000-000000000001");
  expect(backup.records.profiles[0].name).toBe("Test User");
  for (const table of [
    "user_settings",
    "income",
    "subscriptions",
    "savings_goals",
    "expense_categories",
    "tasks",
    "jobs",
    "focus_sessions",
    "weekly_reviews",
  ])
    expect(Array.isArray(backup.records[table])).toBe(true);
  expect(
    backup.records.expense_categories.some(
      (row: { name: string }) => row.name === "Food",
    ),
  ).toBe(true);
  expect(content).not.toContain("test-refresh-token");
  expect(content).not.toContain("test-signature");
});
