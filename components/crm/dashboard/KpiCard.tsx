import Icon from '../Icon';

interface Props {
  icon: string;
  label: string;
  value: string;
  /** Small print under the value, e.g. "All time" or "0 today". */
  note?: string;
  /** Optional delta: positive renders green with ↑, negative red with ↓, 0 muted. */
  delta?: { value: number; suffix: string };
}

export default function KpiCard({ icon, label, value, note, delta }: Props) {
  const dir = delta ? Math.sign(delta.value) : 0;
  const deltaClass = dir > 0 ? 'text-primary' : dir < 0 ? 'text-error' : 'text-on-surface-variant';
  const arrow = dir > 0 ? '↑' : dir < 0 ? '↓' : '—';

  return (
    <div className="flex items-center gap-4 rounded-xl border border-outline-variant bg-white p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container/15 text-primary">
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-on-surface-variant">{label}</p>
        <p className="mt-0.5 font-work text-3xl font-bold leading-none text-industrial-blue">{value}</p>
        {delta ? (
          <p className={`mt-1.5 font-mono text-[11px] ${deltaClass}`}>
            {arrow} {Math.abs(delta.value).toLocaleString()} {delta.suffix}
          </p>
        ) : note ? (
          <p className="mt-1.5 font-mono text-[11px] text-on-surface-variant">{note}</p>
        ) : null}
      </div>
    </div>
  );
}
