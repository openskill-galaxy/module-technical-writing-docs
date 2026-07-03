import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Question } from "../types";
import { isAnswerCorrect, typeLabel, difficultyLabel } from "../utils/scoring";
import { renderMarkdown } from "../utils/markdown";
import DifficultyBadge from "./DifficultyBadge";
import { useProgressStore } from "../store/useProgressStore";

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
  const recordAnswer = useProgressStore((s) => s.recordAnswer);

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
  }

  const isJudged = !!judged[q.id];
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
            {current + 1} / {total} · 约 {q.estimatedMinutes} 分钟
          </span>
        </div>
        <span className="text-xs text-white/50">已答 {answeredCount}/{total}</span>
      </div>

      <div className="card p-5">
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
            <div className="mt-3">{renderMarkdown(q.analysis)}</div>
            {q.knowledgePoints.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {q.knowledgePoints.map((id) => (
                  <span key={id} className="tag">KP:{id}</span>
                ))}
              </div>
            )}
          </div>
        )}
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
