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
        <h1 className="text-2xl font-bold text-white">FAQ · 常见问题</h1>
        <p className="mt-1 text-sm text-white/60">共 {data.faqs.length} 个问题</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              category === c ? "bg-brand-600 text-white" : "border border-white/10 text-white/70 hover:bg-white/5"
            }`}
          >
            {c === "all" ? "全部" : c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((f) => (
          <details key={f.id} id={f.id} className="card p-4">
            <summary className="cursor-pointer text-sm font-medium text-white">
              {f.question}
              <span className="ml-2 text-xs text-white/40">[{f.category}]</span>
            </summary>
            <div className="mt-3">{renderMarkdown(f.answer)}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
