import LifeOSApp from "@/components/LifeOSApp";
import { notFound, redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
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
  const client = await serverClient();
  if (!client) redirect("/login");
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  return <LifeOSApp />;
}
