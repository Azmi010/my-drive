"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setQuery("");
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari file atau folder"
        className="w-full rounded-full border border-zinc-200 bg-zinc-100 py-2 pl-9 pr-4 text-sm outline-none focus:border-zinc-300 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-950"
      />
    </form>
  );
}
