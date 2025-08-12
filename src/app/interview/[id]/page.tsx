import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import VoiceRoom from "@/components/interview/VoiceRoom";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params; // still await per Next's requirement
  return <VoiceRoom userId={userId} />;
}
