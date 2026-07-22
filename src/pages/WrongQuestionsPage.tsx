import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import { useProgressStore } from "../store/useProgressStore";
import EmptyState from "../components/EmptyState";
import DifficultyBadge from "../components/DifficultyBadge";
import { typeLabel } from "../utils/scoring";
import { isItemDueForReview } from "../utils/srs";

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

  const dueCount = useMemo(() => {
    return list.filter((item) => isItemDueForReview((item.wrong as any).nextReviewDate)).length;
  }, [list]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">错题本 & 艾宾浩斯复习库</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/60">共 {list.length} 道错题 · 今日待复习 {dueCount} 道</p>
        </div>
        {list.length > 0 && (
          <button type="button" className="btn-danger text-xs px-3 py-1.5" onClick={clearAllWrongs}>
            清空全部错题
          </button>
        )}
      </header>

      {/* SM-2 Ebbinghaus Memory Curve Banner */}
      {list.length > 0 && (
        <div className="card p-4 bg-gradient-to-r from-indigo-50 dark:from-indigo-950/60 to-slate-100 dark:to-slate-900 border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">艾宾浩斯 SM-2 智能复习引擎</h3>
              <p className="text-xs text-slate-600 dark:text-white/60 mt-0.5">
                {dueCount > 0
                  ? `根据记忆衰减曲线，今日有 ${dueCount} 道错题已达到复习最佳临界点！`
                  : "太棒了！今日错题的记忆保留度极佳，暂无到期需复习的题目。"}
              </p>
            </div>
          </div>
          {dueCount > 0 && (
            <Link to={`/practice/${list[0].question!.slug}`} className="btn-primary text-xs shrink-0 py-2 font-bold">
              一键开启复习 ▶
            </Link>
          )}
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          emoji="🎉"
          title="暂无错题记录"
          hint="去刷题练习吧，答错的题目会自动精炼收集至此错题库中。"
          action={<Link className="btn-primary font-bold" to="/questions">去题库练习</Link>}
        />
      ) : (
        <div className="space-y-3">
          {list.map(({ wrong, question }) => {
            const isDue = isItemDueForReview((wrong as any).nextReviewDate);
            return (
              <div key={wrong.questionId} className={`card p-4 transition ${isDue ? "border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 text-xs text-brand-600 dark:text-brand-300 font-semibold">
                      {typeLabel(question!.type)}
                    </span>
                    <DifficultyBadge difficulty={question!.difficulty} />
                    <span className="text-xs text-rose-600 dark:text-rose-300 font-bold">错 {wrong.wrongCount} 次</span>
                    {isDue && (
                      <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 animate-pulse">
                        今日到期复习
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-white/40">{wrong.lastAt.slice(0, 10)}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white line-clamp-3 leading-relaxed">{question!.stem}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link className="btn-primary text-xs font-bold px-3 py-1.5" to={`/practice/${question!.slug}`}>重做巩固</Link>
                    {(() => {
                      const kps = question!.knowledge_points || question!.knowledgePoints || [];
                      const targetKp = kps[0] || question!.chapter || "";
                      const relatedLesson = data.lessons.find(
                        (l) => l.title.includes(targetKp) || l.summary.includes(targetKp)
                      );
                      if (!relatedLesson) return null;
                      return (
                        <Link
                          to={`/lessons/${relatedLesson.id}`}
                          className="btn-ghost text-xs text-brand-600 dark:text-brand-300 hover:underline border-slate-200 dark:border-brand-500/30"
                        >
                          📖 查阅源头讲义
                        </Link>
                      );
                    })()}
                  </div>
                  <button type="button" className="btn-ghost text-xs text-slate-500 hover:text-rose-600" onClick={() => clearWrong(wrong.questionId)}>
                    移除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
