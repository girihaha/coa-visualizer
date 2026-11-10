import { useId, type ReactElement } from 'react';

export interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: 'terminal' | 'process' | 'decision';
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  via?: [number, number][];
}

const SIZE = {
  terminal: { w: 124, h: 36 },
  process:  { w: 186, h: 44 },
  decision: { w: 156, h: 58 },
} as const;

interface Point {
  x: number;
  y: number;
}

function boundary(c: Point, toward: Point, hw: number, hh: number): Point {
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const tx = dx === 0 ? Infinity : hw / Math.abs(dx);
  const ty = dy === 0 ? Infinity : hh / Math.abs(dy);
  const t = Math.min(tx, ty);
  return { x: c.x + dx * t, y: c.y + dy * t };
}

function nodeShape(n: FlowNode, state: 'active' | 'visited' | 'idle') {
  const { w, h } = SIZE[n.kind];
  const hw = w / 2;
  const hh = h / 2;

  // Bright-mode: white bg, slate borders, indigo active
  const stroke =
    state === 'active'  ? '#4f46e5'  // indigo-600
    : state === 'visited' ? '#94a3b8' // slate-400
    : '#cbd5e1';                        // slate-300

  const fill =
    state === 'active'  ? '#eef2ff'  // indigo-50
    : state === 'visited' ? '#f8fafc' // slate-50
    : '#ffffff';

  const textFill =
    state === 'active'  ? '#3730a3'  // indigo-800
    : state === 'visited' ? '#64748b' // slate-500
    : '#374151';                        // gray-700

  const strokeWidth = state === 'active' ? 2 : 1.5;
  const extraCls = state === 'active' ? 'flow-active' : '';

  let shape: ReactElement;
  if (n.kind === 'decision') {
    const cut = 14;
    const pts = [
      [n.x - hw + cut, n.y - hh],
      [n.x + hw - cut, n.y - hh],
      [n.x + hw, n.y],
      [n.x + hw - cut, n.y + hh],
      [n.x - hw + cut, n.y + hh],
      [n.x - hw, n.y],
    ]
      .map((p) => p.join(','))
      .join(' ');
    shape = (
      <polygon
        points={pts}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={extraCls}
        style={{ transition: 'fill 400ms, stroke 400ms' }}
      />
    );
  } else {
    shape = (
      <rect
        x={n.x - hw}
        y={n.y - hh}
        width={w}
        height={h}
        rx={n.kind === 'terminal' ? 18 : 5}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={extraCls}
        style={{ transition: 'fill 400ms, stroke 400ms' }}
      />
    );
  }
  return (
    <g>
      {shape}
      <text
        x={n.x}
        y={n.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textFill}
        className="font-mono text-[11px]"
        fontSize={11}
        style={{ transition: 'fill 400ms' }}
      >
        {n.label}
      </text>
    </g>
  );
}

export function Flowchart({
  title,
  nodes,
  edges,
  active,
  visited,
  width,
  height,
}: {
  title: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  active: string[];
  visited: string[];
  width: number;
  height: number;
}) {
  const markerId = useId();
  const markerActiveId = `${markerId}-active`;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const activeLabels = nodes.filter((n) => active.includes(n.id)).map((n) => n.label);

  return (
    <figure className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={title}
          className="h-auto w-full max-w-3xl mx-auto"
        >
          <defs>
            {/* Normal arrow */}
            <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
            </marker>
            {/* Active arrow */}
            <marker id={markerActiveId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#4f46e5" />
            </marker>
          </defs>

          {edges.map((e, i) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            const sa = SIZE[a.kind];
            const sb = SIZE[b.kind];
            const ca = { x: a.x, y: a.y };
            const cb = { x: b.x, y: b.y };
            const via = e.via ?? [];
            const first = via[0] ? { x: via[0][0], y: via[0][1] } : cb;
            const last = via.length ? { x: via[via.length - 1][0], y: via[via.length - 1][1] } : ca;
            const start = boundary(ca, first, sa.w / 2, sa.h / 2);
            const end = boundary(cb, last, sb.w / 2, sb.h / 2);
            const pts = [start, ...via.map(([x, y]) => ({ x, y })), end];
            const d = pts.map((p, k) => `${k === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
            const onPath =
              visited.includes(e.from) && (active.includes(e.to) || visited.includes(e.to));
            const lx = (pts[0].x + pts[1].x) / 2 + 6;
            const ly = (pts[0].y + pts[1].y) / 2 - 6;
            const edgeColor = onPath ? '#6366f1' : '#cbd5e1';
            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke={edgeColor}
                  strokeWidth={onPath ? 1.75 : 1.25}
                  markerEnd={`url(#${onPath ? markerActiveId : markerId})`}
                  style={{ transition: 'stroke 400ms' }}
                />
                {e.label && (
                  <text x={lx} y={ly} fill="#64748b" fontSize={10} className="font-mono">
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {nodes.map((n) => {
            const state = active.includes(n.id) ? 'active' : visited.includes(n.id) ? 'visited' : 'idle';
            return <g key={n.id}>{nodeShape(n, state)}</g>;
          })}
        </svg>
      </div>
      <figcaption className="sr-only">
        {activeLabels.length
          ? `Current flowchart step: ${activeLabels.join(', ')}`
          : 'No flowchart step is active.'}
      </figcaption>
    </figure>
  );
}
