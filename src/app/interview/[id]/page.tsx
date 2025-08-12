import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InterviewRoom from "@/components/interview/InterviewRoom";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params; // <-- await here
  return <InterviewRoom interviewId={id} userId={userId} />;
}
