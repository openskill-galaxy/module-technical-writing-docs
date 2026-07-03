import type { Question, ExamDetailItem } from "../types";

// 比较用户答案与正确答案（选项键忽略顺序）
export function isAnswerCorrect(q: Question, userAnswer: string[]): boolean {
  const norm = (arr: string[]) =>
    arr
      .map((s) => s.trim())
      .filter(Boolean)
      .sort()
      .join("|");
  if (q.type === "short") {
    // 短答：任一正确答案匹配即对（answer 中可含多个候选，用 | 分隔）
    const candidates = q.answer.join("|").split("|").map((s) => s.trim()).filter(Boolean);
    const ua = userAnswer.join("").trim();
    return candidates.some((c) => ua.toLowerCase() === c.toLowerCase());
  }
  return norm(q.answer) === norm(userAnswer);
}

// 单题得分权重（按难度）
export function questionWeight(q: Question): number {
  switch (q.difficulty) {
    case "easy":
      return 1;
    case "medium":
      return 2;
    case "hard":
      return 3;
  }
}

// 计算考试详情：每题对错 + 总分（0-100）+ 是否通过
export function scoreExam(
  questions: Question[],
  userAnswers: Record<string, string[]>,
  passingScore: number
): {
  score: number;
  passed: boolean;
  details: ExamDetailItem[];
} {
  const details: ExamDetailItem[] = questions.map((q) => {
    const ua = userAnswers[q.id] || [];
    const correct = isAnswerCorrect(q, ua);
    return { questionId: q.id, userAnswer: ua, correct };
  });

  const totalWeight = questions.reduce((s, q) => s + questionWeight(q), 0);
  const gotWeight = questions.reduce(
    (s, q) => s + (details.find((d) => d.questionId === q.id)?.correct ? questionWeight(q) : 0),
    0
  );
  const score = totalWeight === 0 ? 0 : Math.round((gotWeight / totalWeight) * 100);
  return { score, passed: score >= passingScore, details };
}

export function difficultyLabel(d: Question["difficulty"]): string {
  return d === "easy" ? "简单" : d === "medium" ? "中等" : "困难";
}

export function typeLabel(t: Question["type"]): string {
  return t === "single" ? "单选" : t === "multiple" ? "多选" : t === "judge" ? "判断" : "简答";
}
