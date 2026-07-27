import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import SearchBox from "./SearchBox";
import { useModalA11y } from "../hooks/useModalA11y";
import PomodoroTimer from "./PomodoroTimer";
import {
  IconMenu,
  IconX,
  IconSun,
  IconMoon,
  IconCloud,
  IconArchive,
  IconTrophy,
  IconKeyboard,
  IconDownload,
  colorFromId,
  monogram,
} from "./icons";
import type { ModuleMeta } from "../types";
import type { ModuleData } from "../data/loaders";

function BackupModal({ onClose }: { onClose: () => void }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useModalA11y(onClose);

  const handleExport = () => {
    try {
      const backup: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("openskill-") || key.startsWith("osg-mt:") || key.startsWith("openskill_appwrite_") || key === "theme")) {
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
          if (key.startsWith("openskill-") || key.startsWith("osg-mt:") || key.startsWith("openskill_appwrite_") || key === "theme") {
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="本地 JSON 备份与同步"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
    >
      <div ref={panelRef} className="card w-full max-w-sm p-6 relative border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 shadow-2xl flex flex-col gap-5">
        <button
          onClick={onClose}
          aria-label="关闭弹窗"
          className="absolute right-3 top-3 icon-btn"
          type="button"
        >
          ✕
        </button>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">备份与同步</h3>
          <p className="text-xs text-slate-500 dark:text-white/40 mt-1">导出或恢复您在全站 60 个模块的完整学习进度与收藏夹数据</p>
        </div>

        {error && <div className="text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">{error}</div>}
        {success && <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">操作成功！页面即将重载...</div>}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleExport}
            className="btn-primary w-full text-xs font-semibold"
            type="button"
          >导出进度备份 (.json)
          </button>
          
          <label className="btn-ghost w-full text-xs font-semibold text-center cursor-pointer block py-2.5">导入进度备份 (.json)
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
import AchievementsModal from "./AchievementsModal";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";

const mobileNavGroups = [
  {
    title: "学习",
    items: [
      { to: "/", label: "首页", end: true },
      { to: "/courses", label: "课程列表" },
      { to: "/knowledge", label: "知识点库" },
      { to: "/routes", label: "学习路线", end: true },
      { to: "/cases", label: "案例训练" },
    ],
  },
  {
    title: "练习",
    items: [
      { to: "/questions", label: "题库练习" },
      { to: "/exams", label: "模拟考试" },
      { to: "/wrong", label: "错题本" },
      { to: "/favorites", label: "收藏夹" },
    ],
  },
  {
    title: "其它",
    items: [
      { to: "/search", label: "搜索", end: true },
      { to: "/faq", label: "FAQ", end: true },
      { to: "/about", label: "关于本模块", end: true },
    ],
  },
];

export default function Header({ module, data }: { module: ModuleMeta; data: ModuleData }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [showBackup, setShowBackup] = useState(false);
  const [showAppwrite, setShowAppwrite] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, []);

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
    <header className="sticky top-0 z-30 border-b border-line bg-page backdrop-blur-xl">
      <div className="container-page flex h-16 items-center gap-3">
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="打开移动导航菜单"
          type="button"
          className="md:hidden icon-btn"
        >
          {showMobileMenu ? <IconX size={17} /> : <IconMenu size={17} />}
        </button>

        <Link to="/" className="flex items-center gap-2.5 font-bold transition hover:opacity-90 min-w-0">
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
            style={{ background: colorFromId(module.slug).soft, color: colorFromId(module.slug).fg }}
          >
            {monogram(module.title)}
          </span>
          <span className="text-body tracking-tight text-sm font-bold truncate max-w-[130px] sm:max-w-none">{module.title}</span>
          <span className="hidden sm:inline rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-subtle">
            v{module.version}
          </span>
        </Link>
        
        <a
          href={module.portalUrl || "https://openskill-galaxy.github.io/"}
          className="hidden lg:inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-body transition duration-200"
        >
          ← 返回总站
        </a>
        
        <div className="ml-auto flex items-center gap-2 w-full max-w-sm justify-end">
          <div className="w-full max-w-[180px] sm:max-w-xs">
            <SearchBox data={data} />
          </div>
          <PomodoroTimer />
          <button
            onClick={() => setShowAppwrite(true)}
            className="icon-btn"
            title="Appwrite 云端数据同步与认证"
            aria-label="Appwrite 云端同步"
            type="button"
          >
            <IconCloud size={17} />
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="icon-btn hidden sm:inline-flex"
            title="多格式学习档案与数据导出"
            aria-label="多格式数据导出"
            type="button"
          >
            <IconDownload size={17} />
          </button>
          <button
            onClick={() => setShowBackup(true)}
            className="icon-btn hidden sm:inline-flex"
            title="本地 JSON 进度备份"
            aria-label="本地 JSON 备份"
            type="button"
          >
            <IconArchive size={17} />
          </button>
          <button
            onClick={() => setShowAchievements(true)}
            className="icon-btn"
            title="游戏化成就勋章墙"
            aria-label="成就勋章墙"
            type="button"
          >
            <IconTrophy size={17} />
          </button>
          <button
            onClick={() => setShowShortcuts(true)}
            className="icon-btn hidden sm:inline-flex"
            title="全站键盘快捷键指南 (Shift+?)"
            aria-label="键盘快捷键指南"
            type="button"
          >
            <IconKeyboard size={17} />
          </button>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="icon-btn"
            title={theme === 'dark' ? '切换至亮色模式' : '切换至暗色模式'}
            aria-label="切换主题模式"
            type="button"
          >
            {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl animate-fade-in px-4 py-4 space-y-4">
          {mobileNavGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-white/40 px-2 tracking-wider">
                {group.title}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setShowMobileMenu(false)}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-brand-600 text-white shadow-sm"
                          : "text-slate-700 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
            <a
              href={module.portalUrl || "https://openskill-galaxy.github.io/"}
              className="text-brand-600 dark:text-brand-300 font-semibold"
            >
              ← 返回星河总入口站
            </a>
            <span className="text-slate-400 dark:text-white/40">v{module.version}</span>
          </div>
        </div>
      )}

      {showBackup && <BackupModal onClose={() => setShowBackup(false)} />}
      {showAppwrite && <AppwriteModal onClose={() => setShowAppwrite(false)} />}
      {showExport && <ExportDataModal onClose={() => setShowExport(false)} />}
      {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} />}
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </header>
  );
}
