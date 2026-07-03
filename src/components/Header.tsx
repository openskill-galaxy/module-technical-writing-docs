import { Link } from "react-router-dom";
import SearchBox from "./SearchBox";
import type { ModuleMeta } from "../types";

export default function Header({ module }: { module: ModuleMeta }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-900/80 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-lg">
            {module.coverEmoji || "📘"}
          </span>
          <span className="text-white">{module.title}</span>
          <span className="hidden sm:inline rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/60">
            v{module.version}
          </span>
        </Link>
        <div className="ml-auto w-full max-w-xs">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
