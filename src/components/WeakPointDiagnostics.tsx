import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import { useProgressStore } from "../store/useProgressStore";

interface Props {
  data: ModuleData;
}

export default function WeakPointDiagnostics({ data }: Props) {
  const wrongs = useProgressStore((s) => s.wrongs);
  const wrongList = Object.keys(wrongs);

  if (wrongList.length === 0) {
    return (
      <div className="card p-5 border border-emerald-500/20 bg-emerald-950/20 text-center space-y-2">
        <div className="text-3xl">🎉</div>
        <h3 className="text-sm font-bold text-emerald-300">知识库完美无错题</h3>
        <p className="text-xs text-white/50">当前模块尚未产生错题记录，保持高水准答题姿势！</p>
      </div>
    );
  }

  // Calculate weak knowledge points
  const kpMap: Record<string, number> = {};
  wrongList.forEach((qId) => {
    const q = data.questions.find((item) => item.id === qId);
    if (q) {
      const kps = q.knowledge_points || q.knowledgePoints || [q.chapter || "基础概念"];
      kps.forEach((kp) => {
        kpMap[kp] = (kpMap[kp] || 0) + 1;
      });
    }
  });

  const sortedWeakPoints = Object.entries(kpMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="card p-5 space-y-4 border border-rose-500/20 bg-slate-950/60 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">智能薄弱知识点诊断与攻坚</h3>
            <p className="text-[11px] text-white/50">根据已有 {wrongList.length} 道错题，自动定位需强化的薄弱环节</p>
          </div>
        </div>
        <Link to="/wrong" className="text-xs text-rose-300 hover:underline">
          查看全部错题 ({wrongList.length}) →
        </Link>
      </div>

      <div className="space-y-3">
        {sortedWeakPoints.map(([kp, count]) => {
          // Find related lesson
          const relatedLesson = data.lessons.find(
            (l) => l.title.includes(kp) || l.summary.includes(kp)
          ) || data.lessons[0];

          return (
            <div key={kp} className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    薄弱项: {kp}
                  </span>
                  <span className="text-[11px] text-white/40">关联错题 {count} 道</span>
                </div>
                <p className="text-[11px] text-white/50 truncate">推荐复习: {relatedLesson.title}</p>
              </div>

              {relatedLesson && (
                <Link
                  to={`/lessons/${relatedLesson.id}`}
                  className="btn-ghost text-xs text-brand-300 hover:text-white border-brand-500/30 whitespace-nowrap"
                >
                  📖 定向攻坚
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
