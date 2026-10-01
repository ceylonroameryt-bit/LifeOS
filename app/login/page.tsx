"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signup, setSignup] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
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
      const result = signup
        ? await client.auth.signUp({
            email,
            password,
            options: {
              data: { name },
              emailRedirectTo: `${location.origin}/auth/callback`,
            },
          })
        : await client.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (!result.data.session) {
        setMessage("Check your email to confirm your account.");
        return;
      }
      const next = new URLSearchParams(location.search).get("next");
      location.assign(
        next && next.startsWith("/") && !next.startsWith("//")
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
        <p>{signup ? "Create your account" : "Sign in to your life system"}</p>
        {signup && (
          <label className="block">
            Name
            <input
              className="block border rounded-xl p-3 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        )}
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
            autoComplete={signup ? "new-password" : "current-password"}
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
          {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
        </button>
        <button type="button" onClick={() => setSignup(!signup)}>
          {signup ? "Already have an account? Sign in" : "Create an account"}
        </button>
        {!signup && (
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
              const { error } = await client.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/callback?next=/auth/reset`,
              });
              setMessage(
                error?.message || "Check your email for a password reset link.",
              );
            }}
          >
            Forgot password?
          </button>
        )}
      </form>
    </main>
  );
}
