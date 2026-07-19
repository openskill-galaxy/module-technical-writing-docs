import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import type { ExamRecord } from "../types";
import ProgressBar from "../components/ProgressBar";
import RadarChart, { RadarDataPoint } from "../components/RadarChart";

export default function ExamResultPage({ data }: { data: ModuleData }) {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const record = (location.state as { record?: ExamRecord })?.record;

  const exam = data.exams.find((e) => e.slug === slug);

  const radarData: RadarDataPoint[] = useMemo(() => {
    if (!record) return [];

    const total = record.details.length;
    const correctCount = record.details.filter((d) => d.correct).length;
    const accuracy = total > 0 ? (correctCount / total) * 100 : 0;

    // Time efficiency score
    const targetSeconds = (exam?.timeLimitMinutes || 30) * 60;
    const timeRatio = Math.max(0, 1 - record.durationSeconds / targetSeconds);
    const timeScore = Math.min(100, Math.round(50 + timeRatio * 50));

    // Basic & advanced ratios
    const easyCorrect = record.details.filter((d) => {
      const q = data.questions.find((qq) => qq.id === d.questionId);
      return (q?.difficulty === "easy" || q?.difficulty === "medium") && d.correct;
    }).length;
    const easyScore = Math.min(100, Math.round((easyCorrect / Math.max(1, total)) * 130));

    const hardCorrect = record.details.filter((d) => {
      const q = data.questions.find((qq) => qq.id === d.questionId);
      return q?.difficulty === "hard" && d.correct;
    }).length;
    const hardScore = Math.min(100, Math.round(60 + hardCorrect * 20));

    const coverage = Math.min(100, Math.round((total / Math.max(1, data.questions.length)) * 100));

    return [
      { label: "答题准确率", score: accuracy },
      { label: "概念基础度", score: easyScore },
      { label: "高阶逻辑力", score: hardScore },
      { label: "答题效率", score: timeScore },
      { label: "覆盖全面度", score: coverage },
    ];
  }, [record, exam, data.questions]);

  // Recommended review lessons for wrong questions
  const wrongLessons = useMemo(() => {
    if (!record) return [];
    const wrongQIds = record.details.filter((d) => !d.correct).map((d) => d.questionId);
    
    // Match lessons containing knowledge points or related to wrong questions
    const lessonsSet = new Set<string>();
    wrongQIds.forEach((qId) => {
      const q = data.questions.find((qq) => qq.id === qId);
      if (q?.knowledge_points) {
        data.lessons.forEach((les) => {
          const kps = les.knowledgePoints || [];
          if (kps.some((kp: string) => q.knowledge_points?.includes(kp))) {
            lessonsSet.add(les.slug);
          }
        });
      }
    });

    if (lessonsSet.size === 0 && data.lessons.length > 0) {
      lessonsSet.add(data.lessons[0].slug);
    }

    return Array.from(lessonsSet).map((s) => data.lessons.find((l) => l.slug === s)).filter(Boolean);
  }, [record, data]);

  if (!record) {
    return (
      <div className="space-y-4 text-center py-10">
        <p className="text-white/70">未找到本次测验成绩数据。</p>
        <Link className="btn-ghost" to="/exams">返回测验中心</Link>
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
          {record.passed ? "恭喜考成！已达通关线" : "未达及格线，建议复习攻坚"}
        </h1>
        <p className="mt-2 text-4xl font-extrabold text-white">{record.score}<span className="text-lg text-white/50"> 分</span></p>
        <p className="mt-1 text-sm text-white/60">
          用时 {minutes} 分 {seconds} 秒 · 及格线 {exam?.passingScore ?? 60} 分
        </p>
      </header>

      <ProgressBar value={record.score} />

      {/* Competency Radar Diagnostic Card */}
      <section className="card p-6 md:p-8 space-y-4 bg-gradient-to-br from-slate-900/90 to-indigo-950/40 border-brand-500/20">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <span>📊</span> 综合能力多维诊断蛛网图
          </h2>
          <span className="text-xs text-white/40">系统智能评估分析</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-around gap-6">
          <RadarChart data={radarData} size={280} />
          
          <div className="space-y-3 flex-1 max-w-sm">
            <h3 className="text-xs font-bold text-brand-200 uppercase tracking-wider">💡 针对性攻坚建议</h3>
            {record.score >= 80 ? (
              <p className="text-xs text-emerald-300 leading-relaxed bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                表现极为优异！您的基础概念与高阶逻辑均十分扎实，建议保持节奏，挑战更多高难度综合实战模块。
              </p>
            ) : (
              <p className="text-xs text-amber-300 leading-relaxed bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                测验中发现部分知识盲区。建议重点复习薄弱讲义，并通过错题本反复巩固。
              </p>
            )}

            {wrongLessons.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-white/50 block">推荐重点讲义复习:</span>
                <div className="flex flex-wrap gap-2">
                  {wrongLessons.slice(0, 4).map((les) => (
                    <Link
                      key={les!.slug}
                      to={`/lessons/${les!.slug}`}
                      className="tag hover:border-brand-400/50 hover:text-white transition py-1 text-xs"
                    >
                      📖 {les!.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Answer Details Section */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">📝 逐题评分与答题回顾</h2>
        <div className="card divide-y divide-white/10 overflow-hidden">
          {record.details.map((d, idx) => {
            const q = data.questions.find((qq) => qq.id === d.questionId);
            return (
              <div key={idx} className="px-4 py-3 flex items-start gap-3 hover:bg-white/[0.01] transition">
                <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  d.correct ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white line-clamp-2 leading-relaxed">{q?.stem || d.questionId}</p>
                  <p className="mt-1 text-xs text-white/50">
                    你的答案：<span className={d.correct ? "text-emerald-300 font-semibold" : "text-rose-300 font-semibold"}>{d.userAnswer.join(", ") || "未作答"}</span> · 正确答案：<span className="text-white/80 font-semibold">{q?.answer.join(", ") || "?"}</span>
                  </p>
                </div>
                <span className={`text-sm font-bold ${d.correct ? "text-emerald-400" : "text-rose-400"}`}>
                  {d.correct ? "✓ 得分" : "✗ 未得分"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex gap-3 justify-center pt-2">
        {exam && <Link className="btn-primary px-6" to={`/exams/${exam.slug}`}>重新考试</Link>}
        <Link className="btn-ghost" to="/exams">返回测验列表</Link>
      </div>
    </div>
  );
}
