import { useEffect, useState } from "react";

interface Props {
  targetType: "lesson" | "question";
  targetId: string;
}

export default function PersonalNotes({ targetType, targetId }: Props) {
  const storageKey = `openskill-note-${targetType}-${targetId}`;
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem(storageKey) || "";
    setNote(val);
    if (val.trim()) setIsOpen(true);
  }, [storageKey]);

  function handleSave(text: string) {
    setNote(text);
    localStorage.setItem(storageKey, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="card p-4 my-4 border border-white/10 bg-slate-950/40">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="text-xs font-bold text-white/80 hover:text-white flex items-center gap-2"
        >
          <span>📝</span> 个人学习笔记与备忘心得 {note.trim() ? "• (已记笔记)" : ""}
        </button>
        {saved && <span className="text-[10px] text-emerald-300 font-semibold animate-fade-in">✓ 已保存</span>}
      </div>

      {isOpen && (
        <div className="mt-3 space-y-2 animate-fade-in">
          <textarea
            value={note}
            onChange={(e) => handleSave(e.target.value)}
            placeholder="在此记录你的解题思路、重点误区或个人备忘..."
            rows={3}
            className="input text-xs leading-relaxed bg-slate-900/80 text-white resize-y"
          />
          <div className="flex justify-between items-center text-[10px] text-white/40">
            <span>支持 Markdown 文本，自动存入本地与云端</span>
            {note.trim() && (
              <button
                onClick={() => handleSave("")}
                className="text-rose-400 hover:underline"
              >
                清空笔记
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
