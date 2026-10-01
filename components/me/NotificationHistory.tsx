"use client";
import { useData } from "@/lib/useData";
import { list, insert, update } from "@/lib/services/store";
import { useState } from "react";
type Notice = {
  id: string;
  title: string;
  read_at: string | null;
  created_at: string;
};
const load = () => list<Notice>("notifications");
export function NotificationHistory() {
  const notices = useData(load, [], "lifeos-notifications-updated");
  const [title, setTitle] = useState("");
  return (
    <section className="bg-surface border border-border rounded-3xl p-5 space-y-3">
      <h2 className="font-bold">Notifications</h2>
      {!notices.length && (
        <p className="text-xs text-slate-500">No saved notifications</p>
      )}
      {notices.map((n) => (
        <div className="flex justify-between text-sm" key={n.id}>
          <span>{n.title}</span>
          {!n.read_at && (
            <button
              className="text-primary text-xs"
              onClick={() =>
                void update(
                  "notifications",
                  n.id,
                  { read_at: new Date().toISOString() },
                  "notifications",
                )
              }
            >
              Mark read
            </button>
          )}
        </div>
      ))}
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await insert(
            "notifications",
            { title: title.trim(), dedupe_key: crypto.randomUUID() },
            "notifications",
          );
          setTitle("");
        }}
      >
        <input
          aria-label="Notification note"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border border-border rounded-xl p-2 text-sm bg-surface flex-1"
          placeholder="Save a reminder note"
        />
        <button className="text-primary text-sm">Save</button>
      </form>
      <p className="text-xs text-slate-500">
        Saved notices and reminder preferences sync to your account. Scheduled
        push delivery requires a server notification worker.
      </p>
    </section>
  );
}
