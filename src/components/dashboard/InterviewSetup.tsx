"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createInterview } from "@/lib/actions";

const schema = z.object({
  role: z.string().min(1, "Role is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  type: z.enum(["Behavioral", "Technical", "Case-study"]),
  resume: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof schema>;

export default function InterviewSetup({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("role", data.role);
    formData.append("difficulty", data.difficulty);
    formData.append("type", data.type);
    if (file) formData.append("resume", file);

    const interviewId = await createInterview(userId, formData);
    if (interviewId) {
      toast.success("Interview created!");
      router.push(`/interview/${interviewId}`);
    } else {
      toast.error("Something went wrong.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border rounded-xl p-8 mb-10 space-y-6"
    >
      <h2 className="text-2xl font-semibold">Create a Mock Interview</h2>

      <div>
        <Label>Job Role</Label>
        <Input {...register("role")} placeholder="e.g. Frontend Developer" />
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label>Difficulty</Label>
          <Select
            onValueChange={(v) =>
              setValue("difficulty", v as FormData["difficulty"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Type</Label>
          <Select
            onValueChange={(v) => setValue("type", v as FormData["type"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Behavioral">Behavioral</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Case-study">Case-study</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Resume (optional)</Label>
        <label
          htmlFor="resume"
          className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-muted"
        >
          <UploadCloud size={20} />
          <span>{file ? file.name : "Upload PDF or DOCX"}</span>
        </label>
        <input
          id="resume"
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Start Interview"
          )}
        </Button>
      </div>
    </form>
  );
}
