import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import DifficultyBadge from "../components/DifficultyBadge";
import { useProgressStore } from "../store/useProgressStore";

export default function ExamsPage({ data }: { data: ModuleData }) {
  const exams = useProgressStore((s) => s.exams);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">模拟考试</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/60">共 {data.exams.length} 套全真标准试卷</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.exams.map((exam) => {
          const latest = exams.find((r) => r.examId === exam.id);
          return (
            <Link key={exam.id} to={`/exams/${exam.slug}`} className="card-hover p-5 block">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{exam.title}</h3>
                <DifficultyBadge difficulty={exam.difficulty} />
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-white/70 line-clamp-2 leading-relaxed">{exam.summary}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-white/50 font-medium">
                <span>📝 {exam.questionIds.length} 题</span>
                <span>⏱️ 限时 {exam.timeLimitMinutes} 分钟</span>
                <span>🎯 及格 {exam.passingScore} 分</span>
              </div>
              {latest && (
                <div className="mt-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-3 py-2 text-xs">
                  <span className={latest.passed ? "text-emerald-700 dark:text-emerald-300 font-bold" : "text-rose-700 dark:text-rose-300 font-bold"}>
                    最近模考：{latest.score} 分 {latest.passed ? "✓ 通过" : "✗ 未通过"}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {exams.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">模考历史记录</h2>
          <div className="card divide-y divide-slate-200 dark:divide-white/10">
            {exams.slice(0, 10).map((rec, idx) => {
              const exam = data.exams.find((e) => e.id === rec.examId);
              return (
                <div key={idx} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{exam?.title || rec.examId}</p>
                    <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{rec.finishedAt}</p>
                  </div>
                  <span className={`text-sm font-extrabold ${rec.passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
                    {rec.score} 分
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
