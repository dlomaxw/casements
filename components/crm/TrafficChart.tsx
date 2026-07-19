'use client';

import { useState } from 'react';

interface DayPoint { day: string; views: number; visitors: number }

// Single-series bar chart (page views over time).
// One hue — no categorical palette needed; title names the series so no legend.
const BAR = '#006b23'; // primary-container

export default function TrafficChart({ data }: { data: DayPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.views));
  // Recessive reference lines
  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));

  const fmt = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div>
      <div className="relative flex h-56 items-end gap-[2px] border-b border-l border-outline-variant/60 pl-2">
        {/* gridlines */}
        {ticks.map((t, i) => (
          <div key={i} aria-hidden className="pointer-events-none absolute inset-x-0" style={{ bottom: `${(t / max) * 100}%` }}>
            <div className="border-t border-dashed border-outline-variant/40" />
          </div>
        ))}

        {data.map((d, i) => {
          const h = (d.views / max) * 100;
          const isHover = hover === i;
          return (
            <div
              key={d.day}
              className="group relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className="w-full rounded-t transition-opacity"
                style={{
                  height: `${Math.max(h, d.views > 0 ? 2 : 0)}%`,
                  background: BAR,
                  opacity: isHover ? 1 : 0.85,
                }}
              />
              {isHover && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-lg border border-outline-variant bg-white px-3 py-2 shadow-lg">
                  <p className="font-mono text-[11px] font-semibold text-industrial-blue">{fmt(d.day)}</p>
                  <p className="font-mono text-[11px] text-on-surface-variant">{d.views} views · {d.visitors} visitors</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* sparse axis labels — never one per bar */}
      <div className="mt-2 flex justify-between pl-2 font-mono text-[10px] text-outline">
        <span>{data.length ? fmt(data[0].day) : ''}</span>
        <span>{data.length ? fmt(data[Math.floor(data.length / 2)].day) : ''}</span>
        <span>{data.length ? fmt(data[data.length - 1].day) : ''}</span>
      </div>
    </div>
  );
}
