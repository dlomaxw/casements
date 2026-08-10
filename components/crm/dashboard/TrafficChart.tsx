import type { DayPoint } from '@/lib/analytics';

// Static SVG line chart — no client JS. Two series over the last N days.
const W = 460;
const H = 190;
const PAD = { top: 12, right: 8, bottom: 26, left: 30 };

function niceMax(n: number): number {
  if (n <= 4) return 4;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  return Math.ceil(n / mag) * mag;
}

export default function TrafficChart({ series }: { series: DayPoint[] }) {
  if (series.length === 0) {
    return <p className="py-10 text-center text-sm text-on-surface-variant">No traffic recorded yet.</p>;
  }

  const max = niceMax(Math.max(1, ...series.map((d) => d.views)));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const line = (key: 'views' | 'visitors') => series.map((d, i) => `${x(i)},${y(d[key])}`).join(' ');
  const area = `${PAD.left},${PAD.top + innerH} ${line('views')} ${x(series.length - 1)},${PAD.top + innerH}`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const labelEvery = Math.max(1, Math.ceil(series.length / 7));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 font-mono text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Page views</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-safety-orange" /> Unique visitors</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-[190px] w-full" role="img" aria-label="Website traffic over the last 30 days">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PAD.left - 6} y={y(t) + 3.5} textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="monospace">{t}</text>
          </g>
        ))}

        <polygon points={area} fill="#1f7a3d" opacity="0.08" />
        <polyline points={line('views')} fill="none" stroke="#1f7a3d" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={line('visitors')} fill="none" stroke="#f5b800" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {series.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={d.day} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="monospace">
              {new Date(d.day + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
