import { useState } from "react";

export interface TestCase {
  input: string;
  expected: string;
}

interface Props {
  initialCode?: string;
  testCases?: TestCase[];
}

const DEFAULT_CODE = `// 请补全函数并返回正确结果
function solution(input) {
  return input.toUpperCase();
}`;

const DEFAULT_TESTS: TestCase[] = [
  { input: "hello", expected: "HELLO" },
  { input: "openskill", expected: "OPENSKILL" },
];

export default function CodeJudge({ initialCode, testCases }: Props) {
  const [code, setCode] = useState(initialCode || DEFAULT_CODE);
  const tests = testCases && testCases.length > 0 ? testCases : DEFAULT_TESTS;
  const [results, setResults] = useState<{ pass: boolean; actual: string; expected: string; input: string }[] | null>(null);
  const [running, setRunning] = useState(false);

  function runJudge() {
    setRunning(true);
    setResults(null);

    setTimeout(() => {
      try {
        const evalResults = tests.map((tc) => {
          let actualOutput = "";
          try {
            // Safe evaluation of solution function
            const fn = new Function("input", `${code}; if (typeof solution === 'function') return solution(input); return null;`);
            const res = fn(tc.input);
            actualOutput = typeof res === "object" ? JSON.stringify(res) : String(res);
          } catch (err: any) {
            actualOutput = `Error: ${err.message}`;
          }

          const pass = actualOutput.trim() === tc.expected.trim();
          return { pass, actual: actualOutput, expected: tc.expected, input: tc.input };
        });

        setResults(evalResults);
      } catch (e) {
        setResults([{ pass: false, actual: "Compilation Error", expected: "", input: "" }]);
      } finally {
        setRunning(false);
      }
    }, 300);
  }

  const allPassed = results ? results.every((r) => r.pass) : false;

  return (
    <div className="card p-5 border border-indigo-500/20 bg-slate-950/60 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
          <span>🧪</span> 编程算法实战 OJ 判题测试引擎
        </h3>
        <button
          onClick={runJudge}
          disabled={running}
          type="button"
          className="btn-primary !px-3 !py-1 text-xs font-bold shadow-lg"
        >
          {running ? "测试跑题中..." : "▶ 提交代码判题"}
        </button>
      </div>

      {/* Editor & Test cases Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-white/40 uppercase block">代码编辑器</span>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={8}
            className="input font-mono !text-xs bg-slate-900/90 text-brand-100 resize-y leading-relaxed"
            style={{ fontFamily: "SFMono-Regular, Consolas, Monaco, monospace" }}
          />
        </div>

        <div className="space-y-1 flex flex-col">
          <span className="text-[10px] font-semibold text-white/40 uppercase block">单元测试用例 (Unit Tests)</span>
          <div className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 p-3 space-y-2 overflow-y-auto max-h-[200px]">
            {tests.map((tc, idx) => (
              <div key={idx} className="text-xs border-b border-white/5 pb-1.5 last:border-0">
                <span className="text-white/40 font-mono">Test #{idx + 1}: </span>
                <span className="text-white/70">输入: </span>
                <code className="text-brand-200">{tc.input}</code>
                <span className="text-white/40 ml-2">→ 期望: </span>
                <code className="text-emerald-300">{tc.expected}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Judge Results Banner */}
      {results && (
        <div className={`p-4 rounded-xl border transition-all ${
          allPassed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            <span>{allPassed ? "🎉" : "❌"}</span>
            <span>{allPassed ? "全测试用例通过 (All Passed!)" : "测试未全部通过 (Tests Failed)"}</span>
          </div>

          <div className="mt-2 space-y-1.5 text-xs">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{r.pass ? "✓" : "✗"}</span>
                <span>用例 #{i + 1}: 实际输出 <code className="font-mono text-white">{r.actual}</code></span>
                {!r.pass && <span className="text-white/40">(期望: {r.expected})</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
