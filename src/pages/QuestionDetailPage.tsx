import { useParams } from "react-router-dom";
import type { ModuleData } from "../data/loaders";
import QuestionPlayer from "../components/QuestionPlayer";

export default function QuestionDetailPage({
  data,
  practice = false,
}: {
  data: ModuleData;
  practice?: boolean;
}) {
  const { slug } = useParams<{ slug: string }>();
  const question = data.questions.find((q) => q.slug === slug);

  if (!question) {
    return <p className="text-white/70">未找到题目：{slug}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">
        {practice ? "练习模式" : "题目详情"}
      </h1>
      <QuestionPlayer questions={[question]} instant={practice || true} />
    </div>
  );
}
