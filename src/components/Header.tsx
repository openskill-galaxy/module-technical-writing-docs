import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBox from "./SearchBox";
import type { ModuleMeta } from "../types";

export default function Header({ module }: { module: ModuleMeta }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-slate-950/40 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-3 font-bold transition hover:opacity-90">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-600/20 text-base">
            {module.coverEmoji || "📘"}
          </span>
          <span className="text-white tracking-wide text-sm font-semibold truncate max-w-[160px] sm:max-w-none">{module.title}</span>
          <span className="hidden sm:inline rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/50">
            v{module.version}
          </span>
        </Link>
        
        <a
          href={module.portalUrl || "https://openskill-galaxy.github.io/"}
          className="hidden md:inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition duration-200"
        >
          ← 返回总站
        </a>
        
        <div className="ml-auto flex items-center gap-3 w-full max-w-sm justify-end">
          <div className="w-full max-w-xs">
            <SearchBox />
          </div>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-sm text-white/70 hover:bg-white/5 hover:text-white transition duration-200"
            title={theme === 'dark' ? '切换至亮色模式' : '切换至暗色模式'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
