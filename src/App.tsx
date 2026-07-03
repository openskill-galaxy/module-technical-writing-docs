import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LessonPage from "./pages/LessonPage";
import KnowledgePointsPage from "./pages/KnowledgePointsPage";
import KnowledgePointDetailPage from "./pages/KnowledgePointDetailPage";
import QuestionBankPage from "./pages/QuestionBankPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import ExamsPage from "./pages/ExamsPage";
import ExamPage from "./pages/ExamPage";
import ExamResultPage from "./pages/ExamResultPage";
import WrongQuestionsPage from "./pages/WrongQuestionsPage";
import FavoritesPage from "./pages/FavoritesPage";
import CasesPage from "./pages/CasesPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import SearchPage from "./pages/SearchPage";
import FaqPage from "./pages/FaqPage";
import AboutPage from "./pages/AboutPage";
import RoutesPage from "./pages/RoutesPage";
import { loadAll, type ModuleData } from "./data/loaders";
import { useProgressStore } from "./store/useProgressStore";

export default function App() {
  const [data, setData] = useState<ModuleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hydrate = useProgressStore((s) => s.hydrate);

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
        <p className="text-rose-300">数据加载失败：{error}</p>
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
      <Layout data={data}>
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
      </Layout>
    </BrowserRouter>
  );
}
