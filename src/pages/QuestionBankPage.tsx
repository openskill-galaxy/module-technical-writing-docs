import { useMemo, useState } from "react";
import type { ModuleData } from "../data/loaders";
import QuestionCard from "../components/QuestionCard";
import TagFilter from "../components/TagFilter";
import type { Difficulty } from "../types";

export default function QuestionBankPage({ data }: { data: ModuleData }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [diff, setDiff] = useState<Difficulty | "all">("all");
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return data.questions
      .filter((q) => diff === "all" || q.difficulty === diff)
      .filter((q) => selectedTags.length === 0 || selectedTags.some((t) => q.tags.includes(t)))
      .filter((q) =>
        kw ? `${q.stem} ${q.tags.join(" ")}`.toLowerCase().includes(kw) : true
      );
  }, [data.questions, diff, selectedTags, keyword]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">题库练习</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/60">共 {data.questions.length} 道精选练习题，选择即练</p>
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
        placeholder="在本页快速搜索过滤题目…"
        className="input"
      />

      {filtered.length === 0 ? (
        <p className="text-slate-600 dark:text-white/60">没有匹配的题目。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
