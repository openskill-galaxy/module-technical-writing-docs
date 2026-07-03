import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchResult } from "../types";
import { buildSearchEntries, createFuse, runSearch, typeLabel } from "../search/search";
import type { ModuleData } from "../data/loaders";

let cachedEntries: ReturnType<typeof buildSearchEntries> | null = null;
let cachedFuse: ReturnType<typeof createFuse> | null = null;

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 延迟加载搜索数据（首次聚焦或输入时）
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    if (!cachedEntries || !cachedFuse) {
      import("../data/loaders")
        .then(({ loadAll }) => loadAll())
        .then((data) => {
          if (cancelled) return;
          cachedEntries = buildSearchEntries({
            courses: data.courses,
            lessons: data.lessons,
            knowledgePoints: data.knowledgePoints,
            questions: data.questions,
            cases: data.cases,
            routes: data.routes,
            faqs: data.faqs,
            glossary: data.glossary,
          });
          cachedFuse = createFuse(cachedEntries);
          setResults(runSearch(cachedFuse, query, 8));
          setOpen(true);
        })
        .catch(() => {});
    } else {
      setResults(runSearch(cachedFuse, query, 8));
      setOpen(true);
    }
    return () => {
      cancelled = true;
    };
  }, [query]);

  function go(r: SearchResult) {
    setQuery("");
    setOpen(false);
    navigate(r.url);
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索课程、知识点、题目…"
        className="input"
        aria-label="搜索"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-40 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-white/10 bg-ink-900/95 backdrop-blur shadow-lg">
          {results.map((r) => (
            <li key={`${r.type}-${r.id}`}>
              <button
                type="button"
                onClick={() => go(r)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-white/10"
              >
                <span className="mt-0.5 rounded bg-brand-500/20 px-1.5 py-0.5 text-xs text-brand-100">
                  {typeLabel[r.type]}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm text-white">{r.title}</span>
                  <span className="block truncate text-xs text-white/50">{r.summary}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && results.length === 0 && (
        <div className="absolute z-40 mt-1 w-full rounded-lg border border-white/10 bg-ink-900/95 px-3 py-2 text-xs text-white/50">
          未找到匹配结果
        </div>
      )}
    </div>
  );
}

// 暴露给 SearchPage 复用同一份缓存
export function getSearchIndex(): { fuse: ReturnType<typeof createFuse> | null } {
  return { fuse: cachedFuse };
}

export function ensureIndex(data: ModuleData): ReturnType<typeof createFuse> {
  if (!cachedEntries || !cachedFuse) {
    cachedEntries = buildSearchEntries({
      courses: data.courses,
      lessons: data.lessons,
      knowledgePoints: data.knowledgePoints,
      questions: data.questions,
      cases: data.cases,
      routes: data.routes,
      faqs: data.faqs,
      glossary: data.glossary,
    });
    cachedFuse = createFuse(cachedEntries);
  }
  return cachedFuse;
}
