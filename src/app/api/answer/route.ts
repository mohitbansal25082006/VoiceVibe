import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interviewId, userId, question, answer, score, feedback } = body;

    await sql`
      INSERT INTO answers (id, interview_id, user_id, question, answer, score, feedback)
      VALUES (${randomUUID()}, ${interviewId}, ${userId}, ${question}, ${answer}, ${score}, ${feedback})
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}