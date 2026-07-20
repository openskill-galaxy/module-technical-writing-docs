import { useState } from "react";
import type { Lesson } from "../types";

interface Props {
  lessons: Lesson[];
  onFilter: (filtered: Lesson[]) => void;
}

export default function LessonContentSearch({ lessons, onFilter }: Props) {
  const [query, setQuery] = useState("");

  function handleSearch(q: string) {
    setQuery(q);
    if (!q.trim()) {
      onFilter(lessons);
      return;
    }

    const term = q.toLowerCase();
    const filtered = lessons.filter(
      (l) =>
        l.title.toLowerCase().includes(term) ||
        l.summary.toLowerCase().includes(term) ||
        (l.contentMarkdown && l.contentMarkdown.toLowerCase().includes(term))
    );
    onFilter(filtered);
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-white/40 text-xs">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="即时检索本模块讲义标题、导言或正文关键字..."
          className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500/50 transition"
        />
        {query && (
          <button
            onClick={() => handleSearch("")}
            type="button"
            className="absolute right-3 text-xs text-white/40 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
