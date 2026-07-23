import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";

export default function RoutesPage({ data }: { data: ModuleData }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">学习路线</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/60">推荐的系统化进阶学习次序</p>
      </header>

      {data.routes.length === 0 ? (
        <p className="text-slate-600 dark:text-white/60">暂无学习路线。</p>
      ) : (
        <div className="space-y-6">
          {data.routes.map((r) => (
            <section key={r.id} id={r.slug} className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{r.title}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-white/70 leading-relaxed">{r.summary}</p>
              <ol className="mt-4 space-y-4">
                {r.steps.map((step) => (
                  <li key={step.order} className="flex items-start gap-3.5">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white shadow-sm">
                      {step.order}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</p>
                      <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5 leading-relaxed">{step.description}</p>
                      <div className="mt-1.5 flex flex-wrap gap-3">
                        {step.courseId && (
                          <Link
                            to={`/courses/${data.courses.find((c) => c.id === step.courseId)?.slug || ""}`}
                            className="text-xs font-medium text-brand-600 dark:text-brand-300 hover:underline"
                          >
                            📖 关联课程 →
                          </Link>
                        )}
                        {step.lessonId && (
                          <Link
                            to={`/lessons/${data.lessons.find((l) => l.id === step.lessonId)?.slug || ""}`}
                            className="text-xs font-medium text-brand-600 dark:text-brand-300 hover:underline"
                          >
                            📝 关联讲义 →
                          </Link>
                        )}
                        {step.knowledgePointId && (
                          <Link
                            to={`/knowledge/${data.knowledgePoints.find((k) => k.id === step.knowledgePointId)?.slug || ""}`}
                            className="text-xs font-medium text-brand-600 dark:text-brand-300 hover:underline"
                          >
                            💡 关联知识点 →
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
