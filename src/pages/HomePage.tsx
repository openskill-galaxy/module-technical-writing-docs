import { useState } from "react";
import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import { useProgressStore, lessonsOverall } from "../store/useProgressStore";
import ProgressBar from "../components/ProgressBar";
import DifficultyBadge from "../components/DifficultyBadge";
import KnowledgeGraph from "../components/KnowledgeGraph";
import CertificateModal from "../components/CertificateModal";
import StudyAnalytics from "../components/StudyAnalytics";

export default function HomePage({ data }: { data: ModuleData }) {
  const progress = useProgressStore((s) => s.progress);
  const overall = lessonsOverall(data.lessons, progress);
  const wrongCount = Object.keys(useProgressStore.getState().wrongs).length;
  const favCount = useProgressStore((s) => s.favorites).length;
  const [showCert, setShowCert] = useState(false);

  return (
    <div className="space-y-10">
      <section className="text-center py-8">
        <div className="text-5xl">{data.module.coverEmoji}</div>
        <h1 className="mt-3 text-3xl font-bold text-white">{data.module.title}</h1>
        <p className="mt-2 text-white/60">{data.module.subtitle}</p>
        <p className="mt-1 text-sm text-white/50 max-w-2xl mx-auto">{data.module.description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link className="btn-primary" to="/courses">开始学习</Link>
          <Link className="btn-ghost" to="/questions">题库练习</Link>
          <button onClick={() => setShowCert(true)} className="btn-ghost text-amber-300 border-amber-500/30" type="button">
            🎓 查看通关结业证书
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">学习进度</h2>
          <button onClick={() => setShowCert(true)} className="text-xs text-amber-400 hover:underline">
            🎓 生成官方认证证书
          </button>
        </div>
        <ProgressBar value={overall.percent} />
        <p className="mt-1 text-xs text-white/50 mb-4">
          已完成 {overall.completed}/{overall.total} 讲义 · 预计总时长 {data.module.estimatedHours}h
        </p>
        <StudyAnalytics />
      </section>

      {showCert && (
        <CertificateModal
          moduleTitle={data.module.title}
          score={overall.percent === 100 ? 100 : Math.max(60, Math.round(overall.percent))}
          onClose={() => setShowCert(false)}
        />
      )}

      {/* Knowledge Node Topology Visualizer */}
      <KnowledgeGraph data={data} />

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">快速入口</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/courses" className="card-hover p-4 text-center">
            <div className="text-2xl">📚</div>
            <p className="mt-2 text-sm font-medium text-white">课程列表</p>
            <p className="text-xs text-white/50">{data.courses.length} 门课程</p>
          </Link>
          <Link to="/knowledge" className="card-hover p-4 text-center">
            <div className="text-2xl">💡</div>
            <p className="mt-2 text-sm font-medium text-white">知识点库</p>
            <p className="text-xs text-white/50">{data.knowledgePoints.length} 个知识点</p>
          </Link>
          <Link to="/questions" className="card-hover p-4 text-center">
            <div className="text-2xl">✏️</div>
            <p className="mt-2 text-sm font-medium text-white">题库练习</p>
            <p className="text-xs text-white/50">{data.questions.length} 道题</p>
          </Link>
          <Link to="/cases" className="card-hover p-4 text-center">
            <div className="text-2xl">🔧</div>
            <p className="mt-2 text-sm font-medium text-white">案例训练</p>
            <p className="text-xs text-white/50">{data.cases.length} 个案例</p>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">课程概览</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.courses.map((c) => (
            <Link key={c.id} to={`/courses/${c.slug}`} className="card-hover p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{c.title}</h3>
                <DifficultyBadge difficulty={c.difficulty} />
              </div>
              <p className="mt-1 text-xs text-white/60 line-clamp-2">{c.summary}</p>
              <p className="mt-2 text-xs text-white/40">{c.lessons.length} 讲义 · {c.estimatedHours}h</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">个人数据</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-rose-300">{wrongCount}</p>
            <p className="text-xs text-white/60">错题</p>
            <Link to="/wrong" className="mt-1 inline-block text-xs text-brand-300 hover:underline">查看错题本</Link>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-amber-300">{favCount}</p>
            <p className="text-xs text-white/60">收藏</p>
            <Link to="/favorites" className="mt-1 inline-block text-xs text-brand-300 hover:underline">查看收藏夹</Link>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-300">{useProgressStore((s) => s.exams).length}</p>
            <p className="text-xs text-white/60">考试记录</p>
            <Link to="/exams" className="mt-1 inline-block text-xs text-brand-300 hover:underline">查看考试</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
