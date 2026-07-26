import { useParams } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import QuestionPlayer from "../components/QuestionPlayer";
import { useSEO } from "../hooks/useSEO";

export default function QuestionDetailPage({
  data,
  practice = false,
}: {
  data: ModuleData;
  practice?: boolean;
}) {
  const { slug } = useParams<{ slug: string }>();
  const question = data.questions.find((q) => q.slug === slug);

  useSEO({
    title: question
      ? `${question.stem.slice(0, 24)} · ${data.module.title}`
      : data.module.title,
  });

  if (!question) {
    return <p className="text-white/70">未找到题目：{slug}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">
        {practice ? "练习模式" : "题目详情"}
      </h1>
      {/* 单题浏览与练习均为即时判分模式：非即时路径缺少 onFinish 收尾，属死路径，故统一使用即时模式 */}
      <QuestionPlayer questions={[question]} />
    </div>
  );
}
