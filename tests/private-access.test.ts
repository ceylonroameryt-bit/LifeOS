// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const owner = "11111111-1111-4111-8111-111111111111";
const stranger = "22222222-2222-4222-8222-222222222222";
const mock = vi.hoisted(() => ({
  user: null as { id: string } | null,
  userError: null as { message: string } | null,
  exchangeError: null as { message: string } | null,
  clientConfigured: true,
  refreshMultipleCookies: false,
  getUser: vi.fn(),
  exchange: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          cookies: {
            name: string;
            value: string;
            options?: { maxAge?: number };
          }[],
        ) => void;
      };
    },
  ) => ({
    auth: {
      getUser: async () => {
        mock.getUser();
        options.cookies.setAll([{ name: "session", value: "refreshed" }]);
        if (mock.refreshMultipleCookies)
          options.cookies.setAll([{ name: "session-part", value: "chunk" }]);
        return { data: { user: mock.user }, error: mock.userError };
      },
      signOut: async (value: unknown) => {
        mock.signOut(value);
        options.cookies.setAll([
          { name: "session", value: "", options: { maxAge: 0 } },
        ]);
        return { error: null };
      },
    },
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  serverClient: async () =>
    mock.clientConfigured
      ? {
          auth: {
            exchangeCodeForSession: async (code: string) => {
              mock.exchange(code);
              return { error: mock.exchangeError };
            },
            getUser: async () => {
              mock.getUser();
              return { data: { user: mock.user }, error: mock.userError };
            },
            signOut: async (value: unknown) => {
              mock.signOut(value);
              return { error: null };
            },
          },
        }
      : null,
}));
vi.mock("@/components/LifeOSApp", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
  notFound: () => {
    throw new Error("not-found");
  },
}));

import { ownerAccess, ownerId } from "@/lib/auth/owner";
import { middleware } from "@/middleware";
import { GET } from "@/app/auth/callback/route";
import ModulePage from "@/app/[module]/page";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("LIFEOS_OWNER_ID", owner);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-public-key");
  mock.user = null;
  mock.userError = null;
  mock.exchangeError = null;
  mock.clientConfigured = true;
  mock.refreshMultipleCookies = false;
});

describe("private owner configuration", () => {
  it.each(["", "not-a-uuid", "user-a"])(
    "fails closed when server owner configuration is %j",
    async (value) => {
      vi.stubEnv("LIFEOS_OWNER_ID", value);
      vi.stubEnv("NEXT_PUBLIC_LIFEOS_OWNER_ID", owner);
      mock.user = { id: owner };
      expect(ownerId()).toBeNull();
      expect(ownerAccess(mock.user)).toBe("configuration");
      const response = await middleware(
        new NextRequest("https://lifeos.test/today"),
      );
      expect(response.headers.get("location")).toBe(
        "https://lifeos.test/login?error=configuration",
      );
      expect(mock.getUser).not.toHaveBeenCalled();
    },
  );
  it("compares the verified UUID and accepts canonical case differences", () => {
    vi.stubEnv("LIFEOS_OWNER_ID", "  ABCDEF12-3456-4789-ABCD-123456789ABC  ");
    expect(ownerAccess({ id: "abcdef12-3456-4789-abcd-123456789abc" })).toBe(
      "allowed",
    );
    expect(ownerAccess({ id: stranger })).toBe("access");
    expect(ownerAccess(null)).toBe("authentication");
  });
});

describe("owner middleware", () => {
  it("allows the owner and keeps refreshed cookies and private caching", async () => {
    mock.user = { id: owner };
    mock.refreshMultipleCookies = true;
    const response = await middleware(
      new NextRequest("https://lifeos.test/tasks"),
    );
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.cookies.get("session")?.value).toBe("refreshed");
    expect(response.cookies.get("session-part")?.value).toBe("chunk");
    expect(mock.getUser).toHaveBeenCalledOnce();
    expect(mock.signOut).not.toHaveBeenCalled();
  });
  it("redirects an anonymous user with their requested module and cookies", async () => {
    const response = await middleware(
      new NextRequest("https://lifeos.test/money"),
    );
    expect(response.headers.get("location")).toBe(
      "https://lifeos.test/login?next=%2Fmoney",
    );
    expect(response.cookies.get("session")?.value).toBe("refreshed");
  });
  it("revokes a different account's browser session and forwards cookie removal", async () => {
    mock.user = { id: stranger };
    const response = await middleware(
      new NextRequest("https://lifeos.test/today"),
    );
    expect(response.headers.get("location")).toBe(
      "https://lifeos.test/login?error=access",
    );
    expect(mock.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(response.cookies.get("session")).toMatchObject({
      value: "",
      maxAge: 0,
    });
  });
  it("rejects a user when server authentication verification fails", async () => {
    mock.user = { id: owner };
    mock.userError = { message: "Invalid token" };
    const response = await middleware(
      new NextRequest("https://lifeos.test/today"),
    );
    expect(response.headers.get("location")).toContain("/login?next=");
  });
  it("protects recovery while leaving the callback available for code exchange", async () => {
    const recovery = await middleware(
      new NextRequest("https://lifeos.test/auth/reset"),
    );
    expect(recovery.headers.get("location")).toContain("/login?next=");
    const callback = await middleware(
      new NextRequest("https://lifeos.test/auth/callback?code=recovery"),
    );
    expect(callback.headers.get("location")).toBeNull();
  });
  it("shows a configuration failure for missing Supabase credentials", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const response = await middleware(
      new NextRequest("https://lifeos.test/today"),
    );
    expect(response.headers.get("location")).toContain("error=configuration");
  });
});

describe("private auth callback", () => {
  it("does not exchange codes before owner configuration exists", async () => {
    vi.stubEnv("LIFEOS_OWNER_ID", "");
    const response = await GET(
      new Request("https://lifeos.test/auth/callback?code=code"),
    );
    expect(response.headers.get("location")).toContain("error=configuration");
    expect(mock.exchange).not.toHaveBeenCalled();
  });
  it("verifies the owner after exchange and allows password recovery", async () => {
    mock.user = { id: owner };
    const response = await GET(
      new Request(
        "https://lifeos.test/auth/callback?code=code&next=/auth/reset",
      ),
    );
    expect(mock.exchange).toHaveBeenCalledWith("code");
    expect(mock.getUser).toHaveBeenCalledOnce();
    expect(response.headers.get("location")).toBe(
      "https://lifeos.test/auth/reset",
    );
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });
  it("ignores an arbitrary redirect destination", async () => {
    mock.user = { id: owner };
    const response = await GET(
      new Request(
        "https://lifeos.test/auth/callback?code=code&next=https://other.test",
      ),
    );
    expect(response.headers.get("location")).toBe("https://lifeos.test/today");
  });
  it("revokes the session when a different account confirms its email", async () => {
    mock.user = { id: stranger };
    const response = await GET(
      new Request("https://lifeos.test/auth/callback?code=code"),
    );
    expect(response.headers.get("location")).toContain("error=access");
    expect(mock.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("revokes an exchanged session if the server cannot verify its user", async () => {
    mock.user = { id: owner };
    mock.userError = { message: "Invalid token" };
    const response = await GET(
      new Request("https://lifeos.test/auth/callback?code=code"),
    );
    expect(response.headers.get("location")).toContain("error=confirmation");
    expect(mock.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("keeps exchange failures on the confirmation error page", async () => {
    mock.exchangeError = { message: "Expired code" };
    const response = await GET(
      new Request("https://lifeos.test/auth/callback?code=expired"),
    );
    expect(response.headers.get("location")).toContain("error=confirmation");
    expect(mock.getUser).not.toHaveBeenCalled();
  });
});

describe("module server guard", () => {
  it("denies unconfigured deployments independently of middleware", async () => {
    vi.stubEnv("LIFEOS_OWNER_ID", "");
    await expect(
      ModulePage({ params: Promise.resolve({ module: "today" }) }),
    ).rejects.toThrow("redirect:/login?error=configuration");
  });
  it("denies another authenticated account independently of middleware", async () => {
    mock.user = { id: stranger };
    await expect(
      ModulePage({ params: Promise.resolve({ module: "today" }) }),
    ).rejects.toThrow("redirect:/login?error=access");
  });
  it("renders a recognized module for the verified owner", async () => {
    mock.user = { id: owner };
    await expect(
      ModulePage({ params: Promise.resolve({ module: "today" }) }),
    ).resolves.toBeTruthy();
  });
});
