import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { ownerAccess, ownerId } from "@/lib/auth/owner";

function authRedirect(path: string, url: URL) {
  const response = NextResponse.redirect(new URL(path, url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!ownerId()) return authRedirect("/login?error=configuration", url);
  const code = url.searchParams.get("code");
  const client = await serverClient();
  if (!client) return authRedirect("/login?error=configuration", url);
  if (code && client) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data, error: userError } = await client.auth.getUser();
      const access = ownerAccess(userError ? null : data.user);
      if (access !== "allowed") {
        await client.auth.signOut({ scope: "local" });
        return authRedirect(
          `/login?error=${access === "authentication" ? "confirmation" : access}`,
          url,
        );
      }
      return authRedirect(
        url.searchParams.get("next") === "/auth/reset"
          ? "/auth/reset"
          : "/today",
        url,
      );
    }
  }
  return authRedirect("/login?error=confirmation", url);
}
