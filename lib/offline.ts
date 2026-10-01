export type Mutation = {
  key: number;
  userId: string;
  table: string;
  id: string;
  kind: "insert" | "update" | "delete";
  input: Record<string, unknown>;
  event: string;
  conflict?: string;
  base?: Record<string, unknown>;
};
const DB = "lifeos-offline-v1";
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("cache");
      request.result.createObjectStore("queue", {
        keyPath: "key",
        autoIncrement: true,
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function operation<T>(
  store: string,
  mode: IDBTransactionMode,
  work: (s: IDBObjectStore) => IDBRequest,
): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const request = work(tx.objectStore(store));
    tx.oncomplete = () => {
      resolve(request.result as T);
      db.close();
    };
    tx.onerror = () => {
      reject(tx.error);
      db.close();
    };
    tx.onabort = () => {
      reject(tx.error);
      db.close();
    };
  });
}
export const offline = {
  read: <T>(user: string, table: string) =>
    operation<T[] | undefined>("cache", "readonly", (s) =>
      s.get(`${user}:${table}`),
    ),
  write: (user: string, table: string, rows: unknown[]) =>
    operation("cache", "readwrite", (s) => s.put(rows, `${user}:${table}`)),
  queue: (mutation: Omit<Mutation, "key"> & { key?: number }) =>
    operation("queue", "readwrite", (s) => s.add(mutation)),
  async enqueue(
    mutation: Omit<Mutation, "key">,
  ): Promise<Record<string, unknown>> {
    const db = await database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["queue", "cache"], "readwrite");
      const cache = tx.objectStore("cache");
      const key = `${mutation.userId}:${mutation.table}`;
      const request = cache.get(key);
      let row: Record<string, unknown>;
      request.onsuccess = () => {
        const rows: Record<string, unknown>[] = request.result || [];
        const existing = rows.find((r) => r.id === mutation.id);
        const base = existing
          ? Object.fromEntries(
              Object.keys(mutation.input)
                .filter((k) => existing[k] !== undefined)
                .map((k) => [k, existing[k]]),
            )
          : undefined;
        row = {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...existing,
          ...mutation.input,
          id: mutation.id,
          user_id: mutation.userId,
        };
        tx.objectStore("queue").add({ ...mutation, base });
        const next =
          mutation.kind === "delete"
            ? rows.filter((r) => r.id !== mutation.id)
            : [...rows.filter((r) => r.id !== mutation.id), row];
        cache.put(next, key);
      };
      tx.oncomplete = () => {
        resolve(row);
        db.close();
      };
      tx.onerror = () => {
        reject(tx.error);
        db.close();
      };
      tx.onabort = () => {
        reject(tx.error);
        db.close();
      };
    });
  },
  pending: () => operation<Mutation[]>("queue", "readonly", (s) => s.getAll()),
  remove: (key: number) =>
    operation("queue", "readwrite", (s) => s.delete(key)),
  clearCache: () => operation("cache", "readwrite", (s) => s.clear()),
  async clear() {
    await operation("cache", "readwrite", (s) => s.clear());
    await operation("queue", "readwrite", (s) => s.clear());
  },
};
