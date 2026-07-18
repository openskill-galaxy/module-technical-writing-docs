// 极简 markdown 渲染器：支持标题、段落、列表、代码、引用、行内代码、加粗、链接
// 不引入外部库，避免 XSS 通过白名单转义处理
import React from "react";
import CodePlayground from "../components/CodePlayground";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string): string {
  let out = escapeHtml(s);
  // 行内代码 `code`
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // 加粗 **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // 链接 [text](url) — 仅允许 http/https
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" class="text-brand-300 hover:underline">$1</a>'
  );
  return out;
}

export function renderMarkdown(md: string): React.ReactNode {
  if (!md) return null;
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  const push = (node: React.ReactNode) => blocks.push(<React.Fragment key={key++}>{node}</React.Fragment>);

  while (i < lines.length) {
    const line = lines[i];

    // 代码块 ```
    if (line.trim().startsWith("```")) {
      const langMatch = line.trim().match(/^```([a-zA-Z0-9+#-]+)/);
      const lang = langMatch ? langMatch[1] : "";
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const rawCode = buf.join("\n");
      push(
        <>
          <pre>
            <code dangerouslySetInnerHTML={{ __html: escapeHtml(rawCode) }} />
          </pre>
          <CodePlayground initialCode={rawCode} language={lang} />
        </>
      );
      continue;
    }

    // 标题
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const content = inline(h[2]);
      if (level === 1) push(<h2 dangerouslySetInnerHTML={{ __html: content }} />);
      else if (level === 2) push(<h2 dangerouslySetInnerHTML={{ __html: content }} />);
      else push(<h3 dangerouslySetInnerHTML={{ __html: content }} />);
      i++;
      continue;
    }

    // 引用
    if (line.trim().startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      push(<blockquote dangerouslySetInnerHTML={{ __html: inline(buf.join(" ")) }} />);
      continue;
    }

    // 无序列表
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      push(
        <ul>
          {items.map((it, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ul>
      );
      continue;
    }

    // 有序列表
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      push(
        <ol>
          {items.map((it, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ol>
      );
      continue;
    }

    // 空行
    if (line.trim() === "") {
      i++;
      continue;
    }

    // 段落（连续非空行）
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("```")
    ) {
      buf.push(lines[i]);
      i++;
    }
    push(<p dangerouslySetInnerHTML={{ __html: inline(buf.join(" ")) }} />);
  }

  return <div className="prose-tight">{blocks}</div>;
}
