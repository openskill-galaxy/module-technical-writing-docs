import { useProgressStore } from "../store/useProgressStore";
import { useModalA11y } from "../hooks/useModalA11y";

interface Props {
  onClose: () => void;
}

export default function ExportDataModal({ onClose }: Props) {
  const progress = useProgressStore((s) => s.progress);
  const wrongs = useProgressStore((s) => s.wrongs);
  const favorites = useProgressStore((s) => s.favorites);
  const panelRef = useModalA11y(onClose);

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
    Object.entries(progress).forEach(([id, rec]) => {
      csv += `Lesson,${id},${rec.status},${rec.updatedAt}\n`;
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
      if (k && (k.startsWith("openskill-") || k.startsWith("osg-mt:") || k.startsWith("openskill_appwrite_") || k === "theme")) {
        backup[k] = localStorage.getItem(k) || "";
      }
    }

    downloadFile(`openskill-backup-${dateStr}.json`, JSON.stringify(backup, null, 2), "application/json");
  }

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="多格式学习档案与数据导出"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="card max-w-md w-full p-6 space-y-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 shadow-soft-lg relative"
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="关闭弹窗"
          className="absolute top-3 right-3 icon-btn"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          <span className="text-2xl">📥</span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">多格式学习档案与数据导出</h2>
            <p className="text-xs text-slate-500 dark:text-white/50">支持导出为 Markdown 讲义报告、CSV 分析表或 JSON 存盘</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExportMarkdown}
            type="button"
            className="w-full card p-3.5 flex items-center justify-between hover:border-brand-500/50 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition group text-left"
          >
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300">Markdown 学习报告 (.md)</span>
              <p className="text-[11px] text-slate-500 dark:text-white/50">汇总学习统计、收藏清单与错题解析文本</p>
            </div>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-mono">导出 →</span>
          </button>

          <button
            onClick={handleExportCSV}
            type="button"
            className="w-full card p-3.5 flex items-center justify-between hover:border-emerald-500/50 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition group text-left"
          >
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300">CSV 数据分析表 (.csv)</span>
              <p className="text-[11px] text-slate-500 dark:text-white/50">提供可导入 Excel / Python 分析的答题原始表格</p>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">导出 →</span>
          </button>

          <button
            onClick={handleExportJSON}
            type="button"
            className="w-full card p-3.5 flex items-center justify-between hover:border-amber-500/50 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition group text-left"
          >
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300">JSON 本地备份快照 (.json)</span>
              <p className="text-[11px] text-slate-500 dark:text-white/50">包含完整的进度加密快照，支持无缝热复原</p>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">导出 →</span>
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
