import LifeOSApp from "@/components/LifeOSApp";
import { notFound, redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { ownerAccess, ownerId } from "@/lib/auth/owner";
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
export default async function Page({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!modules.includes(module)) notFound();
  if (!ownerId()) redirect("/login?error=configuration");
  const client = await serverClient();
  if (!client) redirect("/login?error=configuration");
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  const access = ownerAccess(error ? null : user);
  if (access === "authentication") redirect("/login");
  if (access !== "allowed") redirect(`/login?error=${access}`);
  return <LifeOSApp />;
}
