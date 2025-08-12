import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardPage() {
  const { userId } = await auth();          // <- await here
  if (!userId) redirect("/sign-in");

  return <DashboardShell userId={userId} />;
}