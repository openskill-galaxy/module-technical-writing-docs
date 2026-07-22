import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import { useProgressStore } from "../store/useProgressStore";
import EmptyState from "../components/EmptyState";
import type { FavoriteRecord } from "../types";

const typeLabel: Record<FavoriteRecord["type"], string> = {
  lesson: "讲义",
  knowledge: "知识点",
  question: "题目",
  case: "案例",
};

export default function FavoritesPage({ data }: { data: ModuleData }) {
  const favorites = useProgressStore((s) => s.favorites);
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const items = useMemo(
    () =>
      favorites
        .map((f) => {
          let title = "";
          let summary = "";
          let url = "";
          if (f.type === "lesson") {
            const l = data.lessons.find((x) => x.id === f.id);
            if (l) { title = l.title; summary = l.summary; url = `/lessons/${l.slug}`; }
          } else if (f.type === "knowledge") {
            const k = data.knowledgePoints.find((x) => x.id === f.id);
            if (k) { title = k.title; summary = k.summary; url = `/knowledge/${k.slug}`; }
          } else if (f.type === "question") {
            const q = data.questions.find((x) => x.id === f.id);
            if (q) { title = q.stem.slice(0, 60); summary = (q.explanation || q.analysis || "").slice(0, 80); url = `/questions/${q.slug}`; }
          } else if (f.type === "case") {
            const c = data.cases.find((x) => x.id === f.id);
            if (c) { title = c.title; summary = c.summary; url = `/cases/${c.slug}`; }
          }
          return { fav: f, title, summary, url };
        })
        .filter((x) => x.title)
        .sort((a, b) => (a.fav.addedAt < b.fav.addedAt ? 1 : -1)),
    [favorites, data]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTab = activeTab === "all" || item.fav.type === activeTab;
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [items, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">收藏夹</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/60">共 {items.length} 条已收藏核心资源</p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索收藏夹标题/摘要..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:border-brand-500"
          />
          <span className="absolute left-2.5 top-2 text-slate-400 dark:text-white/40 text-xs">🔍</span>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: "all", label: `全部 (${items.length})` },
          { id: "lesson", label: `📖 讲义 (${items.filter((i) => i.fav.type === "lesson").length})` },
          { id: "question", label: `❓ 题目 (${items.filter((i) => i.fav.type === "question").length})` },
          { id: "knowledge", label: `💡 知识点 (${items.filter((i) => i.fav.type === "knowledge").length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/30 font-bold"
                : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          emoji="⭐"
          title="暂无匹配收藏"
          hint="在讲义、知识点、题目页面点击 ⭐ 按钮即可一键加入个人收藏库。"
          action={<Link className="btn-primary font-bold" to="/courses">去浏览课程</Link>}
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div key={`${item.fav.type}-${item.fav.id}`} className="card p-4 flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="badge-ghost text-[10px]">{typeLabel[item.fav.type]}</span>
                  <Link to={item.url} className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-300 truncate">
                    {item.title}
                  </Link>
                </div>
                {item.summary && <p className="text-xs text-slate-500 dark:text-white/50 line-clamp-2 leading-relaxed">{item.summary}</p>}
              </div>

              <button
                type="button"
                onClick={() => toggleFavorite({ type: item.fav.type, id: item.fav.id })}
                className="btn-ghost text-xs text-amber-600 dark:text-amber-300 shrink-0 font-medium"
              >
                ★ 取消收藏
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
