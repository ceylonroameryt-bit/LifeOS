import { createClient } from "@/lib/supabase/client";
import { offline, type Mutation } from "@/lib/offline";

export function reportError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("lifeos-error", { detail: message }));
  throw new Error(message);
}

export async function authenticated() {
  const client = createClient();
  if (!client)
    return reportError(
      "Supabase is not configured. Set the public URL and anon key.",
    );
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const { data } = await client.auth.getSession();
    if (!data.session?.user)
      return reportError("Sign in online before using offline mode.");
    return { client, user: data.session.user };
  }
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    return reportError(error?.message || "Please sign in to continue.");
  return { client, user: data.user };
}

export function changed(event: string) {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(`lifeos-${event}-updated`));
}

export async function list<T>(table: string): Promise<T[]> {
  const { client, user } = await authenticated();
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const cached = await offline.read<T>(user.id, table);
    if (!cached)
      return reportError(
        "No offline copy is available. Open this module online first.",
      );
    return cached;
  }
  await syncQueue();
  const rows: Record<string, unknown>[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .eq(table === "profiles" ? "id" : "user_id", user.id)
      .order("id")
      .range(offset, offset + 999);
    if (error) return reportError(error.message);
    rows.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  if (typeof indexedDB !== "undefined")
    await offline.write(user.id, table, rows);
  return rows as T[];
}

let syncing: Promise<void> | null = null;
export async function syncQueue() {
  if (typeof indexedDB === "undefined" || !navigator.onLine) return;
  if (syncing) return syncing;
  const run = async () => {
    const { client, user } = await authenticated();
    for (const mutation of await offline.pending()) {
      if (mutation.userId !== user.id) continue;
      if (mutation.kind === "update" && mutation.base) {
        const { data: current, error } = await client
          .from(mutation.table)
          .select("*")
          .eq("id", mutation.id)
          .eq(mutation.table === "profiles" ? "id" : "user_id", user.id)
          .single();
        if (error)
          return reportError(
            `Sync stopped: ${error.message}. Pending changes are retained.`,
          );
        if (
          !current ||
          Object.entries(mutation.base).some(
            ([key, value]) =>
              JSON.stringify(current[key]) !== JSON.stringify(value),
          )
        )
          return reportError(
            "Sync conflict: this record changed on another device. Review or discard the pending change before retrying.",
          );
      }
      const query = client.from(mutation.table);
      let updateQuery =
        mutation.kind === "update"
          ? query
              .update(mutation.input)
              .eq("id", mutation.id)
              .eq(mutation.table === "profiles" ? "id" : "user_id", user.id)
          : null;
      if (updateQuery && mutation.base)
        for (const [key, value] of Object.entries(mutation.base))
          updateQuery =
            value === null
              ? updateQuery.is(key, null)
              : updateQuery.eq(key, value);
      const result =
        mutation.kind === "insert"
          ? await query.upsert(
              { ...mutation.input, id: mutation.id, user_id: user.id },
              { onConflict: mutation.conflict || "id" },
            )
          : mutation.kind === "update"
            ? await updateQuery!.select().single()
            : await query
                .delete()
                .eq("id", mutation.id)
                .eq(mutation.table === "profiles" ? "id" : "user_id", user.id);
      if (result.error)
        return reportError(
          `Sync stopped: ${result.error.message}. Your pending change is retained.`,
        );
      await offline.remove(mutation.key);
      changed(mutation.event);
    }
    changed("sync");
  };
  syncing = (async () => {
    if (typeof navigator.locks !== "undefined")
      await navigator.locks.request("lifeos-sync", run);
    else await run();
  })().finally(() => {
    syncing = null;
  });
  return syncing;
}

async function cacheRow(
  table: string,
  userId: string,
  row: Record<string, unknown>,
) {
  if (typeof indexedDB === "undefined") return;
  const rows =
    (await offline.read<Record<string, unknown>>(userId, table)) || [];
  await offline.write(userId, table, [
    ...rows.filter((r) => r.id !== row.id),
    row,
  ]);
}

async function enqueue<T>(mutation: Omit<Mutation, "key">): Promise<T> {
  const row = await offline.enqueue(mutation);
  if ("serviceWorker" in navigator)
    void navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        const sync = (
          registration as
            | (ServiceWorkerRegistration & {
                sync?: { register: (tag: string) => Promise<void> };
              })
            | undefined
        )?.sync;
        return sync?.register("lifeos-sync");
      })
      .catch(() => {});
  changed(mutation.event);
  changed("sync");
  return row as T;
}

export async function insert<T>(
  table: string,
  input: object,
  event: string,
): Promise<T> {
  const { client, user } = await authenticated();
  if (!navigator.onLine)
    return enqueue<T>({
      userId: user.id,
      table,
      id: crypto.randomUUID(),
      kind: "insert",
      input: input as Record<string, unknown>,
      event,
    });
  await syncQueue();
  const { data, error } = await client
    .from(table)
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (error) return reportError(error.message);
  await cacheRow(table, user.id, data);
  changed(event);
  return data as T;
}

export async function upsert<T>(
  table: string,
  input: Record<string, unknown>,
  conflict: string,
  event: string,
): Promise<T> {
  const { client, user } = await authenticated();
  if (!navigator.onLine) {
    const rows =
      (await offline.read<Record<string, unknown>>(user.id, table)) || [];
    const existing = rows.find((row) =>
      conflict
        .split(",")
        .filter((k) => k !== "user_id")
        .every((k) => row[k] === input[k]),
    );
    const id = String(existing?.id || crypto.randomUUID());
    return enqueue<T>({
      userId: user.id,
      table,
      id,
      kind: existing ? "update" : "insert",
      input,
      event,
      conflict,
    });
  }
  await syncQueue();
  const { data, error } = await client
    .from(table)
    .upsert({ ...input, user_id: user.id }, { onConflict: conflict })
    .select()
    .single();
  if (error) return reportError(error.message);
  await cacheRow(table, user.id, data);
  changed(event);
  return data as T;
}

export async function update<T>(
  table: string,
  id: string,
  input: object,
  event: string,
): Promise<T> {
  const { client, user } = await authenticated();
  if (!navigator.onLine)
    return enqueue<T>({
      userId: user.id,
      table,
      id,
      kind: "update",
      input: input as Record<string, unknown>,
      event,
    });
  await syncQueue();
  const { data, error } = await client
    .from(table)
    .update(input)
    .eq("id", id)
    .eq(table === "profiles" ? "id" : "user_id", user.id)
    .select()
    .single();
  if (error) return reportError(error.message);
  await cacheRow(table, user.id, data);
  changed(event);
  return data as T;
}

export async function remove(
  table: string,
  id: string,
  event: string,
): Promise<void> {
  const { client, user } = await authenticated();
  if (!navigator.onLine) {
    await enqueue({
      userId: user.id,
      table,
      id,
      kind: "delete",
      input: {},
      event,
    });
    return;
  }
  await syncQueue();
  const { error } = await client
    .from(table)
    .delete()
    .eq("id", id)
    .eq(table === "profiles" ? "id" : "user_id", user.id);
  if (error) return reportError(error.message);
  if (typeof indexedDB !== "undefined") {
    const rows = (await offline.read<{ id: string }>(user.id, table)) || [];
    await offline.write(
      user.id,
      table,
      rows.filter((r) => r.id !== id),
    );
  }
  changed(event);
}

export async function convertCapture(
  source_table: "ideas" | "inbox_items",
  source_id: string,
  target_type: "task" | "idea" | "note" | "wishlist",
) {
  const { client } = await authenticated();
  if (!navigator.onLine)
    return reportError(
      "Conversions need an online connection. Your capture remains saved.",
    );
  const { error } = await client.rpc("convert_capture", {
    source_table,
    source_id,
    target_type,
  });
  if (error) return reportError(error.message);
  changed(source_table === "ideas" ? "ideas" : "inbox");
  changed(
    target_type === "task"
      ? "tasks"
      : target_type === "idea"
        ? "ideas"
        : target_type === "note"
          ? "notes"
          : "wishlist",
  );
}
