import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProgressCharts from "@/components/dashboard/ProgressCharts";

export default async function ProgressPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <ProgressCharts userId={userId} />;
}