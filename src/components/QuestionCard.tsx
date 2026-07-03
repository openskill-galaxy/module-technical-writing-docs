import { Link } from "react-router-dom";
import type { Question } from "../types";
import DifficultyBadge from "./DifficultyBadge";
import { typeLabel } from "../utils/scoring";

export default function QuestionCard({
  question,
  to,
}: {
  question: Question;
  to?: string;
}) {
  const href = to || `/questions/${question.slug}`;
  return (
    <Link to={href} className="card-hover block p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-xs text-brand-100">
            {typeLabel(question.type)}
          </span>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
        <span className="text-xs text-white/40">#{question.slug}</span>
      </div>
      <p className="mt-2 text-sm text-white/90 line-clamp-3">{question.stem}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {question.tags.slice(0, 3).map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
    </Link>
  );
}
