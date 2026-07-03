import { Link } from "react-router-dom";
import type { KnowledgePoint } from "../types";
import DifficultyBadge from "./DifficultyBadge";

export default function KnowledgePointCard({ kp }: { kp: KnowledgePoint }) {
  return (
    <Link to={`/knowledge/${kp.slug}`} className="card-hover block p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-white">{kp.title}</h3>
        <DifficultyBadge difficulty={kp.difficulty} />
      </div>
      <p className="mt-2 text-sm text-white/70 line-clamp-3">{kp.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {kp.tags.slice(0, 3).map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
    </Link>
  );
}
