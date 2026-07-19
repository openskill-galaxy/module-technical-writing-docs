import { Link, useParams } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import { renderMarkdown } from "../utils/markdown";
import { useProgressStore } from "../store/useProgressStore";

import LessonTOC from "../components/LessonTOC";

export default function LessonPage({ data }: { data: ModuleData }) {
  const { slug } = useParams<{ slug: string }>();
  const progress = useProgressStore((s) => s.progress);
  const setLessonStatus = useProgressStore((s) => s.setLessonStatus);
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);
  const isFavorite = useProgressStore((s) => s.isFavorite);

  const lesson = data.lessons.find((l) => l.slug === slug);
  if (!lesson) {
    return (
      <div className="space-y-4">
        <p className="text-white/70">未找到讲义：{slug}</p>
        <Link className="btn-ghost" to="/courses">返回课程</Link>
      </div>
    );
  }

  const course = data.courses.find((c) => c.id === lesson.courseId);
  const status = progress[lesson.id]?.status || "not-started";
  const kps = lesson.knowledgePoints.map((id) => data.knowledgePoints.find((k) => k.id === id)).filter(Boolean);

  // 同课程上下讲义导航
  const siblings = course
    ? course.lessons.map((lid) => data.lessons.find((l) => l.id === lid)).filter(Boolean)
    : [];
  const curIdx = siblings.findIndex((l) => l!.id === lesson.id);
  const prev = curIdx > 0 ? siblings[curIdx - 1] : null;
  const next = curIdx < siblings.length - 1 ? siblings[curIdx + 1] : null;

  return (
    <article className="space-y-8">
      <nav className="text-sm text-white/50">
        <Link to="/" className="hover:text-white">首页</Link>
        <span className="mx-2">/</span>
        <Link to="/courses" className="hover:text-white">课程</Link>
        {course && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/courses/${course.slug}`} className="hover:text-white">{course.title}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-white/80">{lesson.title}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => toggleFavorite({ type: "lesson", id: lesson.id })}
          >
            {isFavorite("lesson", lesson.id) ? "★ 已收藏" : "☆ 收藏"}
          </button>
        </div>
        <p className="text-white/60">{lesson.summary}</p>
        <div className="flex flex-wrap gap-3 text-sm text-white/50">
          <span>预计 {lesson.estimatedMinutes} 分钟</span>
          <span>
            {status === "completed" ? "✓ 已完成" : status === "in-progress" ? "◐ 进行中" : "○ 未开始"}
          </span>
        </div>
        <div className="flex gap-2">
          {status === "not-started" && (
            <button type="button" className="btn-primary text-xs" onClick={() => setLessonStatus(lesson.id, "in-progress")}>
              开始学习
            </button>
          )}
          {status === "in-progress" && (
            <button type="button" className="btn-primary text-xs" onClick={() => setLessonStatus(lesson.id, "completed")}>
              标记完成
            </button>
          )}
        </div>
      </header>

      {/* Main Content & TOC Sidebar Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <section className="card p-6 flex-1 min-w-0 w-full">
          {renderMarkdown(lesson.contentMarkdown)}
        </section>
        <LessonTOC content={lesson.contentMarkdown} />
      </div>

      {kps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">相关知识点</h2>
          <div className="flex flex-wrap gap-2">
            {kps.map((kp) => (
              <Link key={kp!.id} to={`/knowledge/${kp!.slug}`} className="tag hover:bg-brand-500/30 transition">
                {kp!.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        {prev ? (
          <Link to={`/lessons/${prev.slug}`} className="btn-ghost text-xs">← {prev.title}</Link>
        ) : <span />}
        {next ? (
          <Link to={`/lessons/${next.slug}`} className="btn-primary text-xs">{next.title} →</Link>
        ) : <span />}
      </div>
    </article>
  );
}
