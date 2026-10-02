import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ownerAccess, ownerId } from "@/lib/auth/owner";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const publicPath =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/auth/callback";
  if (!url || !key || !ownerId()) {
    if (publicPath) return response;
    const redirect = NextResponse.redirect(
      new URL("/login?error=configuration", request.url),
    );
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }
  const client = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(
        values: { name: string; value: string; options: CookieOptions }[],
      ) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        const previousCookies = response.cookies.getAll();
        response = NextResponse.next({ request });
        previousCookies.forEach((cookie) => response.cookies.set(cookie));
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  const access = ownerAccess(error ? null : user);
  if (access === "access") {
    // Clear this browser's session without signing out the owner's other devices.
    await client.auth.signOut({ scope: "local" });
  }
  if (access === "access" || (!publicPath && access !== "allowed")) {
    const target = new URL("/login", request.url);
    if (access === "authentication")
      target.searchParams.set("next", request.nextUrl.pathname);
    else target.searchParams.set("error", access);
    const redirect = NextResponse.redirect(target);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }
  if (!publicPath) response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|offline.html).*)",
  ],
};
