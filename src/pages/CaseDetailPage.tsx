import { Link, useParams } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import { renderMarkdown } from "../utils/markdown";
import DifficultyBadge from "../components/DifficultyBadge";
import { useProgressStore } from "../store/useProgressStore";

export default function CaseDetailPage({ data }: { data: ModuleData }) {
  const { slug } = useParams<{ slug: string }>();
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);
  const isFavorite = useProgressStore((s) => s.isFavorite);

  const c = data.cases.find((x) => x.slug === slug);
  if (!c) {
    return (
      <div className="space-y-4">
        <p className="text-white/70">未找到案例：{slug}</p>
        <Link className="btn-ghost" to="/cases">返回案例列表</Link>
      </div>
    );
  }

  const kps = c.knowledgePoints.map((id) => data.knowledgePoints.find((k) => k.id === id)).filter(Boolean);

  return (
    <article className="space-y-8">
      <nav className="text-sm text-white/50">
        <Link to="/" className="hover:text-white">首页</Link>
        <span className="mx-2">/</span>
        <Link to="/cases" className="hover:text-white">案例</Link>
        <span className="mx-2">/</span>
        <span className="text-white/80">{c.title}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={c.difficulty} />
            {c.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => toggleFavorite({ type: "case", id: c.id })}
          >
            {isFavorite("case", c.id) ? "★ 已收藏" : "☆ 收藏"}
          </button>
        </div>
        <h1 className="text-2xl font-bold text-white">{c.title}</h1>
        <p className="text-white/70">{c.summary}</p>
        <p className="text-sm text-white/50">约 {c.estimatedMinutes} 分钟</p>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">案例背景</h2>
        <div className="card p-6">{renderMarkdown(c.backgroundMarkdown)}</div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">训练任务</h2>
        <div className="card p-6">{renderMarkdown(c.tasksMarkdown)}</div>
      </section>

      <details className="card p-4">
        <summary className="cursor-pointer text-sm font-medium text-white">查看参考思路</summary>
        <div className="mt-3">{renderMarkdown(c.referenceMarkdown)}</div>
      </details>

      {kps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">相关知识点</h2>
          <div className="flex flex-wrap gap-2">
            {kps.map((kp) => (
              <Link key={kp!.id} to={`/knowledge/${kp!.slug}`} className="tag hover:bg-brand-500/30 transition">
                {kp!.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
