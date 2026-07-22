import { useEffect } from "react";

interface Props {
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const shortcuts = [
    { key: "A / B / C / D", label: "快速选择答题选项", scope: "刷题模式" },
    { key: "1 / 2 / 3 / 4", label: "按序号快速勾选选项", scope: "刷题模式" },
    { key: "Enter", label: "提交答案 / 评估跳转下一题", scope: "刷题模式" },
    { key: "Tab", label: "代码编辑器缩进（插入双空格）", scope: "在线 Sandboxes Console" },
    { key: "Esc", label: "快速关闭全局浮窗与弹窗", scope: "全站 Modal" },
    { key: "Shift + ?", label: "随时打开快捷键指南浮窗", scope: "全局页面" },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card max-w-md w-full p-6 space-y-6 border border-cyan-500/30 bg-slate-950 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-white/50 hover:text-white text-lg font-mono"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="text-2xl">⌨️</span>
          <div>
            <h2 className="text-lg font-bold text-white">全站键盘快捷键指南</h2>
            <p className="text-xs text-white/50">支持键盘原生理智加速，打造极致顺滑操控体验</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-white">{item.label}</p>
                <p className="text-[10px] text-white/40">{item.scope}</p>
              </div>
              <kbd className="px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-md shrink-0">
                {item.key}
              </kbd>
            </div>
          ))}
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
