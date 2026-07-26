import { useParams } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import ExamPlayer from "../components/ExamPlayer";
import { getExamQuestions } from "../utils/exam";
import { useSEO } from "../hooks/useSEO";

export default function ExamPage({ data }: { data: ModuleData }) {
  const { slug } = useParams<{ slug: string }>();
  const exam = data.exams.find((e) => e.slug === slug);

  useSEO({
    title: exam ? `${exam.title} · ${data.module.title}` : data.module.title,
  });

  if (!exam) {
    return <p className="text-white/70">未找到考试：{slug}</p>;
  }

  const questions = getExamQuestions(exam, data.questions);
  return <ExamPlayer exam={exam} questions={questions} />;
}
