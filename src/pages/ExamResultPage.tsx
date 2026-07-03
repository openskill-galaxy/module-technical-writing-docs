import { Link, useLocation, useParams } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import type { ExamRecord } from "../types";
import ProgressBar from "../components/ProgressBar";

export default function ExamResultPage({ data }: { data: ModuleData }) {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const record = (location.state as { record?: ExamRecord })?.record;

  const exam = data.exams.find((e) => e.slug === slug);

  if (!record) {
    return (
      <div className="space-y-4">
        <p className="text-white/70">未找到考试结果。</p>
        <Link className="btn-ghost" to="/exams">返回考试列表</Link>
      </div>
    );
  }

  const minutes = Math.floor(record.durationSeconds / 60);
  const seconds = record.durationSeconds % 60;

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className={`text-5xl ${record.passed ? "text-emerald-400" : "text-rose-400"}`}>
          {record.passed ? "🎉" : "😞"}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white">
          {record.passed ? "恭喜通过！" : "未通过"}
        </h1>
        <p className="mt-2 text-4xl font-bold text-white">{record.score}<span className="text-lg text-white/50"> 分</span></p>
        <p className="mt-1 text-sm text-white/60">
          用时 {minutes} 分 {seconds} 秒 · 及格线 {exam?.passingScore ?? "?"} 分
        </p>
      </header>

      <ProgressBar value={record.score} />

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">答题详情</h2>
        <div className="card divide-y divide-white/10">
          {record.details.map((d, idx) => {
            const q = data.questions.find((qq) => qq.id === d.questionId);
            return (
              <div key={idx} className="px-4 py-3 flex items-start gap-3">
                <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                  d.correct ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white line-clamp-2">{q?.stem || d.questionId}</p>
                  <p className="mt-1 text-xs text-white/50">
                    你的答案：{d.userAnswer.join(", ") || "未作答"} · 正确答案：{q?.answer.join(", ") || "?"}
                  </p>
                </div>
                <span className={`text-xs ${d.correct ? "text-emerald-300" : "text-rose-300"}`}>
                  {d.correct ? "✓" : "✗"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex gap-3 justify-center">
        {exam && <Link className="btn-primary" to={`/exams/${exam.slug}`}>重新考试</Link>}
        <Link className="btn-ghost" to="/exams">返回考试列表</Link>
      </div>
    </div>
  );
}
