"use client";
import { useEffect, useState } from "react";
import { offline, type Mutation } from "@/lib/offline";
import { syncQueue } from "@/lib/services/store";
import { createClient } from "@/lib/supabase/client";
export function DataStatus() {
  const [error, setError] = useState("");
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [changes, setChanges] = useState<Mutation[]>([]);
  useEffect(() => {
    const refresh = async () => {
      setOnline(navigator.onLine);
      const { data } = (await createClient()?.auth.getSession()) || {
        data: { session: null },
      };
      const own = (await offline.pending()).filter(
        (m) => m.userId === data.session?.user.id,
      );
      setPending(own.length);
      setChanges(own);
    };
    const reconnect = () => {
      void syncQueue()
        .catch(() => {})
        .finally(refresh);
    };
    const workerMessage = (event: MessageEvent) => {
      if (event.data?.type === "lifeos-sync") reconnect();
    };
    navigator.serviceWorker?.addEventListener("message", workerMessage);
    const fail = (event: Event) =>
      setError((event as CustomEvent<string>).detail);
    const rejected = (event: PromiseRejectionEvent) => {
      setError(event.reason?.message || "The operation failed. Please retry.");
      event.preventDefault();
    };
    window.addEventListener("lifeos-error", fail);
    window.addEventListener("unhandledrejection", rejected);
    window.addEventListener("online", reconnect);
    window.addEventListener("offline", refresh);
    window.addEventListener("lifeos-sync-updated", refresh);
    void refresh();
    void syncQueue().catch(() => {});
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      void navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => setError(err.message));
    const { data: subscription } = createClient()?.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") void offline.clearCache();
      },
    ) || { data: null };
    return () => {
      subscription?.subscription.unsubscribe();
      navigator.serviceWorker?.removeEventListener("message", workerMessage);
      window.removeEventListener("lifeos-error", fail);
      window.removeEventListener("unhandledrejection", rejected);
      window.removeEventListener("online", reconnect);
      window.removeEventListener("offline", refresh);
      window.removeEventListener("lifeos-sync-updated", refresh);
    };
  }, []);
  return (
    <div className="px-6 text-sm" aria-live="polite">
      {!online && <p>Offline — changes remain on this device until synced.</p>}
      {pending > 0 && (
        <details>
          <summary>{pending} pending changes</summary>
          <button onClick={() => void syncQueue().catch(() => {})}>
            Retry sync
          </button>
          {changes.map((change) => (
            <p key={change.key}>
              {change.kind} {change.table}{" "}
              {online && (
                <button
                  onClick={async () => {
                    if (!confirm("Discard this pending change?")) return;
                    const { data } = await createClient()!.auth.getUser();
                    if (data.user?.id !== change.userId) return;
                    await offline.remove(change.key);
                    await offline.clearCache();
                    window.dispatchEvent(
                      new Event(`lifeos-${change.event}-updated`),
                    );
                    window.dispatchEvent(new Event("lifeos-sync-updated"));
                    setError("");
                  }}
                >
                  Discard
                </button>
              )}
            </p>
          ))}
        </details>
      )}
      {error && (
        <p role="alert" className="text-danger">
          {error} <button onClick={() => setError("")}>Dismiss</button>
        </p>
      )}
    </div>
  );
}
