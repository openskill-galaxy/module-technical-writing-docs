import { useMemo, useState } from "react";
import type { ModuleData } from "../data/loaders";
import KnowledgePointCard from "../components/KnowledgePointCard";
import TagFilter from "../components/TagFilter";
import type { Difficulty } from "../types";

export default function KnowledgePointsPage({ data }: { data: ModuleData }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [diff, setDiff] = useState<Difficulty | "all">("all");
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return data.knowledgePoints
      .filter((k) => diff === "all" || k.difficulty === diff)
      .filter((k) => selectedTags.length === 0 || selectedTags.some((t) => k.tags.includes(t)))
      .filter((k) =>
        kw ? `${k.title} ${k.summary} ${k.tags.join(" ")}`.toLowerCase().includes(kw) : true
      );
  }, [data.knowledgePoints, diff, selectedTags, keyword]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">知识点库</h1>
        <p className="mt-1 text-sm text-white/60">共 {data.knowledgePoints.length} 个知识点</p>
      </header>

      <TagFilter tags={data.tags} selected={selectedTags} onChange={setSelectedTags} />

      <div className="flex flex-wrap gap-2">
        {(["all", "easy", "medium", "hard"] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDiff(d)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              diff === d ? "bg-brand-600 text-white" : "border border-white/10 text-white/70 hover:bg-white/5"
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
        placeholder="过滤知识点…"
        className="input"
      />

      {filtered.length === 0 ? (
        <p className="text-white/60">没有匹配的知识点。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((k) => (
            <KnowledgePointCard key={k.id} kp={k} />
          ))}
        </div>
      )}

      {data.glossary.length > 0 && (
        <section id="glossary">
          <h2 className="text-lg font-semibold text-white mb-3">术语表</h2>
          <div className="card divide-y divide-white/10">
            {data.glossary.map((g) => (
              <div key={g.id} id={`glossary-${g.id}`} className="px-4 py-3">
                <p className="text-sm font-medium text-white">{g.term}</p>
                {g.aliases && g.aliases.length > 0 && (
                  <p className="text-xs text-white/40">别名：{g.aliases.join("、")}</p>
                )}
                <p className="mt-1 text-sm text-white/70">{g.definition}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
