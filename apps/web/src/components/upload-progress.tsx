"use client";

import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

export interface UploadTask {
  id: number;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
}

export function UploadProgress({ tasks }: { tasks: UploadTask[] }) {
  if (tasks.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 md:bottom-4">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-2">
          {task.status === "uploading" && (
            <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-zinc-400" />
          )}
          {task.status === "done" && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />}
          {task.status === "error" && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs">{task.name}</p>
            {task.status === "uploading" && (
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-zinc-900 transition-all dark:bg-zinc-100"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            )}
          </div>
          {task.status === "uploading" && (
            <span className="shrink-0 text-xs text-zinc-500">{task.progress}%</span>
          )}
        </div>
      ))}
    </div>
  );
}
