import { useState, useEffect, useMemo } from "react";
import type { Question } from "../types";
import { useAudioSynth } from "../hooks/useAudioSynth";

interface Props {
  questions: Question[];
  onClose: () => void;
}

export default function QuizSpeedRunModal({ questions, onClose }: Props) {
  const { playSound } = useAudioSynth();
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  // Shuffle questions for randomized speed-run session
  const shuffledQuestions = useMemo(() => {
    return [...questions].sort(() => Math.random() - 0.5);
  }, [questions]);

  const currentQ = shuffledQuestions[currentIndex] || shuffledQuestions[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (finished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFinished(true);
          playSound("timer");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finished, timeLeft, playSound]);

  function handleSelectOption(optKey: string) {
    if (finished || selectedOpt !== null || !currentQ) return;
    setSelectedOpt(optKey);

    const isCorrect = currentQ.answer.includes(optKey);
    if (isCorrect) {
      playSound("correct");
      setScore((s) => s + 10);
      setStreak((s) => {
        const next = s + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      playSound("incorrect");
      setStreak(0);
    }

    setTimeout(() => {
      setSelectedOpt(null);
      if (currentIndex + 1 < shuffledQuestions.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        setFinished(true);
      }
    }, 400);
  }

  function handleRestart() {
    setTimeLeft(60);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setFinished(false);
    setSelectedOpt(null);
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card max-w-xl w-full p-6 space-y-6 border border-cyan-500/30 bg-slate-950 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-white/50 hover:text-white text-lg font-mono"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">60 秒极速刷题挑战赛</h2>
              <p className="text-xs text-white/50">在限时倒计时内快速切题，挑战最高 Score & Streak 纪录！</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-xs text-white/50">倒计时:</span>
            <span className={`text-lg font-extrabold ${timeLeft <= 10 ? "text-rose-400 animate-ping" : "text-cyan-300"}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {!finished ? (
          <div className="space-y-5">
            {/* Stats Dashboard */}
            <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/5 text-xs font-mono">
              <div>
                得分: <strong className="text-emerald-400 text-sm">{score}</strong> pts
              </div>
              <div>
                当前连胜: <strong className="text-amber-300 text-sm">🔥 {streak}</strong>
              </div>
              <div>
                最大连击: <strong className="text-cyan-300 text-sm">⚡ {maxStreak}</strong>
              </div>
            </div>

            {/* Question Stem */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-white/40">
                第 {currentIndex + 1} / {shuffledQuestions.length} 题
              </span>
              <h3 className="text-sm font-semibold text-white leading-relaxed">
                {currentQ?.stem}
              </h3>
            </div>

            {/* Option Buttons */}
            <div className="grid gap-2.5">
              {currentQ &&
                (Array.isArray(currentQ.options)
                  ? currentQ.options
                  : Object.entries(currentQ.options as any).map(([k, v]) => ({ key: k, text: v as string }))
                ).map((opt: any) => {
                  const key = typeof opt === "object" ? opt.key : opt;
                  const text = typeof opt === "object" ? opt.text : opt;
                  let btnStyle = "bg-white/[0.04] border-white/10 hover:bg-white/10 text-white";

                  if (selectedOpt === key) {
                    if (currentQ.answer.includes(key)) {
                      btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold";
                    } else {
                      btnStyle = "bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold";
                    }
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      disabled={selectedOpt !== null}
                      type="button"
                      className={`w-full p-3 rounded-xl border text-xs text-left transition flex items-center gap-3 ${btnStyle}`}
                    >
                      <span className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center font-mono text-[11px]">
                        {key}
                      </span>
                      <span className="flex-1">{text}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ) : (
          /* Speed Run Result Summary */
          <div className="text-center py-6 space-y-5">
            <div className="text-5xl">🏆</div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">挑战结算完成！</h3>
              <p className="text-xs text-white/50">你的极限挑战成绩如下</p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 font-mono">
              <div className="space-y-1">
                <p className="text-[10px] text-white/40">最终得分</p>
                <p className="text-lg font-bold text-emerald-400">{score}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/40">答对题数</p>
                <p className="text-lg font-bold text-cyan-300">{score / 10}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/40">最高连击</p>
                <p className="text-lg font-bold text-amber-300">🔥 {maxStreak}</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button onClick={handleRestart} className="btn-primary text-xs" type="button">
                🔄 重新挑战
              </button>
              <button onClick={onClose} className="btn-ghost text-xs" type="button">
                退出挑战
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
