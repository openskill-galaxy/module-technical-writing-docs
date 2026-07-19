import { useMemo } from "react";

export default function StudyAnalytics() {
  // Generate last 60 days contribution grid data
  const { daysGrid, streak, totalActiveDays } = useMemo(() => {
    const grid: { date: string; count: number; level: number }[] = [];
    const today = new Date();
    let streakCount = 0;
    let activeDays = 0;

    // Load active dates from localStorage
    const activeDatesStr = localStorage.getItem("openskill-active-dates");
    const activeDates: Record<string, number> = activeDatesStr ? JSON.parse(activeDatesStr) : {};

    // Record today as active if not recorded
    const todayKey = today.toISOString().slice(0, 10);
    if (!activeDates[todayKey]) {
      activeDates[todayKey] = 1;
      localStorage.setItem("openskill-active-dates", JSON.stringify(activeDates));
    }

    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const count = activeDates[dateKey] || 0;
      
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      if (count > 0) activeDays++;
      grid.push({ date: dateKey, count, level });
    }

    // Calculate streak
    for (let i = grid.length - 1; i >= 0; i--) {
      if (grid[i].count > 0) streakCount++;
      else break;
    }

    return { daysGrid: grid, streak: streakCount, totalActiveDays: activeDays };
  }, []);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 4: return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]";
      case 3: return "bg-emerald-500/80";
      case 2: return "bg-emerald-600/50";
      case 1: return "bg-emerald-900/40 border border-emerald-500/20";
      default: return "bg-white/[0.04] border border-white/[0.04]";
    }
  };

  return (
    <div className="card p-5 space-y-4 border border-white/10 bg-slate-950/60 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">学习打卡热力图 & 连续专注</h3>
            <p className="text-[11px] text-white/50">已连续学习 <strong className="text-amber-300 font-extrabold">{streak} 天</strong> · 累计打卡 {totalActiveDays} 天</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-brand-300 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
          Streak: {streak}d 🔥
        </span>
      </div>

      {/* 60-Day Contribution Heatmap Grid */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-white/40 font-mono">
          <span>60 天前</span>
          <span>今日</span>
        </div>
        
        <div className="grid grid-flow-col grid-rows-5 gap-1.5 overflow-x-auto pb-1">
          {daysGrid.map((item) => (
            <div
              key={item.date}
              className={`h-3.5 w-3.5 rounded-sm transition-all duration-200 hover:scale-125 cursor-pointer ${getLevelColor(item.level)}`}
              title={`${item.date}: ${item.count} 次打卡学习`}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-1.5 text-[10px] text-white/40 pt-1">
          <span>少</span>
          <div className="h-2.5 w-2.5 rounded-sm bg-white/[0.04]" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-900/40" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-600/50" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/80" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
          <span>多</span>
        </div>
      </div>
    </div>
  );
}
