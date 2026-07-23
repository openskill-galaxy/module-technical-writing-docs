import type { ModuleData } from "../data/loaders";
import { useProgressStore } from "../store/useProgressStore";

export default function AboutPage({ data }: { data: ModuleData }) {
  const resetAll = useProgressStore((s) => s.resetAll);
  const m = data?.module || {} as any;

  return (
    <article className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">关于本模块</h1>
      </header>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{m.coverEmoji || "📘"}</span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{m.title || "OpenSkill 模块"}</h2>
            <p className="text-sm text-slate-600 dark:text-white/60">{m.subtitle || ""}</p>
          </div>
        </div>
        <p className="text-slate-700 dark:text-white/80 leading-relaxed">{m.description || ""}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="card p-3"><p className="text-slate-500 dark:text-white/50 text-xs">版本</p><p className="text-slate-900 dark:text-white font-semibold">{m.version || "v1.0.0"}</p></div>
          <div className="card p-3"><p className="text-slate-500 dark:text-white/50 text-xs">许可</p><p className="text-slate-900 dark:text-white font-semibold">{m.license || "MIT"}</p></div>
          <div className="card p-3"><p className="text-slate-500 dark:text-white/50 text-xs">预计时长</p><p className="text-slate-900 dark:text-white font-semibold">{m.estimatedHours || 12} 小时</p></div>
          <div className="card p-3"><p className="text-slate-500 dark:text-white/50 text-xs">更新日期</p><p className="text-slate-900 dark:text-white font-semibold">{m.updatedAt || new Date().toISOString().slice(0, 10)}</p></div>
        </div>
        <div className="card p-3">
          <p className="text-xs text-slate-500 dark:text-white/50">作者 / 贡献者</p>
          <p className="text-sm text-slate-900 dark:text-white font-medium">{Array.isArray(m.authors) ? m.authors.join("、") : "OpenSkill Community"}</p>
        </div>
        {Array.isArray(m.tags) && m.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {m.tags.map((t: string) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">数据统计</h2>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          <li className="card p-3 flex justify-between"><span className="text-slate-600 dark:text-white/60">课程</span><span className="text-slate-900 dark:text-white font-bold">{data.courses?.length || 0}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-slate-600 dark:text-white/60">讲义</span><span className="text-slate-900 dark:text-white font-bold">{data.lessons?.length || 0}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-slate-600 dark:text-white/60">知识点</span><span className="text-slate-900 dark:text-white font-bold">{data.knowledgePoints?.length || 0}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-slate-600 dark:text-white/60">题目</span><span className="text-slate-900 dark:text-white font-bold">{data.questions?.length || 0}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-slate-600 dark:text-white/60">考试</span><span className="text-slate-900 dark:text-white font-bold">{data.exams?.length || 0}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-slate-600 dark:text-white/60">案例</span><span className="text-slate-900 dark:text-white font-bold">{data.cases?.length || 0}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-slate-600 dark:text-white/60">学习路线</span><span className="text-slate-900 dark:text-white font-bold">{data.routes?.length || 0}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-slate-600 dark:text-white/60">术语</span><span className="text-slate-900 dark:text-white font-bold">{data.glossary?.length || 0}</span></li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">本地存储与隐私声明</h2>
        <p className="text-sm text-slate-600 dark:text-white/70 leading-relaxed">
          您的学习进度、双模设置、收藏清单、错题与考试记录完全加密保存在本地浏览器 localStorage 中，未经过允许不会上传服务器。
        </p>
        <button
          type="button"
          className="btn-danger text-xs px-4 py-2"
          onClick={() => {
            if (confirm("确定要清空所有本地进度、收藏、错题与考试记录吗？此操作不可恢复。")) {
              resetAll();
              alert("已成功清空本地数据。");
            }
          }}
        >
          🗑️ 清空本地数据记录
        </button>
      </section>

      <section className="space-y-2 text-sm text-slate-600 dark:text-white/60">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">导航链接</h2>
        {m.repoUrl && <p><a className="text-brand-600 dark:text-brand-300 hover:underline" href={m.repoUrl} target="_blank" rel="noreferrer">📂 模块 GitHub 源码仓库 →</a></p>}
        {m.portalUrl && <p><a className="text-brand-600 dark:text-brand-300 hover:underline" href={m.portalUrl} target="_blank" rel="noreferrer">🌐 返回 OpenSkill Galaxy 总入口站 →</a></p>}
      </section>
    </article>
  );
}
