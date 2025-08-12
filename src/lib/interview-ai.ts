"use server";

import OpenAI from "openai";
import { sql } from "@vercel/postgres";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type Feedback = {
  score: number;
  strengths: string;
  improvements: string;
};

/* Fetch next question */
export async function fetchQuestion(interviewId: string, userId: string) {
  const { rows } =
    await sql`SELECT role, difficulty, type FROM interviews WHERE id = ${interviewId} AND user_id = ${userId}`;
  if (rows.length === 0) throw new Error("Interview not found");

  const { role, difficulty, type } = rows[0];

  const prompt = `Act as an interviewer.  
Role: ${role}  
Difficulty: ${difficulty}  
Type: ${type}  
Ask one concise, relevant interview question.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 120,
  });

  return res.choices[0]?.message?.content?.trim() || "Tell me about yourself.";
}

/* Evaluate answer */
export async function evaluateAnswer(question: string, answer: string): Promise<Feedback> {
  const prompt = `Question: ${question}\nAnswer: ${answer}\n
Provide a JSON object with:
- score (0-10)
- strengths (short)
- improvements (short)
Example: {"score":8,"strengths":"Clear & concise","improvements":"Add more examples"}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
  });

  const raw = res.choices[0]?.message?.content?.trim() || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return {
      score: 5,
      strengths: "Good effort",
      improvements: "Keep practicing",
    };
  }
}