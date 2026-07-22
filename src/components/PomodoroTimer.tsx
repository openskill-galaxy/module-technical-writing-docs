import { useEffect, useState } from "react";

export default function PomodoroTimer() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play Web Audio chime on completion
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch (e) {
        // ignore audio errors
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  function resetTimer(mins = 25) {
    setIsRunning(false);
    setSecondsLeft(mins * 60);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={`btn-ghost text-xs flex items-center gap-1.5 py-1 px-2.5 rounded-full transition ${
          isRunning ? "border-brand-500/50 text-brand-300 bg-brand-500/10 animate-pulse" : ""
        }`}
        title="番茄专注计时器"
      >
        <span>⏱️</span>
        <span className="font-mono font-bold">{formattedTime}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-64 card p-4 bg-white/95 dark:bg-slate-950/95 border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>⏱️</span> 专注番茄钟
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-900 dark:text-white/40 dark:hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="text-center py-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-widest block">
              {formattedTime}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-white/50 mt-1 block">
              {isRunning ? "🔥 保持专注学习中..." : "准备开始 25 分钟高效专注"}
            </span>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="btn-primary text-xs flex-1 py-1.5 font-bold"
            >
              {isRunning ? "暂停" : "开始专注"}
            </button>
            <button
              onClick={() => resetTimer(25)}
              className="btn-ghost text-xs py-1.5"
            >
              重置
            </button>
          </div>

          <div className="flex justify-center gap-1.5 pt-1 border-t border-slate-200 dark:border-white/5">
            <button onClick={() => resetTimer(15)} className="text-[10px] text-slate-500 dark:text-white/40 hover:text-brand-600 dark:hover:text-brand-300">15m</button>
            <span className="text-[10px] text-slate-300 dark:text-white/20">•</span>
            <button onClick={() => resetTimer(25)} className="text-[10px] text-slate-500 dark:text-white/40 hover:text-brand-600 dark:hover:text-brand-300">25m</button>
            <span className="text-[10px] text-slate-300 dark:text-white/20">•</span>
            <button onClick={() => resetTimer(45)} className="text-[10px] text-slate-500 dark:text-white/40 hover:text-brand-600 dark:hover:text-brand-300">45m</button>
          </div>
        </div>
      )}
    </div>
  );
}
