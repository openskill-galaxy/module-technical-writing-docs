import { useState } from "react";
import type { Tag } from "../types";

interface Props {
  tags: Tag[];
  selected: string[]; // tag ids
  onChange: (next: string[]) => void;
}

export default function TagFilter({ tags, selected, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((t) => t !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  const filteredTags = tags.filter((t) =>
    tagSearch.trim() ? t.name.toLowerCase().includes(tagSearch.trim().toLowerCase()) : true
  );

  const displayTags = expanded || tagSearch.trim() ? filteredTags : filteredTags.slice(0, 12);

  return (
    <div className="space-y-2.5 card p-4 border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-950/40">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700 dark:text-white/80 flex items-center gap-1.5">
          <span>🏷️</span> 标签筛选 ({tags.length})
        </span>
        {tags.length > 12 && (
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="快速搜索标签…"
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 w-32 sm:w-44"
            />
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-brand-600 dark:text-brand-300 hover:underline font-semibold"
            >
              {expanded ? "收起" : `展开全部 (${tags.length})`}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => onChange([])}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            selected.length === 0
              ? "bg-brand-600 text-white shadow-sm"
              : "border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          全部标签
        </button>
        {displayTags.map((t) => {
          const active = selected.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
              title={t.description}
            >
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
