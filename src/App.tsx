import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import { loadAll, type ModuleData } from "./data/loaders";
import { useProgressStore } from "./store/useProgressStore";

// 路由级代码分割：按页面懒加载，减小首屏体积
const HomePage = lazy(() => import("./pages/HomePage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage"));
const LessonPage = lazy(() => import("./pages/LessonPage"));
const KnowledgePointsPage = lazy(() => import("./pages/KnowledgePointsPage"));
const KnowledgePointDetailPage = lazy(() => import("./pages/KnowledgePointDetailPage"));
const QuestionBankPage = lazy(() => import("./pages/QuestionBankPage"));
const QuestionDetailPage = lazy(() => import("./pages/QuestionDetailPage"));
const ExamsPage = lazy(() => import("./pages/ExamsPage"));
const ExamPage = lazy(() => import("./pages/ExamPage"));
const ExamResultPage = lazy(() => import("./pages/ExamResultPage"));
const WrongQuestionsPage = lazy(() => import("./pages/WrongQuestionsPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const CasesPage = lazy(() => import("./pages/CasesPage"));
const CaseDetailPage = lazy(() => import("./pages/CaseDetailPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const RoutesPage = lazy(() => import("./pages/RoutesPage"));

// 模块级暂存深链目标：App 挂载早于 DeepLinkRedirector（数据加载完成后才挂载），
// 用变量而非事件传递，避免事件在监听器注册前被派发而丢失。
let pendingDeepLink: string | null = null;

function DeepLinkRedirector() {
  const navigate = useNavigate();
  useEffect(() => {
    if (pendingDeepLink) {
      const target = pendingDeepLink;
      pendingDeepLink = null;
      navigate(target, { replace: true });
    }
  }, [navigate]);
  return null;
}

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <span
        aria-label="页面加载中"
        className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent"
      />
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<ModuleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hydrate = useProgressStore((s) => s.hydrate);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetPage = params.get("page");
    if (targetPage) {
      window.history.replaceState({}, "", window.location.pathname + window.location.hash);
      pendingDeepLink = targetPage;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    hydrate();
    loadAll()
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  const basename = useMemo(() => {
    // 与 vite base 保持一致，用于 BrowserRouter
    const fromEnv = import.meta.env.BASE_URL || "/module-template/";
    return fromEnv.endsWith("/") ? fromEnv : fromEnv + "/";
  }, []);

  if (error) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-rose-600 dark:text-rose-300">数据加载失败：{error}</p>
        <p className="mt-2 text-white/50 text-sm">请检查 public/data/*.json 是否存在且格式正确。</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="container-page py-20 text-center text-white/60">加载中…</div>
    );
  }

  return (
    <BrowserRouter basename={basename}>
      <DeepLinkRedirector />
      <Layout data={data}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage data={data} />} />
            <Route path="/courses" element={<CoursesPage data={data} />} />
            <Route path="/courses/:slug" element={<CourseDetailPage data={data} />} />
            <Route path="/lessons/:slug" element={<LessonPage data={data} />} />
            <Route path="/knowledge" element={<KnowledgePointsPage data={data} />} />
            <Route path="/knowledge/:slug" element={<KnowledgePointDetailPage data={data} />} />
            <Route path="/questions" element={<QuestionBankPage data={data} />} />
            <Route path="/questions/:slug" element={<QuestionDetailPage data={data} />} />
            <Route path="/practice/:slug" element={<QuestionDetailPage data={data} practice />} />
            <Route path="/exams" element={<ExamsPage data={data} />} />
            <Route path="/exams/:slug" element={<ExamPage data={data} />} />
            <Route path="/exams/:slug/result" element={<ExamResultPage data={data} />} />
            <Route path="/wrong" element={<WrongQuestionsPage data={data} />} />
            <Route path="/favorites" element={<FavoritesPage data={data} />} />
            <Route path="/cases" element={<CasesPage data={data} />} />
            <Route path="/cases/:slug" element={<CaseDetailPage data={data} />} />
            <Route path="/routes" element={<RoutesPage data={data} />} />
            <Route path="/search" element={<SearchPage data={data} />} />
            <Route path="/faq" element={<FaqPage data={data} />} />
            <Route path="/about" element={<AboutPage data={data} />} />
            <Route path="*" element={<HomePage data={data} />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
