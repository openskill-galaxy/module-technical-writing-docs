import { useState } from "react";
import { Link } from "react-router-dom";
import type { ModuleData } from "../data/loaders";

interface Props {
  data: ModuleData;
}

interface NodeItem {
  id: string;
  type: "course" | "lesson";
  label: string;
  x: number;
  y: number;
  slug?: string;
  summary?: string;
}

export default function KnowledgeGraph({ data }: Props) {
  const [hoveredNode, setHoveredNode] = useState<NodeItem | null>(null);

  const width = 800;
  const height = 340;

  const courses = data.courses || [];
  const lessons = data.lessons || [];

  if (courses.length === 0) return null;

  // Calculate layout coordinates
  const nodes: NodeItem[] = [];
  const links: { x1: number; y1: number; x2: number; y2: number }[] = [];

  const courseSpacingX = width / (courses.length + 1);

  courses.forEach((course, cIdx) => {
    const cx = courseSpacingX * (cIdx + 1);
    const cy = 100;
    nodes.push({ id: course.id, type: "course", label: course.title, x: cx, y: cy });

    const courseLessons = lessons.filter((l) => l.courseId === course.id);
    const lessonCount = courseLessons.length;

    courseLessons.forEach((les, lIdx) => {
      const angle = (Math.PI / (lessonCount + 1)) * (lIdx + 1);
      const radius = 100;
      const lx = cx + Math.cos(angle - Math.PI / 2) * radius;
      const ly = cy + Math.sin(angle - Math.PI / 2) * radius + 50;

      nodes.push({
        id: les.id,
        type: "lesson",
        label: les.title,
        x: lx,
        y: ly,
        slug: les.slug,
        summary: les.summary,
      });

      links.push({ x1: cx, y1: cy, x2: lx, y2: ly });
    });
  });

  return (
    <div className="card p-5 relative overflow-hidden bg-slate-950/60 border-brand-500/20 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-2">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <span>🌌</span> 课程结构知识星图拓扑
        </h3>
        <span className="text-xs text-white/40">点击星轨节点直达讲义</span>
      </div>

      <div className="relative flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[800px] h-[340px]">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Connecting Links */}
          {links.map((lnk, idx) => (
            <line
              key={idx}
              x1={lnk.x1}
              y1={lnk.y1}
              x2={lnk.x2}
              y2={lnk.y2}
              stroke="url(#lineGrad)"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              className="animate-pulse"
            />
          ))}

          {/* Nodes */}
          {nodes.map((node) => {
            const isCourse = node.type === "course";
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer group"
              >
                {isCourse ? (
                  <>
                    <circle cx={node.x} cy={node.y} r="22" className="fill-brand-600/30 stroke-brand-400 stroke-2" />
                    <circle cx={node.x} cy={node.y} r="14" className="fill-indigo-500 shadow-lg" />
                    <text
                      x={node.x}
                      y={node.y - 30}
                      textAnchor="middle"
                      className="fill-white text-xs font-bold tracking-wider"
                    >
                      {node.label}
                    </text>
                  </>
                ) : (
                  <Link to={`/lessons/${node.slug}`}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="10"
                      className="fill-cyan-400/20 stroke-cyan-300 stroke-2 hover:fill-cyan-400 transition-all duration-300"
                    />
                    <circle cx={node.x} cy={node.y} r="4" className="fill-cyan-200" />
                    <text
                      x={node.x}
                      y={node.y + 20}
                      textAnchor="middle"
                      className="fill-white/70 text-[10px] group-hover:fill-cyan-200 transition font-medium"
                    >
                      {node.label.length > 10 ? `${node.label.slice(0, 10)}…` : node.label}
                    </text>
                  </Link>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredNode && (
          <div className="absolute top-4 right-4 bg-slate-900/90 border border-white/10 p-3 rounded-xl max-w-xs backdrop-blur-md shadow-2xl animate-fade-in pointer-events-none">
            <span className="text-[10px] font-semibold text-brand-300 uppercase tracking-widest block mb-1">
              {hoveredNode.type === "course" ? "📘 课程模块" : "📄 讲义节点"}
            </span>
            <h4 className="text-xs font-bold text-white">{hoveredNode.label}</h4>
            {hoveredNode.summary && (
              <p className="text-[11px] text-white/60 mt-1 leading-relaxed line-clamp-2">{hoveredNode.summary}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
