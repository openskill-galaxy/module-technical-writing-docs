import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBox from "./SearchBox";
import PomodoroTimer from "./PomodoroTimer";
import type { ModuleMeta } from "../types";

function BackupModal({ onClose }: { onClose: () => void }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleExport = () => {
    try {
      const backup: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("openskill-") || key === "theme")) {
          const val = localStorage.getItem(key);
          if (val) backup[key] = val;
        }
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `openskill_galaxy_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e: any) {
      setError(e.message || "导出失败");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (typeof data !== "object" || data === null) {
          throw new Error("无效的备份文件格式");
        }
        Object.entries(data).forEach(([key, val]) => {
          if (key.startsWith("openskill-") || key === "theme") {
            localStorage.setItem(key, val as string);
          }
        });
        setSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err: any) {
        setError(err.message || "导入失败，文件格式有误");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="card w-[360px] p-6 relative border border-white/10 bg-slate-900/90 shadow-2xl flex flex-col gap-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white transition text-sm"
          type="button"
        >
          ✕
        </button>
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">📦 备份与同步</h3>
          <p className="text-xs text-white/40 mt-1">导出或恢复您在全站 60 个模块的完整学习进度与收藏夹数据</p>
        </div>

        {error && <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">{error}</div>}
        {success && <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">操作成功！页面即将重载...</div>}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleExport}
            className="btn-primary w-full text-xs font-semibold"
            type="button"
          >
            📥 导出进度备份 (.json)
          </button>
          
          <label className="btn-ghost w-full text-xs font-semibold text-center cursor-pointer block py-2.5">
            📤 导入进度备份 (.json)
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

import AppwriteModal from "./AppwriteModal";
import ExportDataModal from "./ExportDataModal";

export default function Header({ module }: { module: ModuleMeta }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  const [showBackup, setShowBackup] = useState(false);
  const [showAppwrite, setShowAppwrite] = useState(false);
  const [showExport, setShowExport] = useState(false);

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
          <PomodoroTimer />
          <button
            onClick={() => setShowAppwrite(true)}
            className="flex h-9 px-2 shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-white/70 hover:bg-white/5 hover:text-white transition duration-200"
            title="Appwrite 云端数据同步与认证"
            type="button"
          >
            ⚡ <span className="hidden sm:inline text-[10px] font-semibold">云同步</span>
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-sm text-white/70 hover:bg-white/5 hover:text-white transition duration-200"
            title="多格式学习档案与数据导出"
            type="button"
          >
            📥
          </button>
          <button
            onClick={() => setShowBackup(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-sm text-white/70 hover:bg-white/5 hover:text-white transition duration-200"
            title="本地 JSON 进度备份"
            type="button"
          >
            📦
          </button>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-sm text-white/70 hover:bg-white/5 hover:text-white transition duration-200"
            title={theme === 'dark' ? '切换至亮色模式' : '切换至暗色模式'}
            type="button"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      {showBackup && <BackupModal onClose={() => setShowBackup(false)} />}
      {showAppwrite && <AppwriteModal onClose={() => setShowAppwrite(false)} />}
      {showExport && <ExportDataModal onClose={() => setShowExport(false)} />}
    </header>
  );
}
