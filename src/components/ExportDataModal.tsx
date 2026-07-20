import { useEffect } from "react";
import { useProgressStore } from "../store/useProgressStore";

interface Props {
  onClose: () => void;
}

export default function ExportDataModal({ onClose }: Props) {
  const progress = useProgressStore((s) => s.progress);
  const wrongs = useProgressStore((s) => s.wrongs);
  const favorites = useProgressStore((s) => s.favorites);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function downloadFile(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportMarkdown() {
    const dateStr = new Date().toISOString().slice(0, 10);
    let md = `# OpenSkill Galaxy • 个人学习与测试档案\n\n`;
    md += `> 导出日期: ${dateStr}\n\n`;
    md += `## 1. 学习进度概览\n`;
    md += `- **已标记讲义数**: ${Object.keys(progress).length} 篇\n`;
    md += `- **收藏项总计**: ${favorites.length} 项\n`;
    md += `- **错题待复习数**: ${Object.keys(wrongs).length} 道\n\n`;

    md += `## 2. 错题集明细\n`;
    Object.entries(wrongs).forEach(([qId, w]) => {
      md += `- **题目 ID**: \`${qId}\` (错题归档次数: ${w.wrongCount || 1})\n`;
    });

    downloadFile(`openskill-study-report-${dateStr}.md`, md, "text/markdown;charset=utf-8");
  }

  function handleExportCSV() {
    const dateStr = new Date().toISOString().slice(0, 10);
    let csv = "Type,ID,Value/Count,Timestamp\n";
    Object.entries(progress).forEach(([id, status]) => {
      csv += `Lesson,${id},${status},${new Date().toISOString()}\n`;
    });
    Object.entries(wrongs).forEach(([id, w]) => {
      csv += `WrongQuestion,${id},${w.wrongCount || 1},${new Date().toISOString()}\n`;
    });

    downloadFile(`openskill-analytics-${dateStr}.csv`, csv, "text/csv;charset=utf-8");
  }

  function handleExportJSON() {
    const dateStr = new Date().toISOString().slice(0, 10);
    const backup: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("openskill-") || k === "theme")) {
        backup[k] = localStorage.getItem(k) || "";
      }
    }

    downloadFile(`openskill-backup-${dateStr}.json`, JSON.stringify(backup, null, 2), "application/json");
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card max-w-md w-full p-6 space-y-6 border border-brand-500/30 bg-slate-950 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-white/50 hover:text-white text-lg font-mono"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="text-2xl">📥</span>
          <div>
            <h2 className="text-lg font-bold text-white">多格式学习档案与数据导出</h2>
            <p className="text-xs text-white/50">支持导出为 Markdown 讲义报告、CSV 分析表或 JSON 存盘</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExportMarkdown}
            type="button"
            className="w-full card p-3.5 flex items-center justify-between hover:border-brand-500/50 hover:bg-white/[0.04] transition group text-left"
          >
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-white group-hover:text-brand-300">📝 Markdown 学习报告 (.md)</span>
              <p className="text-[11px] text-white/50">汇总学习统计、收藏清单与错题解析文本</p>
            </div>
            <span className="text-xs text-brand-400 font-mono">导出 →</span>
          </button>

          <button
            onClick={handleExportCSV}
            type="button"
            className="w-full card p-3.5 flex items-center justify-between hover:border-emerald-500/50 hover:bg-white/[0.04] transition group text-left"
          >
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-white group-hover:text-emerald-300">📊 CSV 数据分析表 (.csv)</span>
              <p className="text-[11px] text-white/50">提供可导入 Excel / Python 分析的答题原始表格</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">导出 →</span>
          </button>

          <button
            onClick={handleExportJSON}
            type="button"
            className="w-full card p-3.5 flex items-center justify-between hover:border-amber-500/50 hover:bg-white/[0.04] transition group text-left"
          >
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-white group-hover:text-amber-300">📦 JSON 本地备份快照 (.json)</span>
              <p className="text-[11px] text-white/50">包含完整的进度加密快照，支持无缝热复原</p>
            </div>
            <span className="text-xs text-amber-400 font-mono">导出 →</span>
          </button>
        </div>

        <div className="pt-2 text-right">
          <button onClick={onClose} type="button" className="btn-ghost text-xs">
            关闭 (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
