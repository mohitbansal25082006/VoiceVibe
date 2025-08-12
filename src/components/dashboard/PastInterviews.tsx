"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { getInterviews } from "@/lib/actions";
import type { QueryResultRow } from "@vercel/postgres";

type Interview = {
  id: string;
  role: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "Behavioral" | "Technical" | "Case-study";
  createdAt: string;
};

export default function PastInterviews({ userId }: { userId: string }) {
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    getInterviews(userId).then((data: QueryResultRow[]) => {
      // Explicitly cast database rows to Interview[]
      const formatted = data.map((row) => ({
        id: String(row.id),
        role: String(row.role),
        difficulty: row.difficulty as Interview["difficulty"],
        type: row.type as Interview["type"],
        createdAt: String(row.createdAt),
      }));
      setInterviews(formatted);
    });
  }, [userId]);

  if (interviews.length === 0) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {interviews.map((i) => (
        <Card key={i.id} className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="text-lg">{i.role}</CardTitle>
            <div className="flex gap-2">
              <Badge>{i.difficulty}</Badge>
              <Badge variant="outline">{i.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Created{" "}
              {formatDistanceToNow(new Date(i.createdAt), { addSuffix: true })}
            </p>
            <Link href={`/interview/${i.id}`} passHref>
              <Button size="sm" className="w-full">
                Continue
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
