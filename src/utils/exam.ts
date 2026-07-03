import type { Exam, Question, ExamRecord } from "../types";
import { scoreExam } from "./scoring";
import { nowIso } from "./storage";

// 构造考试题目顺序（按 exam.questionIds）
export function getExamQuestions(exam: Exam, all: Question[]): Question[] {
  return exam.questionIds
    .map((id) => all.find((q) => q.id === id))
    .filter((q): q is Question => Boolean(q));
}

// 提交考试，生成 ExamRecord
export function finishExam(
  exam: Exam,
  questions: Question[],
  userAnswers: Record<string, string[]>,
  startedAt: string
): ExamRecord {
  const { score, passed, details } = scoreExam(questions, userAnswers, exam.passingScore);
  const finishedAt = nowIso();
  const durationSeconds = Math.max(
    0,
    Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000)
  );
  return {
    examId: exam.id,
    startedAt,
    finishedAt,
    score,
    passed,
    durationSeconds,
    details,
  };
}

// 格式化时长 mm:ss
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// 倒计时：剩余秒数
export function remainingSeconds(
  startedAt: string,
  timeLimitMinutes: number
): number {
  const elapsed = Math.floor(
    (Date.now() - new Date(startedAt).getTime()) / 1000
  );
  return Math.max(0, timeLimitMinutes * 60 - elapsed);
}
