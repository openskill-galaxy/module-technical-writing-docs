import { useState, useRef } from "react";

export default function CodePlayground({
  initialCode,
  language,
}: {
  initialCode: string;
  language: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [showSandbox, setShowSandbox] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const isExecutable =
    ["javascript", "typescript", "js", "ts", "html", "xml"].includes(
      language.toLowerCase()
    );

  const runCode = () => {
    setShowSandbox(true);
    // Let state update to render the iframe before writing
    setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      let htmlContent = "";
      const lang = language.toLowerCase();

      if (lang === "html" || lang === "xml") {
        htmlContent = code;
      } else {
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  background-color: #090a0f;
                  color: #e2e8f0;
                  padding: 16px;
                  margin: 0;
                  font-size: 13px;
                  line-height: 1.5;
                }
                h4 {
                  margin: 0 0 12px 0;
                  color: #64748b;
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                }
                pre {
                  background: #02040a;
                  padding: 12px;
                  border-radius: 8px;
                  color: #38bdf8;
                  font-family: SFMono-Regular, Consolas, Monaco, monospace;
                  margin: 0 0 8px 0;
                  border: 1px solid rgba(255, 255, 255, 0.05);
                  white-space: pre-wrap;
                  word-break: break-all;
                }
                .error {
                  color: #f43f5e;
                  border-color: rgba(244, 63, 94, 0.15);
                  background: rgba(244, 63, 94, 0.03);
                }
              </style>
            </head>
            <body>
              <h4>💻 控制台输出 (Console Output)</h4>
              <div id="output"></div>
              <script>
                const outputDiv = document.getElementById('output');
                const log = (...args) => {
                  const pre = document.createElement('pre');
                  pre.textContent = args.map(arg => {
                    if (typeof arg === 'object') {
                      try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
                    }
                    return String(arg);
                  }).join(' ');
                  outputDiv.appendChild(pre);
                };
                console.log = log;
                console.info = log;
                console.warn = log;
                console.error = (err) => {
                  const pre = document.createElement('pre');
                  pre.className = 'error';
                  pre.textContent = String(err);
                  outputDiv.appendChild(pre);
                };
                try {
                  ${code}
                } catch (err) {
                  console.error("运行时错误: " + err.message);
                }
              </script>
            </body>
          </html>
        `;
      }

      doc.open();
      doc.write(htmlContent);
      doc.close();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = code.substring(0, start) + "  " + code.substring(end);
      setCode(newValue);
      
      // Reset selection positions
      const target = e.currentTarget;
      setTimeout(() => {
        if (target) {
          target.selectionStart = target.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  if (!isExecutable) return null;

  return (
    <div className="mt-4 rounded-2xl border border-white/[0.06] bg-slate-950/20 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-slate-950/40 px-4 py-2.5">
        <span className="text-xs font-semibold text-white/50 tracking-wider">
          🛠️ 交互式代码演练沙箱 ({language.toUpperCase()})
        </span>
        <div className="flex gap-2">
          {showSandbox && (
            <button
              onClick={() => setShowSandbox(false)}
              className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] text-white/60 hover:text-white transition"
              type="button"
            >
              关闭控制台
            </button>
          )}
          <button
            onClick={runCode}
            className="btn-primary !px-3 !py-1 text-[10px] font-bold"
            type="button"
          >
            运行代码 ▶
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/[0.06] h-[240px]">
        {/* Editor */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-4 bg-slate-950/40 text-xs text-brand-100 font-mono focus:outline-none resize-none leading-relaxed"
          style={{ fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace' }}
        />

        {/* Sandbox Screen */}
        {showSandbox && (
          <iframe
            ref={iframeRef}
            title="Code Sandbox Output"
            className="flex-1 bg-slate-950/60 h-full border-0"
            sandbox="allow-scripts"
          />
        )}
      </div>
    </div>
  );
}
