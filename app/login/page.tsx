"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const error = new URLSearchParams(location.search).get("error");
    if (error === "configuration")
      setMessage("Private account access has not been configured yet.");
    if (error === "access")
      setMessage("This private LifeOS is available only to its owner.");
    if (error === "confirmation")
      setMessage(
        "That account link is invalid or expired. Request a new password reset link.",
      );
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const client = createClient();
      if (!client)
        throw new Error(
          "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to sign in.",
        );
      const result = await client.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (!result.data.session) {
        setMessage("No sign-in session was created. Please try again.");
        return;
      }
      const next = new URLSearchParams(location.search).get("next");
      // Restrict post-login navigation to recognized LifeOS modules.
      const modules = [
        "today",
        "tasks",
        "money",
        "habits",
        "career",
        "ideas",
        "goals",
        "wishlist",
        "admin",
        "calendar",
        "inbox",
        "focus",
        "insights",
        "weekly-review",
        "me",
        "settings",
      ];
      location.assign(
        next && modules.some((module) => next === `/${module}`)
          ? next
          : "/today",
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen grid place-items-center bg-[#F6F8FC] p-6">
      <form
        onSubmit={submit}
        className="bg-white rounded-3xl border p-8 space-y-4 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold">LifeOS</h1>
        <p>Sign in to your private life system</p>
        <label className="block">
          Email
          <input
            className="block border rounded-xl p-3 w-full"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block">
          Password
          <input
            className="block border rounded-xl p-3 w-full"
            type="password"
            autoComplete="current-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {message && <p role="alert">{message}</p>}
        <button
          disabled={busy}
          className="bg-primary text-white rounded-xl p-3 w-full"
        >
          {busy ? "Please wait..." : "Sign in"}
        </button>
        <button
          type="button"
          className="block text-sm text-primary"
          onClick={async () => {
            const client = createClient();
            if (!client) {
              setMessage("Supabase is not configured.");
              return;
            }
            if (!email.trim()) {
              setMessage("Enter your email first.");
              return;
            }
            setBusy(true);
            try {
              const { error } = await client.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/callback?next=/auth/reset`,
              });
              setMessage(
                error?.message || "Check your email for a password reset link.",
              );
            } catch {
              setMessage(
                "Could not request a password reset. Please try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          Forgot password?
        </button>
        <p className="text-sm text-muted-foreground">
          Personal access only. Registration is closed.
        </p>
      </form>
    </main>
  );
}
