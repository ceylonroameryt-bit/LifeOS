// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import { beforeAll, afterAll, expect, it } from "vitest";
let db: PGlite;
const A = "00000000-0000-4000-8000-000000000001",
  B = "00000000-0000-4000-8000-000000000002";
const job = "00000000-0000-4000-8000-000000000003";
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb DEFAULT '{}');CREATE ROLE authenticated;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid$$;GRANT USAGE ON SCHEMA auth TO authenticated;GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;`,
  );
  for (const file of fs.readdirSync("supabase/migrations").sort()) {
    // PGlite provides gen_random_uuid; only the unsupported extension declaration
    // and equivalent UUID default are adapted. Schema and policies execute unchanged.
    const sql = fs
      .readFileSync("supabase/migrations/" + file, "utf8")
      .replace(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp";/g, "")
      .replaceAll("uuid_generate_v4()", "gen_random_uuid()");
    await db.exec(sql);
  }
  await db.exec(
    `INSERT INTO auth.users(id,email) VALUES('${A}','a@test.local'),('${B}','b@test.local');GRANT USAGE ON SCHEMA public TO authenticated;GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO authenticated;INSERT INTO jobs(id,user_id,job_title,company) VALUES('${job}','${B}','Private','B');SET ROLE authenticated;SET request.jwt.claim.sub='${A}';`,
  );
}, 30000);
afterAll(async () => {
  await db?.close();
});
it("new users get profiles, settings, budgets and notification preferences", async () => {
  const result = await db.query<{ name: string }>(
    `SELECT name FROM profiles WHERE id='${A}'`,
  );
  expect(result.rows).toEqual([{ name: "" }]);
  expect((await db.query("SELECT * FROM budgets")).rows).toHaveLength(2);
  expect(
    (await db.query("SELECT * FROM notification_preferences")).rows,
  ).toHaveLength(1);
});
it("hides other account jobs", async () => {
  expect((await db.query("SELECT * FROM jobs")).rows).toEqual([]);
});
it("rejects cross-row interview and follow-up ownership", async () => {
  await expect(
    db.exec(
      `INSERT INTO interviews(user_id,job_id,interview_date) VALUES('${A}','${job}',CURRENT_DATE)`,
    ),
  ).rejects.toThrow(/row-level security/);
  await expect(
    db.exec(
      `INSERT INTO job_followups(user_id,job_id,followup_date) VALUES('${A}','${job}',CURRENT_DATE)`,
    ),
  ).rejects.toThrow(/row-level security/);
});
it("prevents editing shared categories", async () => {
  const before = (await db.query("SELECT * FROM expense_categories")).rows
    .length;
  await db.exec("DELETE FROM expense_categories WHERE user_id IS NULL");
  expect(
    (await db.query("SELECT * FROM expense_categories")).rows,
  ).toHaveLength(before);
});
it("stores expense notes and category references", async () => {
  await db.exec(
    `INSERT INTO expenses(user_id,amount,description,notes,category_id) SELECT '${A}',2.35,'Lunch','Receipt saved',id FROM expense_categories WHERE name='Food' AND user_id IS NULL`,
  );
  expect(
    (await db.query<{ notes: string }>("SELECT notes FROM expenses")).rows[0]
      .notes,
  ).toBe("Receipt saved");
});
it("converts captures atomically and rejects repeated conversions", async () => {
  const source = "00000000-0000-4000-8000-000000000009";
  await db.exec(
    `INSERT INTO inbox_items(id,user_id,content) VALUES('${source}','${A}','Captured task')`,
  );
  await db.query(
    `SELECT public.convert_capture('inbox_items','${source}','task')`,
  );
  expect(
    (await db.query(`SELECT * FROM tasks WHERE title='Captured task'`)).rows,
  ).toHaveLength(1);
  await expect(
    db.query(`SELECT public.convert_capture('inbox_items','${source}','task')`),
  ).rejects.toThrow("already processed");
  expect(
    (await db.query(`SELECT * FROM tasks WHERE title='Captured task'`)).rows,
  ).toHaveLength(1);
});
it("persists review priorities, focus history, and notification read state", async () => {
  await db.exec(
    `INSERT INTO weekly_reviews(user_id,week_start_date,priority_1) VALUES('${A}',CURRENT_DATE,'Priority');INSERT INTO focus_sessions(user_id,duration_minutes,status) VALUES('${A}',25,'completed');INSERT INTO notifications(user_id,title,dedupe_key) VALUES('${A}','Reminder','test');UPDATE notifications SET read_at=now() WHERE dedupe_key='test';`,
  );
  expect(
    (await db.query("SELECT priority_1 FROM weekly_reviews")).rows,
  ).toEqual([{ priority_1: "Priority" }]);
  expect((await db.query("SELECT status FROM focus_sessions")).rows).toEqual([
    { status: "completed" },
  ]);
  expect(
    (await db.query<{ read_at: string }>("SELECT read_at FROM notifications"))
      .rows[0].read_at,
  ).toBeTruthy();
});
it("rejects links to another user’s category, recruiter, CV, habit, and task", async () => {
  await db.exec(
    `RESET ROLE;INSERT INTO expense_categories(id,user_id,name) VALUES('00000000-0000-4000-8000-000000000004','${B}','Private');INSERT INTO recruiters(id,user_id,name) VALUES('00000000-0000-4000-8000-000000000005','${B}','Private');INSERT INTO cv_versions(id,user_id,name) VALUES('00000000-0000-4000-8000-000000000006','${B}','Private');INSERT INTO habits(id,user_id,name) VALUES('00000000-0000-4000-8000-000000000007','${B}','Private');INSERT INTO tasks(id,user_id,title) VALUES('00000000-0000-4000-8000-000000000008','${B}','Private');SET ROLE authenticated;`,
  );
  for (const sql of [
    `INSERT INTO expenses(user_id,amount,description,category_id) VALUES('${A}',1,'Test','00000000-0000-4000-8000-000000000004')`,
    `INSERT INTO jobs(user_id,job_title,company,recruiter_id) VALUES('${A}','Test','Test','00000000-0000-4000-8000-000000000005')`,
    `INSERT INTO jobs(user_id,job_title,company,cv_version_id) VALUES('${A}','Test','Test','00000000-0000-4000-8000-000000000006')`,
    `INSERT INTO habit_entries(user_id,habit_id,status) VALUES('${A}','00000000-0000-4000-8000-000000000007','success')`,
    `INSERT INTO focus_sessions(user_id,task_id) VALUES('${A}','00000000-0000-4000-8000-000000000008')`,
  ])
    await expect(db.exec(sql)).rejects.toThrow(/row-level security/);
});
