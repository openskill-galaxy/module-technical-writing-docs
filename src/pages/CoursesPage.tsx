import { useMemo, useState } from "react";
import type { ModuleData } from "../data/loaders";
import CourseCard from "../components/CourseCard";
import TagFilter from "../components/TagFilter";

export default function CoursesPage({ data }: { data: ModuleData }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return data.courses
      .filter((c) =>
        selectedTags.length === 0 || selectedTags.some((t) => c.tags.includes(t))
      )
      .filter((c) =>
        kw ? `${c.title} ${c.summary} ${c.tags.join(" ")}`.toLowerCase().includes(kw) : true
      )
      .sort((a, b) => a.order - b.order);
  }, [data.courses, selectedTags, keyword]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">课程列表</h1>
        <p className="mt-1 text-sm text-white/60">共 {data.courses.length} 门课程</p>
      </header>

      <TagFilter tags={data.tags} selected={selectedTags} onChange={setSelectedTags} />

      <input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="在本页过滤课程…"
        className="input"
      />

      {filtered.length === 0 ? (
        <p className="text-white/60">没有匹配的课程。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
