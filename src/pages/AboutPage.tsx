import type { ModuleData } from "../data/loaders";
import { useProgressStore } from "../store/useProgressStore";

export default function AboutPage({ data }: { data: ModuleData }) {
  const resetAll = useProgressStore((s) => s.resetAll);
  const m = data.module;

  return (
    <article className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold text-white">关于本模块</h1>
      </header>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{m.coverEmoji}</span>
          <div>
            <h2 className="text-xl font-semibold text-white">{m.title}</h2>
            <p className="text-sm text-white/60">{m.subtitle}</p>
          </div>
        </div>
        <p className="text-white/80">{m.description}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="card p-3"><p className="text-white/50 text-xs">版本</p><p className="text-white">{m.version}</p></div>
          <div className="card p-3"><p className="text-white/50 text-xs">许可</p><p className="text-white">{m.license}</p></div>
          <div className="card p-3"><p className="text-white/50 text-xs">预计时长</p><p className="text-white">{m.estimatedHours} 小时</p></div>
          <div className="card p-3"><p className="text-white/50 text-xs">更新日期</p><p className="text-white">{m.updatedAt}</p></div>
        </div>
        <div className="card p-3">
          <p className="text-xs text-white/50">作者</p>
          <p className="text-sm text-white">{m.authors.join("、") || "OpenSkill Community"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {m.tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">数据统计</h2>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          <li className="card p-3 flex justify-between"><span className="text-white/60">课程</span><span className="text-white">{data.courses.length}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-white/60">讲义</span><span className="text-white">{data.lessons.length}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-white/60">知识点</span><span className="text-white">{data.knowledgePoints.length}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-white/60">题目</span><span className="text-white">{data.questions.length}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-white/60">考试</span><span className="text-white">{data.exams.length}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-white/60">案例</span><span className="text-white">{data.cases.length}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-white/60">学习路线</span><span className="text-white">{data.routes.length}</span></li>
          <li className="card p-3 flex justify-between"><span className="text-white/60">术语</span><span className="text-white">{data.glossary.length}</span></li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">本地存储</h2>
        <p className="text-sm text-white/70">
          你的学习进度、收藏、错题、考试记录均保存在浏览器 localStorage 中，不会上传到任何服务器。
        </p>
        <button
          type="button"
          className="btn-danger"
          onClick={() => {
            if (confirm("确定要清空所有本地进度、收藏、错题与考试记录吗？此操作不可恢复。")) {
              resetAll();
              alert("已清空本地数据。");
            }
          }}
        >
          清空本地数据
        </button>
      </section>

      <section className="space-y-2 text-sm text-white/60">
        <h2 className="text-base font-semibold text-white">链接</h2>
        {m.repoUrl && <p><a className="text-brand-300 hover:underline" href={m.repoUrl} target="_blank" rel="noreferrer">模块仓库 →</a></p>}
        {m.portalUrl && <p><a className="text-brand-300 hover:underline" href={m.portalUrl} target="_blank" rel="noreferrer">返回 OpenSkill Galaxy 总入口站 →</a></p>}
      </section>
    </article>
  );
}
