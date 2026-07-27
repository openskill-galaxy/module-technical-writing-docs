import { useState } from "react";
import type { Lesson } from "../types";
import { IconSearch } from "./icons";

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
        <span className="absolute left-3 text-subtle pointer-events-none"><IconSearch size={14} /></span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="即时检索本模块讲义标题、导言或正文关键字..."
          className="input pl-8 pr-8 !py-2 text-xs"
        />
        {query && (
          <button
            onClick={() => handleSearch("")}
            type="button"
            aria-label="清空检索关键字"
            className="absolute right-3 text-xs text-subtle hover:text-body transition"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
