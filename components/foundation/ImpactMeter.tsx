'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The running total of people the foundation has reached.
 *
 * The number counts up and the bar fills when the meter scrolls into view. Both
 * come from the published outreach entries, so adding an entry in the CRM moves
 * the meter on its own — nobody has to edit a figure by hand.
 */
export default function ImpactMeter({
  label,
  value,
  goal,
  stats,
}: {
  label: string;
  value: number;
  /** Target the bar fills towards. Ignored when it is below the value. */
  goal: number;
  stats: { label: string; value: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);
  const [started, setStarted] = useState(false);

  // Once the goal is passed the bar stays full rather than overflowing.
  const target = Math.max(goal, 1);
  const pct = Math.min(100, Math.round((value / target) * 100));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect a reader who has asked for less motion: show the final figure.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started) return;
        setStarted(true);

        const DURATION = 1600;
        const start = performance.now();
        let frame = 0;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          // Ease out, so it races up then settles on the real number.
          setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, started]);

  return (
    <div ref={ref} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-brand-950 sm:text-xl">{label}</h2>
        <p className="font-display text-4xl font-extrabold leading-none text-brand-700 sm:text-5xl">
          {shown.toLocaleString('en-US')}
        </p>
      </div>

      {/* The bar itself */}
      <div
        className="mt-4 h-4 w-full overflow-hidden rounded-full bg-steel-100"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-700 to-accent-500 transition-[width] duration-[1600ms] ease-out"
          style={{ width: started ? `${pct}%` : '0%' }}
        />
      </div>
      <p className="mt-2 font-mono text-[11px] text-brand-800/60">
        {pct}% of our {target.toLocaleString('en-US')} target
      </p>

      {stats.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-brand-100 pt-5 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-brand-800/60">{s.label}</dt>
              <dd className="mt-0.5 font-display text-xl font-bold text-brand-950">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
