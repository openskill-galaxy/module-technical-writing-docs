import { useMemo } from "react";
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
            if (q) { title = q.stem.slice(0, 60); summary = q.analysis.slice(0, 80); url = `/questions/${q.slug}`; }
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">收藏夹</h1>
        <p className="mt-1 text-sm text-white/60">共 {items.length} 条收藏</p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          emoji="☆"
          title="暂无收藏"
          hint="在讲义、知识点、题目、案例页面点击 ☆ 即可收藏。"
          action={<Link className="btn-primary" to="/courses">去浏览课程</Link>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(({ fav, title, summary, url }) => (
            <div key={`${fav.type}-${fav.id}`} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <Link to={url} className="text-sm font-medium text-white hover:underline">{title}</Link>
                <span className="tag">{typeLabel[fav.type]}</span>
              </div>
              <p className="mt-2 text-xs text-white/60 line-clamp-2">{summary}</p>
              <div className="mt-3 flex items-center justify-between">
                <Link to={url} className="text-xs text-brand-300 hover:underline">查看 →</Link>
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => toggleFavorite({ type: fav.type, id: fav.id })}
                >
                  取消收藏
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
