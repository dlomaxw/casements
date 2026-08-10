const COLOURS = ['#14572c', '#3b82f6', '#f5b800', '#a78bfa', '#6b7280', '#1f7a3d', '#e8622c', '#0ea5e9', '#84cc16'];

export interface Slice {
  label: string;
  count: number;
}

// Donut built from stroke-dasharray arcs — no chart library, no client JS.
export default function CategoryDonut({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((s, x) => s + x.count, 0);
  if (total === 0) {
    return <p className="py-10 text-center text-sm text-on-surface-variant">No leads categorised yet.</p>;
  }

  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0 -rotate-90" role="img" aria-label="Leads by product category">
        {slices.map((s, i) => {
          const len = (s.count / total) * C;
          const dash = <circle key={s.label} cx="80" cy="80" r={R} fill="none" stroke={COLOURS[i % COLOURS.length]}
            strokeWidth="22" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return dash;
        })}
      </svg>

      <ul className="w-full space-y-2">
        {slices.map((s, i) => (
          <li key={s.label} className="flex items-center gap-3 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLOURS[i % COLOURS.length] }} />
            <span className="flex-1 truncate text-on-surface">{s.label}</span>
            <span className="font-mono text-xs text-on-surface-variant">{s.count}</span>
            <span className="w-10 text-right font-mono text-xs font-semibold text-industrial-blue">
              {Math.round((s.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
