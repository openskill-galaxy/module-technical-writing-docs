import { Link } from "react-router-dom";
import type { Course } from "../types";
import DifficultyBadge from "./DifficultyBadge";
import ProgressBar from "./ProgressBar";
import { useProgressStore, courseProgress } from "../store/useProgressStore";

export default function CourseCard({ course }: { course: Course }) {
  const progress = useProgressStore((s) => s.progress);
  const cp = courseProgress(course, progress);
  return (
    <Link to={`/courses/${course.slug}`} className="card-hover block p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-white">{course.title}</h3>
        <DifficultyBadge difficulty={course.difficulty} />
      </div>
      <p className="mt-2 text-sm text-white/70 line-clamp-3">{course.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {course.tags.slice(0, 3).map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      <div className="mt-4">
        <ProgressBar value={cp.percent} />
        <p className="mt-1 text-xs text-white/50">
          {cp.completed}/{cp.total} 讲义 · 约 {course.estimatedHours}h
        </p>
      </div>
    </Link>
  );
}
