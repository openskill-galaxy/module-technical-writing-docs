import { useEffect, useState } from "react";

export interface TOCItem {
  id: string;
  level: number;
  text: string;
}

interface Props {
  content: string;
}

export function parseHeadings(markdown: string): TOCItem[] {
  const lines = markdown.split("\n");
  const items: TOCItem[] = [];
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`]/g, "").trim();
      const id = `heading-${index}-${text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, "-")}`;
      items.push({ id, level, text });
    }
  });
  return items;
}

export default function LessonTOC({ content }: Props) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    setHeadings(parseHeadings(content));
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  function scrollToHeading(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);
    }
  }

  return (
    <aside className="sticky top-24 hidden lg:block w-64 shrink-0 self-start space-y-3">
      <div className="card p-4 border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-xl">
        <h4 className="text-xs font-bold text-white tracking-wider mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
          <span>📜</span> 讲义目录导航
        </h4>
        <nav className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            const indentClass = h.level === 1 ? "font-bold pl-0" : h.level === 2 ? "pl-3 text-white/70" : "pl-6 text-white/50";
            return (
              <button
                key={h.id}
                onClick={() => scrollToHeading(h.id)}
                type="button"
                className={`w-full text-left text-xs transition duration-200 block truncate py-1 rounded-md ${indentClass} ${
                  isActive
                    ? "text-brand-300 font-semibold bg-brand-500/10 border-l-2 border-brand-400 pl-2"
                    : "hover:text-white hover:bg-white/[0.02]"
                }`}
                title={h.text}
              >
                {h.text}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
