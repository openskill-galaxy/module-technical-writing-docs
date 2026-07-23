import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import DifficultyBadge from "../components/DifficultyBadge";
import TagFilter from "../components/TagFilter";
import type { Difficulty } from "../types";

export default function CasesPage({ data }: { data: ModuleData }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [diff, setDiff] = useState<Difficulty | "all">("all");
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return data.cases
      .filter((c) => diff === "all" || c.difficulty === diff)
      .filter((c) => selectedTags.length === 0 || selectedTags.some((t) => c.tags.includes(t)))
      .filter((c) =>
        kw ? `${c.title} ${c.summary} ${c.tags.join(" ")}`.toLowerCase().includes(kw) : true
      );
  }, [data.cases, diff, selectedTags, keyword]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">案例训练</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/60">共 {data.cases.length} 个实战综合案例</p>
      </header>

      <TagFilter tags={data.tags} selected={selectedTags} onChange={setSelectedTags} />

      <div className="flex flex-wrap gap-2">
        {(["all", "easy", "medium", "hard"] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDiff(d)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              diff === d
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            {d === "all" ? "全部难度" : d === "easy" ? "简单" : d === "medium" ? "中等" : "困难"}
          </button>
        ))}
      </div>

      <input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="在本页快速搜索过滤案例…"
        className="input"
      />

      {filtered.length === 0 ? (
        <p className="text-slate-600 dark:text-white/60">没有匹配的案例。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link key={c.id} to={`/cases/${c.slug}`} className="card-hover block p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{c.title}</h3>
                <DifficultyBadge difficulty={c.difficulty} />
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-white/70 line-clamp-3 leading-relaxed">{c.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.tags.slice(0, 3).map((t) => <span key={t} className="tag text-[10px]">{t}</span>)}
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500 dark:text-white/50">⏱️ 约 {c.estimatedMinutes} 分钟</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
