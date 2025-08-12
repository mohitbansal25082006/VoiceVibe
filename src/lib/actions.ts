"use server";

import { sql } from "@vercel/postgres";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// ---------- Get Progress ----------
export async function getProgress(userId: string) {
  const { rows } =
    await sql`SELECT question, score, created_at FROM answers WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return rows;
}

// ---------- Create Interview ----------
export async function createInterview(
  userId: string,
  form: FormData
): Promise<string | null> {
  try {
    const role = form.get("role") as string;
    const difficulty = form.get("difficulty") as string;
    const type = form.get("type") as string;
    const file = form.get("resume") as File | null;

    let resumeUrl: string | null = null;

    if (file && file.size > 0) {
      const { url } = await put(`resumes/${userId}/${file.name}`, file, {
        access: "public",
      });
      resumeUrl = url;
    }

    const id = randomUUID();
    await sql`
      INSERT INTO interviews (id, user_id, role, difficulty, type, resume_url)
      VALUES (${id}, ${userId}, ${role}, ${difficulty}, ${type}, ${resumeUrl})
    `;

    revalidatePath("/dashboard");
    return id;
  } catch (err) {
    console.error("createInterview error:", err);
    return null;
  }
}

// ---------- Get Interviews ----------
export async function getInterviews(userId: string) {
  const { rows } =
    await sql`SELECT * FROM interviews WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return rows;
}

// ---------- Delete Interview ----------
export async function deleteInterview(id: string) {
  try {
    await sql`DELETE FROM interviews WHERE id = ${id}`;
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("deleteInterview error:", err);
  }
}
