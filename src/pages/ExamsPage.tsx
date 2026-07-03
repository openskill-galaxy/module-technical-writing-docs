import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import DifficultyBadge from "../components/DifficultyBadge";
import { useProgressStore } from "../store/useProgressStore";

export default function ExamsPage({ data }: { data: ModuleData }) {
  const exams = useProgressStore((s) => s.exams);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">模拟考试</h1>
        <p className="mt-1 text-sm text-white/60">共 {data.exams.length} 套试卷</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.exams.map((exam) => {
          const latest = exams.find((r) => r.examId === exam.id);
          return (
            <Link key={exam.id} to={`/exams/${exam.slug}`} className="card-hover p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-white">{exam.title}</h3>
                <DifficultyBadge difficulty={exam.difficulty} />
              </div>
              <p className="mt-2 text-sm text-white/70 line-clamp-2">{exam.summary}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/50">
                <span>{exam.questionIds.length} 题</span>
                <span>限时 {exam.timeLimitMinutes} 分钟</span>
                <span>及格 {exam.passingScore} 分</span>
              </div>
              {latest && (
                <div className="mt-3 rounded bg-white/5 px-3 py-2 text-xs">
                  <span className={latest.passed ? "text-emerald-300" : "text-rose-300"}>
                    最近：{latest.score} 分 {latest.passed ? "✓ 通过" : "✗ 未通过"}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {exams.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">历史记录</h2>
          <div className="card divide-y divide-white/10">
            {exams.slice(0, 10).map((rec, idx) => {
              const exam = data.exams.find((e) => e.id === rec.examId);
              return (
                <div key={idx} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-white">{exam?.title || rec.examId}</p>
                    <p className="text-xs text-white/50">{rec.finishedAt}</p>
                  </div>
                  <span className={`text-sm font-medium ${rec.passed ? "text-emerald-300" : "text-rose-300"}`}>
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
