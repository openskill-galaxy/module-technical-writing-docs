import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import { ensureIndex } from "../components/SearchBox";
import { runSearch, typeLabel } from "../search/search";
import EmptyState from "../components/EmptyState";

export default function SearchPage({ data }: { data: ModuleData }) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const results = useMemo(() => {
    if (!submitted.trim()) return [];
    const fuse = ensureIndex(data);
    return runSearch(fuse, submitted, 50);
  }, [submitted, data]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(query);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">搜索</h1>
        <p className="mt-1 text-sm text-white/60">跨课程、讲义、知识点、题目、案例、路线、FAQ、术语全文检索</p>
      </header>

      <form onSubmit={submit} className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入关键词…"
          className="input"
          autoFocus
        />
        <button type="submit" className="btn-primary">搜索</button>
      </form>

      {submitted && results.length === 0 ? (
        <EmptyState emoji="🔍" title={`未找到与「${submitted}」相关的内容`} hint="尝试更换关键词或减少筛选条件。" />
      ) : (
        <div className="space-y-2">
          {submitted && (
            <p className="text-xs text-white/50">共 {results.length} 条结果</p>
          )}
          {results.map((r) => (
            <Link key={`${r.type}-${r.id}`} to={r.url} className="card-hover block p-4">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 rounded bg-brand-500/20 px-1.5 py-0.5 text-xs text-brand-100">
                  {typeLabel[r.type]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.title}</p>
                  <p className="text-xs text-white/60 line-clamp-2">{r.summary}</p>
                  {r.tags && r.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.tags.slice(0, 3).map((t: string) => <span key={t} className="tag">{t}</span>)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
