import { Link, useParams } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import DifficultyBadge from "../components/DifficultyBadge";
import ProgressBar from "../components/ProgressBar";
import { useProgressStore, courseProgress } from "../store/useProgressStore";

export default function CourseDetailPage({ data }: { data: ModuleData }) {
  const { slug } = useParams<{ slug: string }>();
  const progress = useProgressStore((s) => s.progress);
  const setLessonStatus = useProgressStore((s) => s.setLessonStatus);

  const course = data.courses.find((c) => c.slug === slug);
  if (!course) {
    return (
      <div className="space-y-4">
        <p className="text-white/70">未找到课程：{slug}</p>
        <Link className="btn-ghost" to="/courses">返回课程列表</Link>
      </div>
    );
  }

  const cp = courseProgress(course, progress);
  const lessons = course.lessons
    .map((lid) => data.lessons.find((l) => l.id === lid))
    .filter(Boolean);

  return (
    <article className="space-y-8">
      <nav className="text-sm text-white/50">
        <Link to="/" className="hover:text-white">首页</Link>
        <span className="mx-2">/</span>
        <Link to="/courses" className="hover:text-white">课程</Link>
        <span className="mx-2">/</span>
        <span className="text-white/80">{course.title}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={course.difficulty} />
          {course.tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
        <h1 className="text-2xl font-bold text-white">{course.title}</h1>
        <p className="text-white/70">{course.summary}</p>
        <div className="flex flex-wrap gap-4 text-sm text-white/60">
          <span>{lessons.length} 讲义</span>
          <span>预计 {course.estimatedHours} 小时</span>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">课程进度</h2>
        <ProgressBar value={cp.percent} />
        <p className="mt-1 text-xs text-white/50">{cp.completed}/{cp.total} 讲义已完成</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">讲义列表</h2>
        <ol className="space-y-3">
          {lessons.map((lesson, idx) => {
            const status = progress[lesson!.id]?.status || "not-started";
            const statusLabel = status === "completed" ? "✓ 已完成" : status === "in-progress" ? "◐ 进行中" : "○ 未开始";
            return (
              <li key={lesson!.id} className="card-hover p-4 flex items-center gap-4">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <Link to={`/lessons/${lesson!.slug}`} className="text-sm font-medium text-white hover:underline">
                    {lesson!.title}
                  </Link>
                  <p className="text-xs text-white/50">{lesson!.estimatedMinutes} 分钟 · {statusLabel}</p>
                </div>
                <div className="flex gap-2">
                  {status === "not-started" && (
                    <button type="button" className="btn-ghost text-xs" onClick={() => setLessonStatus(lesson!.id, "in-progress")}>
                      开始
                    </button>
                  )}
                  {status === "in-progress" && (
                    <button type="button" className="btn-primary text-xs" onClick={() => setLessonStatus(lesson!.id, "completed")}>
                      完成
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </article>
  );
}
