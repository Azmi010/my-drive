import { Trash2 } from "lucide-react";

export default function TrashPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <Trash2 className="h-5 w-5 text-zinc-400" />
          Sampah
        </h1>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
        <Trash2 className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
        <p className="text-sm text-zinc-500">
          Halaman sampah belum tersedia. Endpoint trash backend dikerjakan di fase berikutnya.
        </p>
      </div>
    </div>
  );
}
