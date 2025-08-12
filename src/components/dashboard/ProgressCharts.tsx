"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getProgress } from "@/lib/actions";

type AnswerRow = {
  question: string;
  score: number;
  created_at: string;
};

type DailyAvg = {
  day: string;
  avg: number;
};

export default function ProgressCharts({ userId }: { userId: string }) {
  const [rows, setRows] = useState<AnswerRow[]>([]);

  useEffect(() => {
    getProgress(userId).then((data) => {
      // Cast to AnswerRow[] so TS knows the shape
      setRows(data as AnswerRow[]);
    });
  }, [userId]);

  /* ---------- average score per day ---------- */
  const daily = rows.reduce<Record<string, { total: number; count: number }>>(
    (acc, cur) => {
      const day = new Date(cur.created_at).toLocaleDateString();
      if (!acc[day]) acc[day] = { total: 0, count: 0 };
      acc[day].total += cur.score;
      acc[day].count += 1;
      return acc;
    },
    {}
  );

  const dailyScores: DailyAvg[] = Object.entries(daily).map(([day, v]) => ({
    day,
    avg: Math.round(v.total / v.count),
  }));

  /* ---------- score distribution data ---------- */
  const barData = rows.map((r) => ({
    question:
      r.question.length > 30
        ? `${r.question.slice(0, 30)}...`
        : r.question,
    score: r.score,
  }));

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Progress Analytics</h1>

      {/* Average score per day */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Average Score per Day</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyScores}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#8b5cf6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Score distribution */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Score Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" hide />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="score" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
