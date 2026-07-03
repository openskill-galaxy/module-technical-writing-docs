import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Exam, Question } from "../types";
import { typeLabel } from "../utils/scoring";
import { remainingSeconds, formatDuration, finishExam } from "../utils/exam";
import { useProgressStore } from "../store/useProgressStore";

interface Props {
  exam: Exam;
  questions: Question[];
}

export default function ExamPlayer({ exam, questions }: Props) {
  const [startedAt] = useState(() => new Date().toISOString());
  const [remaining, setRemaining] = useState(exam.timeLimitMinutes * 60);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [ submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const addExam = useProgressStore((s) => s.addExam);

  // 倒计时
  useEffect(() => {
    const t = setInterval(() => {
      const r = remainingSeconds(startedAt, exam.timeLimitMinutes);
      setRemaining(r);
      if (r <= 0) {
        clearInterval(t);
        submit();
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, exam.timeLimitMinutes]);

  const q = questions[current];
  const total = questions.length;
  const userAnswer = answers[q?.id] || [];
  const answeredCount = Object.keys(answers).filter((k) => (answers[k] || []).length > 0).length;

  function setAns(arr: string[]) {
    setAnswers((prev) => ({ ...prev, [q.id]: arr }));
  }
  function toggleSingle(key: string) { setAns([key]); }
  function toggleMultiple(key: string) {
    setAns(userAnswer.includes(key) ? userAnswer.filter((k) => k !== key) : [...userAnswer, key]);
  }
  function setJudge(val: "T" | "F") { setAns([val]); }

  function submit() {
    if (submitting) return;
    setSubmitting(true);
    const rec = finishExam(exam, questions, answers, startedAt);
    addExam(rec);
    navigate(`/exams/${exam.slug}/result`, { state: { record: rec } });
  }

  const isTimeUp = remaining <= 0;

  if (total === 0) {
    return <p className="text-white/60">该考试暂无题目。</p>;
  }

  const grid = useMemo(
    () => questions.map((qq, idx) => ({ idx, answered: (answers[qq.id] || []).length > 0 })),
    [questions, answers]
  );

  return (
    <div className="space-y-5">
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white">{exam.title}</h1>
          <p className="text-xs text-white/50">
            共 {total} 题 · 限时 {exam.timeLimitMinutes} 分钟 · 及格 {exam.passingScore} 分
          </p>
        </div>
        <div className={`rounded-lg px-4 py-2 text-lg font-mono ${
          remaining < 60 ? "bg-rose-500/20 text-rose-200" : "bg-white/10 text-white"
        }`}>
          ⏱ {formatDuration(remaining)}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded bg-brand-500/20 px-2 py-0.5 text-xs text-brand-100">
            {typeLabel(q.type)}
          </span>
          <span className="text-xs text-white/50">第 {current + 1} / {total} 题</span>
        </div>
        <p className="text-sm text-white whitespace-pre-wrap">{q.stem}</p>

        <div className="mt-4 space-y-2">
          {q.type === "short" ? (
            <textarea
              value={userAnswer.join("")}
              onChange={(e) => setAns([e.target.value])}
              rows={4}
              placeholder="请输入你的答案…"
              className="input resize-y"
            />
          ) : q.type === "judge" ? (
            <div className="flex gap-3">
              {(["T", "F"] as const).map((v) => {
                const selected = userAnswer[0] === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setJudge(v)}
                    className={`option-btn !w-auto ${selected ? "option-btn-selected" : ""}`}
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
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => q.type === "single" ? toggleSingle(opt.key) : toggleMultiple(opt.key)}
                  className={`option-btn ${selected ? "option-btn-selected" : ""}`}
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
      </div>

      <div className="card p-4">
        <p className="mb-2 text-xs text-white/50">答题卡（已答 {answeredCount}/{total}）</p>
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
          {grid.map((g) => (
            <button
              key={g.idx}
              type="button"
              onClick={() => setCurrent(g.idx)}
              className={`h-8 rounded text-xs font-medium transition ${
                g.idx === current
                  ? "bg-brand-600 text-white"
                  : g.answered
                    ? "bg-brand-500/30 text-brand-100"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {g.idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn-ghost"
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
        >
          上一题
        </button>
        <div className="flex gap-2">
          {current < total - 1 ? (
            <button type="button" className="btn-primary" onClick={() => setCurrent((c) => c + 1)}>
              下一题
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={submit}
              disabled={submitting}
            >
              交卷
            </button>
          )}
          <button type="button" className="btn-danger" onClick={submit} disabled={submitting}>
            提前交卷
          </button>
        </div>
      </div>

      {isTimeUp && (
        <p className="text-center text-rose-300 text-sm">时间已到，自动交卷中…</p>
      )}
    </div>
  );
}
