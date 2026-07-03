import { Link, useParams } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import { renderMarkdown } from "../utils/markdown";
import DifficultyBadge from "../components/DifficultyBadge";
import { useProgressStore } from "../store/useProgressStore";

export default function KnowledgePointDetailPage({ data }: { data: ModuleData }) {
  const { slug } = useParams<{ slug: string }>();
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);
  const isFavorite = useProgressStore((s) => s.isFavorite);

  const kp = data.knowledgePoints.find((k) => k.slug === slug);
  if (!kp) {
    return (
      <div className="space-y-4">
        <p className="text-white/70">未找到知识点：{slug}</p>
        <Link className="btn-ghost" to="/knowledge">返回知识点库</Link>
      </div>
    );
  }

  const relatedQs = kp.relatedQuestions.map((id) => data.questions.find((q) => q.id === id)).filter(Boolean);
  const relatedCases = kp.relatedCases.map((id) => data.cases.find((c) => c.id === id)).filter(Boolean);
  const glossaryTerms = kp.glossary.map((id) => data.glossary.find((g) => g.id === id)).filter(Boolean);

  return (
    <article className="space-y-8">
      <nav className="text-sm text-white/50">
        <Link to="/" className="hover:text-white">首页</Link>
        <span className="mx-2">/</span>
        <Link to="/knowledge" className="hover:text-white">知识点</Link>
        <span className="mx-2">/</span>
        <span className="text-white/80">{kp.title}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={kp.difficulty} />
            {kp.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => toggleFavorite({ type: "knowledge", id: kp.id })}
          >
            {isFavorite("knowledge", kp.id) ? "★ 已收藏" : "☆ 收藏"}
          </button>
        </div>
        <h1 className="text-2xl font-bold text-white">{kp.title}</h1>
        <p className="text-white/70">{kp.summary}</p>
      </header>

      <section className="card p-6">
        {renderMarkdown(kp.contentMarkdown)}
      </section>

      {glossaryTerms.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">相关术语</h2>
          <div className="card divide-y divide-white/10">
            {glossaryTerms.map((g) => (
              <div key={g!.id} className="px-4 py-3">
                <p className="text-sm font-medium text-white">{g!.term}</p>
                <p className="mt-1 text-sm text-white/70">{g!.definition}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {relatedQs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">相关题目</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedQs.map((q) => (
              <Link key={q!.id} to={`/questions/${q!.slug}`} className="card-hover p-4">
                <p className="text-sm text-white line-clamp-2">{q!.stem}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedCases.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">相关案例</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedCases.map((c) => (
              <Link key={c!.id} to={`/cases/${c!.slug}`} className="card-hover p-4">
                <p className="text-sm font-medium text-white">{c!.title}</p>
                <p className="mt-1 text-xs text-white/60 line-clamp-2">{c!.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
