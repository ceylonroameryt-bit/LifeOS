"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="min-h-screen grid place-items-center bg-background p-6">
      <form
        className="bg-surface p-8 rounded-3xl border space-y-4 max-w-md w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const client = createClient();
            if (!client) throw new Error("Supabase is not configured.");
            const { error } = await client.auth.updateUser({ password });
            if (error) throw error;
            location.assign("/today");
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Password reset failed.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1 className="text-xl font-bold">Set a new password</h1>
        <label>
          New password
          <input
            className="block w-full border rounded-xl p-3"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button
          disabled={busy}
          className="bg-primary text-white rounded-xl p-3"
        >
          Save password
        </button>
      </form>
    </main>
  );
}
