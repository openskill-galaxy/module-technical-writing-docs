import type { Difficulty } from "../types";

const map: Record<Difficulty, { label: string; cls: string }> = {
  easy: { label: "简单", cls: "bg-emerald-500/15 text-emerald-200" },
  medium: { label: "中等", cls: "bg-amber-500/15 text-amber-200" },
  hard: { label: "困难", cls: "bg-rose-500/15 text-rose-200" },
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const m = map[difficulty];
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${m.cls}`}>
      {m.label}
    </span>
  );
}
