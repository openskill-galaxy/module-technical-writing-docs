import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import { useProgressStore } from "../store/useProgressStore";
import EmptyState from "../components/EmptyState";
import DifficultyBadge from "../components/DifficultyBadge";
import { typeLabel } from "../utils/scoring";

export default function WrongQuestionsPage({ data }: { data: ModuleData }) {
  const wrongs = useProgressStore((s) => s.wrongs);
  const clearWrong = useProgressStore((s) => s.clearWrong);
  const clearAllWrongs = useProgressStore((s) => s.clearAllWrongs);

  const list = useMemo(
    () =>
      Object.values(wrongs)
        .map((w) => ({ wrong: w, question: data.questions.find((q) => q.id === w.questionId) }))
        .filter((x) => x.question)
        .sort((a, b) => (a.wrong.lastAt < b.wrong.lastAt ? 1 : -1)),
    [wrongs, data.questions]
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">错题本</h1>
          <p className="mt-1 text-sm text-white/60">共 {list.length} 道错题</p>
        </div>
        {list.length > 0 && (
          <button type="button" className="btn-danger text-xs" onClick={clearAllWrongs}>
            清空全部
          </button>
        )}
      </header>

      {list.length === 0 ? (
        <EmptyState
          emoji="🎉"
          title="暂无错题"
          hint="去做题练习吧，答错的题会自动收集到这里。"
          action={<Link className="btn-primary" to="/questions">去题库练习</Link>}
        />
      ) : (
        <div className="space-y-3">
          {list.map(({ wrong, question }) => (
            <div key={wrong.questionId} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-xs text-brand-100">
                    {typeLabel(question!.type)}
                  </span>
                  <DifficultyBadge difficulty={question!.difficulty} />
                  <span className="text-xs text-rose-300">错 {wrong.wrongCount} 次</span>
                </div>
                <span className="text-xs text-white/40">{wrong.lastAt.slice(0, 10)}</span>
              </div>
              <p className="mt-2 text-sm text-white line-clamp-3">{question!.stem}</p>
              <div className="mt-3 flex items-center justify-between">
                <Link className="btn-primary text-xs" to={`/practice/${question!.slug}`}>重做</Link>
                <button type="button" className="btn-ghost text-xs" onClick={() => clearWrong(wrong.questionId)}>
                  移除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
