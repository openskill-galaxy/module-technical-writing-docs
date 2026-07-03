import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";

export default function RoutesPage({ data }: { data: ModuleData }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">学习路线</h1>
        <p className="mt-1 text-sm text-white/60">推荐的系统化学习顺序</p>
      </header>

      {data.routes.length === 0 ? (
        <p className="text-white/60">暂无学习路线。</p>
      ) : (
        <div className="space-y-6">
          {data.routes.map((r) => (
            <section key={r.id} id={r.slug} className="card p-6">
              <h2 className="text-lg font-semibold text-white">{r.title}</h2>
              <p className="mt-1 text-sm text-white/70">{r.summary}</p>
              <ol className="mt-4 space-y-3">
                {r.steps.map((step) => (
                  <li key={step.order} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
                      {step.order}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{step.title}</p>
                      <p className="text-xs text-white/60">{step.description}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {step.courseId && (
                          <Link
                            to={`/courses/${data.courses.find((c) => c.id === step.courseId)?.slug || ""}`}
                            className="text-xs text-brand-300 hover:underline"
                          >
                            课程 →
                          </Link>
                        )}
                        {step.lessonId && (
                          <Link
                            to={`/lessons/${data.lessons.find((l) => l.id === step.lessonId)?.slug || ""}`}
                            className="text-xs text-brand-300 hover:underline"
                          >
                            讲义 →
                          </Link>
                        )}
                        {step.knowledgePointId && (
                          <Link
                            to={`/knowledge/${data.knowledgePoints.find((k) => k.id === step.knowledgePointId)?.slug || ""}`}
                            className="text-xs text-brand-300 hover:underline"
                          >
                            知识点 →
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
