import { useEffect, useMemo } from "react";
import { useProgressStore } from "../store/useProgressStore";

interface Props {
  onClose: () => void;
}

export default function AchievementsModal({ onClose }: Props) {
  const progress = useProgressStore((s) => s.progress);
  const favorites = useProgressStore((s) => s.favorites);
  const wrongs = useProgressStore((s) => s.wrongs);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const achievements = useMemo(() => {
    const completedCount = Object.values(progress).filter((v) => v.status === "completed").length;
    const activeDatesStr = localStorage.getItem("openskill-active-dates");
    const activeDates: Record<string, number> = activeDatesStr ? JSON.parse(activeDatesStr) : {};
    const streakDays = Object.keys(activeDates).length;

    return [
      {
        id: "first_step",
        title: "初出茅庐",
        desc: "完成首篇讲义研读",
        icon: "🚀",
        unlocked: completedCount >= 1,
        progressText: `${Math.min(completedCount, 1)}/1`,
      },
      {
        id: "streak_master",
        title: "持之以恒",
        desc: "累计打卡学习 3 天及以上",
        icon: "🔥",
        unlocked: streakDays >= 3,
        progressText: `${Math.min(streakDays, 3)}/3 天`,
      },
      {
        id: "knowledge_seeker",
        title: "知识猎手",
        desc: "收藏 3 个以上核心知识点/讲义",
        icon: "⭐",
        unlocked: favorites.length >= 3,
        progressText: `${Math.min(favorites.length, 3)}/3`,
      },
      {
        id: "error_conqueror",
        title: "错题克星",
        desc: "积累并开始攻坚错题库",
        icon: "🛡️",
        unlocked: Object.keys(wrongs).length >= 1,
        progressText: `${Math.min(Object.keys(wrongs).length, 1)}/1`,
      },
      {
        id: "scholar_master",
        title: "通关学霸",
        desc: "研读完成 10 篇以上核心讲义",
        icon: "🎓",
        unlocked: completedCount >= 10,
        progressText: `${Math.min(completedCount, 10)}/10`,
      },
      {
        id: "perfect_score",
        title: "满分神话",
        desc: "模考取得满分优秀成绩",
        icon: "🏆",
        unlocked: completedCount >= 5,
        progressText: "已解锁",
      },
    ];
  }, [progress, favorites, wrongs]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card max-w-lg w-full p-6 space-y-6 border border-amber-500/30 bg-slate-950 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-white/50 hover:text-white text-lg font-mono"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="text-3xl">🏆</span>
          <div>
            <h2 className="text-lg font-bold text-white">游戏化成就勋章墙</h2>
            <p className="text-xs text-white/50">已解锁 {unlockedCount} / {achievements.length} 枚专属学习徽章</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all ${
                item.unlocked
                  ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  : "bg-white/[0.02] border-white/5 opacity-50 grayscale"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                  <p className="text-[10px] text-white/50 line-clamp-1">{item.desc}</p>
                  <span className="inline-block text-[9px] font-mono text-amber-300/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {item.progressText}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-right">
          <button onClick={onClose} type="button" className="btn-ghost text-xs">
            关闭 (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
