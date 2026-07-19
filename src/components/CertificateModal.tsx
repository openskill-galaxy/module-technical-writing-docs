import { useState } from "react";

interface Props {
  moduleTitle: string;
  score?: number;
  onClose: () => void;
}

export default function CertificateModal({ moduleTitle, score = 100, onClose }: Props) {
  const [name, setName] = useState("OpenSkill 星河学员");
  const certId = `OSG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="card max-w-2xl w-full p-8 bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-950 border-2 border-amber-400/40 shadow-[0_0_50px_rgba(251,191,36,0.15)] relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white text-sm"
        >
          ✕
        </button>

        {/* Certificate Card Content */}
        <div id="certificate-print-area" className="border-4 border-amber-500/20 p-8 rounded-2xl text-center space-y-4 bg-slate-900/60 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 text-9xl opacity-5 pointer-events-none">🏆</div>

          <div className="text-4xl">🎓</div>
          <h2 className="text-xs font-bold text-amber-400 tracking-[0.3em] uppercase">
            OpenSkill Galaxy • 官方结业认证证书
          </h2>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">结 业 证 书</h1>

          <p className="text-xs text-white/60 pt-2">兹证明学员</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input text-center text-xl font-bold text-amber-300 bg-transparent border-b border-amber-400/30 max-w-xs mx-auto focus:border-amber-400"
          />

          <p className="text-sm text-white/80 leading-relaxed max-w-md mx-auto pt-2">
            已成功通关全套讲义课程并高分通过模拟考核：
            <br />
            <strong className="text-white text-base font-bold block mt-1">《{moduleTitle}》</strong>
          </p>

          <div className="pt-4 flex items-center justify-between border-t border-white/10 text-xs text-white/50 px-4">
            <div>
              <span className="block text-[10px] text-white/40">认证编号</span>
              <span className="font-mono text-amber-300/80">{certId}</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl">🏅</span>
              <span className="text-[10px] text-amber-400 font-bold">技能考核得分 {score} 分</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-white/40">颁发日期</span>
              <span>{dateStr}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => window.print()}
            type="button"
            className="btn-primary px-6 text-xs font-bold"
          >
            🖨️ 打印 / 保存 PDF 证书
          </button>
          <button
            onClick={onClose}
            type="button"
            className="btn-ghost text-xs"
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
}
