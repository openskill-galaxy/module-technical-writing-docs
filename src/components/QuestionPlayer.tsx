import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Question } from "../types";
import { isAnswerCorrect, typeLabel, difficultyLabel } from "../utils/scoring";
import { renderMarkdown } from "../utils/markdown";
import DifficultyBadge from "./DifficultyBadge";
import PersonalNotes from "./PersonalNotes";
import { useProgressStore } from "../store/useProgressStore";

function triggerConfetti() {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "9999";
  document.body.appendChild(container);

  const colors = ["#3b82f6", "#10b981", "#fbbf24", "#ef4444", "#8b5cf6", "#ec4899"];

  for (let i = 0; i < 40; i++) {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.width = `${Math.random() * 6 + 6}px`;
    el.style.height = `${Math.random() * 6 + 6}px`;
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.borderRadius = "50%";
    el.style.left = "50%";
    el.style.top = "40%";
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 120 + 80;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 60; // upward bias

    el.animate([
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.5)`, opacity: 0 }
    ], {
      duration: 800 + Math.random() * 400,
      easing: "ease-out"
    });

    container.appendChild(el);
  }

  setTimeout(() => {
    container.remove();
  }, 1300);
}

function playSynthSound(type: "correct" | "incorrect") {
  if (localStorage.getItem("openskill-sound") === "muted") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "correct") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150.00, now);
      osc.frequency.linearRampToValueAtTime(90.00, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {}
}

interface Props {
  questions: Question[];
  // 是否立即判分（练习模式即时判分；考试模式不在此处判分）
  instant?: boolean;
  // 提交后回调（仅 instant=false 时由父组件调用 finish）
  onFinish?: (answers: Record<string, string[]>) => void;
  submitLabel?: string;
}

export default function QuestionPlayer({
  questions,
  instant = true,
  onFinish,
  submitLabel = "提交全部",
}: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  // 已判分题目集合（instant 模式下记录已答）
  const [judged, setJudged] = useState<Record<string, boolean>>({});
  const [shake, setShake] = useState(false);
  const recordAnswer = useProgressStore((s) => s.recordAnswer);
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem("openskill-sound") === "muted";
  });

  const toggleSound = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    localStorage.setItem("openskill-sound", nextMuted ? "muted" : "unmuted");
  };

  const q = questions[current];
  const total = questions.length;

  const userAnswer = answers[q?.id] || [];

  const canPrev = current > 0;
  const canNext = current < total - 1;

  function setAns(arr: string[]) {
    setAnswers((prev) => ({ ...prev, [q.id]: arr }));
  }

  function toggleSingle(key: string) {
    setAns([key]);
  }
  const isJudged = !!judged[q?.id];

  function toggleMultiple(key: string) {
    if (userAnswer.includes(key)) {
      setAns(userAnswer.filter((k) => k !== key));
    } else {
      setAns([...userAnswer, key]);
    }
  }
  function setJudge(val: "T" | "F") {
    setAns([val]);
  }

  function commitInstant() {
    if (!instant) return;
    if (judged[q.id]) return;
    const correct = isAnswerCorrect(q, userAnswer);
    recordAnswer(q.id, userAnswer, correct);
    setJudged((p) => ({ ...p, [q.id]: true }));
    
    if (correct) {
      triggerConfetti();
      playSynthSound("correct");
    } else {
      setShake(true);
      playSynthSound("incorrect");
      setTimeout(() => setShake(false), 300);
    }
  }

  useEffect(() => {
    if (!q) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      const key = e.key.toUpperCase();

      if ((q.type === "single" || q.type === "multiple") && !(isJudged && instant)) {
        const optionKeys = q.options ? Object.keys(q.options) : [];
        let matchedKey = "";
        
        if (optionKeys.includes(key)) {
          matchedKey = key;
        } else if (["1", "2", "3", "4", "5", "6"].includes(key)) {
          const idx = parseInt(key, 10) - 1;
          if (idx < optionKeys.length) {
            matchedKey = optionKeys[idx];
          }
        }

        if (matchedKey) {
          if (q.type === "single") {
            toggleSingle(matchedKey);
          } else {
            toggleMultiple(matchedKey);
          }
        }
      } else if (q.type === "judge" && !(isJudged && instant)) {
        if (key === "A" || key === "1" || key === "T") {
          setAns(["T"]);
        } else if (key === "B" || key === "2" || key === "F") {
          setAns(["F"]);
        }
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (instant && !isJudged) {
          commitInstant();
        } else if (canNext) {
          setCurrent((c) => c + 1);
        }
      }

      if ((e.ctrlKey || e.altKey) && e.key === "ArrowRight" && canNext) {
        setCurrent((c) => c + 1);
      }
      if ((e.ctrlKey || e.altKey) && e.key === "ArrowLeft" && canPrev) {
        setCurrent((c) => c - 1);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [q, isJudged, instant, userAnswer, canNext, canPrev]);

  const correctNow = useMemo(
    () => (isJudged ? isAnswerCorrect(q, userAnswer) : false),
    [isJudged, q, userAnswer]
  );

  if (total === 0) {
    return <p className="text-white/60">暂无题目。</p>;
  }

  const answeredCount = Object.keys(answers).filter((k) =>
    (answers[k] || []).length > 0
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded bg-brand-500/20 px-2 py-0.5 text-xs text-brand-100">
            {typeLabel(q.type)}
          </span>
          <DifficultyBadge difficulty={q.difficulty} />
          <span className="text-xs text-white/50">
            {current + 1} / {total} · 约 {q.estimated_time} 分钟
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-xs text-white/60 hover:bg-white/5 hover:text-white transition duration-200"
            title={muted ? "开启答题音效" : "关闭答题音效"}
            type="button"
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <span className="text-xs text-white/50">已答 {answeredCount}/{total}</span>
        </div>
      </div>

      <div className={`card p-5 transition-all duration-300 ${shake ? "animate-shake border-rose-500/30 shadow-lg shadow-rose-500/5" : ""}`}>
        <p className="text-sm text-white whitespace-pre-wrap">{q.stem}</p>

        <div className="mt-4 space-y-2">
          {q.type === "short" ? (
            <textarea
              value={userAnswer.join("")}
              onChange={(e) => setAns([e.target.value])}
              disabled={isJudged && instant}
              rows={4}
              placeholder="请输入你的答案…"
              className="input resize-y"
            />
          ) : q.type === "judge" ? (
            <div className="flex gap-3">
              {(["T", "F"] as const).map((v) => {
                const selected = userAnswer[0] === v;
                const cls = isJudged && instant
                  ? v === q.answer[0]
                    ? "option-btn option-btn-correct"
                    : selected
                      ? "option-btn option-btn-wrong"
                      : "option-btn"
                  : selected
                    ? "option-btn option-btn-selected"
                    : "option-btn";
                return (
                  <button
                    key={v}
                    type="button"
                    disabled={isJudged && instant}
                    onClick={() => setJudge(v)}
                    className={`${cls} !w-auto`}
                  >
                    <span className={`option-key ${selected ? "option-key-selected" : ""}`}>
                      {v === "T" ? "√" : "×"}
                    </span>
                    {v === "T" ? "正确" : "错误"}
                  </button>
                );
              })}
            </div>
          ) : (
            q.options.map((opt) => {
              const selected = userAnswer.includes(opt.key);
              const showCorrect = isJudged && instant && q.answer.includes(opt.key);
              const showWrong = isJudged && instant && selected && !q.answer.includes(opt.key);
              const cls = showCorrect
                ? "option-btn option-btn-correct"
                : showWrong
                  ? "option-btn option-btn-wrong"
                  : selected
                    ? "option-btn option-btn-selected"
                    : "option-btn";
              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={isJudged && instant}
                  onClick={() =>
                    q.type === "single" ? toggleSingle(opt.key) : toggleMultiple(opt.key)
                  }
                  className={cls}
                >
                  <span className={`option-key ${selected ? "option-key-selected" : ""}`}>
                    {opt.key}
                  </span>
                  <span className="whitespace-pre-wrap">{opt.text}</span>
                </button>
              );
            })
          )}
        </div>

        {isJudged && instant && (
          <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
            <p className={`text-sm font-medium ${correctNow ? "text-emerald-300" : "text-rose-300"}`}>
              {correctNow ? "✓ 回答正确" : "✗ 回答错误"}
            </p>
            <p className="mt-1 text-xs text-white/50">
              正确答案：{q.type === "short" ? q.answer.join(" | ") : q.answer.join(", ")}
            </p>
            <div className="mt-3">{renderMarkdown(q.explanation)}</div>
            {q.knowledge_points && q.knowledge_points.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {q.knowledge_points.map((id) => (
                  <span key={id} className="tag">KP:{id}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <PersonalNotes targetType="question" targetId={q.id} />
      </div>

      {/* Question Navigation Grid */}
      <div className="card p-4">
        <h4 className="text-[10px] font-bold text-white/30 mb-3 tracking-widest uppercase">🧩 答题卡导航 (Ctrl+左/右 快捷翻页)</h4>
        <div className="flex flex-wrap gap-2">
          {questions.map((item, idx) => {
            const isCurrent = idx === current;
            const itemAns = answers[item.id] || [];
            const isAnswered = itemAns.length > 0;
            const itemJudged = !!judged[item.id];
            
            let btnClass = "flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold transition-all duration-200 ";
            
            if (itemJudged && instant) {
              const correct = isAnswerCorrect(item, itemAns);
              if (correct) {
                btnClass += "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20";
              } else {
                btnClass += "bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20";
              }
            } else if (isAnswered) {
              btnClass += "bg-brand-500/10 text-brand-200 border-brand-500/30 hover:bg-brand-500/20";
            } else {
              btnClass += "border-white/10 bg-white/[0.01] text-white/50 hover:bg-white/5 hover:text-white";
            }
            
            if (isCurrent) {
              btnClass += " ring-2 ring-brand-500 ring-offset-2 ring-offset-[#05060b]";
            }
            
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrent(idx)}
                className={btnClass}
                title={`第 ${idx + 1} 题`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn-ghost"
          disabled={!canPrev}
          onClick={() => setCurrent((c) => c - 1)}
        >
          上一题
        </button>

        {instant && !isJudged && userAnswer.length > 0 && (
          <button type="button" className="btn-primary" onClick={commitInstant}>
            提交本题
          </button>
        )}

        <div className="flex gap-2">
          {canNext ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCurrent((c) => c + 1)}
            >
              下一题
            </button>
          ) : !instant ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => onFinish?.(answers)}
              disabled={answeredCount === 0}
            >
              {submitLabel}
            </button>
          ) : (
            <Link className="btn-ghost" to="/wrong">查看错题本</Link>
          )}
        </div>
      </div>

      {!instant && (
        <div className="card p-3 text-xs text-white/50">
          共 {total} 题（{difficultyLabel(q.difficulty)}等），已答 {answeredCount} 题。
          点击右下「{submitLabel}」结束并生成成绩。
        </div>
      )}
    </div>
  );
}
