import { useMemo, useState } from "react";
import type { ModuleData } from "../data/loaders";
import { renderMarkdown } from "../utils/markdown";

export default function FaqPage({ data }: { data: ModuleData }) {
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    data.faqs.forEach((f) => set.add(f.category));
    return ["all", ...Array.from(set)];
  }, [data.faqs]);

  const filtered = useMemo(
    () => data.faqs.filter((f) => category === "all" || f.category === category),
    [data.faqs, category]
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">FAQ · 常见问题解答</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/60">共 {data.faqs.length} 个疑难解答</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              category === c ? "bg-brand-600 text-white shadow-sm" : "border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            {c === "all" ? "全部问题" : c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((f) => (
          <details key={f.id} id={f.id} className="card p-4 group">
            <summary className="cursor-pointer text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{f.question}</span>
              <span className="text-xs font-mono text-brand-600 dark:text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                {f.category}
              </span>
            </summary>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 leading-relaxed text-sm">
              {renderMarkdown(f.answer)}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
