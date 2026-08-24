"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if (
        (e.key === "/" && !isInput) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleClear() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className={`relative flex w-full items-center ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari file atau folder (Tekan '/' atau 'Ctrl+K')"
        className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/80 py-2 pl-10 pr-16 text-sm text-zinc-900 shadow-2xs outline-none transition-all placeholder:text-zinc-400 hover:bg-white focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:bg-zinc-900 dark:focus:border-zinc-600 dark:focus:bg-zinc-900 dark:focus:ring-zinc-800"
      />
      {query ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 rounded-md p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          aria-label="Hapus pencarian"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : (
        <div className="pointer-events-none absolute right-3 hidden items-center gap-0.5 rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 sm:flex">
          <span>⌘/Ctrl</span>
          <span>K</span>
        </div>
      )}
    </form>
  );
}
