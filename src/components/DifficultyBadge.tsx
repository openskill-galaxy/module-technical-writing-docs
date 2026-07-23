import type { Difficulty } from "../types";

const map: Record<Difficulty, { label: string; cls: string }> = {
  easy: { label: "简单", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold" },
  medium: { label: "中等", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold" },
  hard: { label: "困难", cls: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-semibold" },
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const m = map[difficulty] || map.easy;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${m.cls}`}>
      {m.label}
    </span>
  );
}
