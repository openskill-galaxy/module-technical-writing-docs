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
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
      if (open && results.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
        } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
          e.preventDefault();
          go(results[selectedIndex]);
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, results, selectedIndex]);

  // Preload loader on focus
  function handleFocus() {
    if (!cachedEntries || !cachedFuse) {
      import("../data/loaders")
        .then(({ loadAll }) => loadAll())
        .then((data) => {
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
        })
        .catch(() => {});
    }
  }

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

  const typeColor: Record<SearchResult["type"], string> = {
    course: "bg-brand-500/10 text-brand-300 border-brand-500/20",
    lesson: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    knowledge: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    question: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    case: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    route: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    faq: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    glossary: "bg-teal-500/10 text-teal-300 border-teal-500/20",
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={handleFocus}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索课程、知识点、题目…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.02] pl-10 pr-16 py-2 text-sm text-white placeholder-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition duration-200"
          aria-label="搜索"
        />
        <span className="absolute left-3.5 text-white/30 text-xs">🔍</span>
        <span className="hidden sm:inline absolute right-3 text-[9px] font-bold text-white/20 border border-white/10 rounded px-1.5 py-0.5 pointer-events-none select-none bg-white/[0.01]">
          Ctrl+K
        </span>
      </div>
      {open && results.length > 0 && (
        <ul className="absolute right-0 z-40 mt-2 w-[320px] sm:w-[400px] rounded-2xl border border-white/[0.08] bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden p-1.5 space-y-0.5">
          {results.map((r, idx) => (
            <li key={`${r.type}-${r.id}`}>
              <button
                type="button"
                onClick={() => go(r)}
                className={`flex w-full items-start gap-3 rounded-xl px-3.5 py-2.5 text-left active:scale-[0.99] transition-all duration-150 ${
                  selectedIndex === idx ? "bg-brand-500/20 border border-brand-500/30" : "hover:bg-white/[0.04]"
                }`}
              >
                <span className={`mt-0.5 shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${typeColor[r.type] || "bg-brand-500/10 text-brand-300"}`}>
                  {typeLabel[r.type]}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-white font-medium truncate">{r.title}</span>
                  <span className="block text-xs text-white/40 truncate mt-0.5">
                    {r.summary}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && results.length === 0 && (
        <div className="absolute right-0 z-40 mt-2 w-[320px] rounded-2xl border border-white/[0.08] bg-slate-950/95 p-4 text-xs text-white/40 shadow-2xl">
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
