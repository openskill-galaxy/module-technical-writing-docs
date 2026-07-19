
export interface RadarDataPoint {
  label: string;
  score: number; // 0 - 100
}

interface Props {
  data: RadarDataPoint[];
  size?: number;
}

export default function RadarChart({ data, size = 300 }: Props) {
  const center = size / 2;
  const radius = size * 0.35;
  const total = data.length;

  if (total < 3) return null;

  function getCoordinates(index: number, valueRatio: number) {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = radius * valueRatio;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  }

  // Levels for background grid (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const valuePolygonPoints = data
    .map((d, i) => {
      const { x, y } = getCoordinates(i, Math.max(0, Math.min(100, d.score)) / 100);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="nodeGlow">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background Grid Polygons */}
        {levels.map((lvl, idx) => {
          const points = Array.from({ length: total })
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(" ");
          return (
            <polygon
              key={idx}
              points={points}
              className="fill-none stroke-white/10 stroke-[1]"
            />
          );
        })}

        {/* Spokes */}
        {Array.from({ length: total }).map((_, i) => {
          const { x, y } = getCoordinates(i, 1);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-white/10 stroke-[1]"
            />
          );
        })}

        {/* Score Data Polygon */}
        <polygon
          points={valuePolygonPoints}
          fill="url(#radarGradient)"
          className="stroke-indigo-400 stroke-[2] transition-all duration-500"
        />

        {/* Data Vertices */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(i, Math.max(0, Math.min(100, d.score)) / 100);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" className="fill-indigo-400 stroke-white stroke-2" />
              <circle cx={x} cy={y} r="10" className="fill-indigo-500/20 animate-ping" />
            </g>
          );
        })}

        {/* Labels & Values */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(i, 1.25);
          const scoreVal = Math.round(d.score);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white/80 text-[11px] font-semibold tracking-wider"
            >
              {d.label} <tspan className="fill-indigo-300 font-bold">{scoreVal}分</tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}
