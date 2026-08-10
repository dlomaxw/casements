import Link from 'next/link';
import type { LeadStatus } from '@prisma/client';
import Icon from '../Icon';

const STAGES: { status: LeadStatus; label: string; icon: string; fill: string }[] = [
  { status: 'NEW', label: 'New', icon: 'add_circle', fill: '#14572c' },
  { status: 'CONTACTED', label: 'Contacted', icon: 'call', fill: '#1f7a3d' },
  { status: 'SITE_ASSESSED', label: 'Site Assessed', icon: 'location_on', fill: '#5aa870' },
  { status: 'QUOTED', label: 'Quoted', icon: 'description', fill: '#9ca3af' },
  { status: 'WON', label: 'Won', icon: 'emoji_events', fill: '#d1d5db' },
  { status: 'LOST', label: 'Lost', icon: 'cancel', fill: '#e8622c' },
];

// Chevron ribbon: each stage is an arrow whose width is fixed, colour fixed by stage.
export default function PipelineChevrons({ byStatus, total }: { byStatus: Record<LeadStatus, number>; total: number }) {
  const n = STAGES.length;
  const seg = 100 / n;
  const notch = 1.6; // chevron point depth, in viewBox units

  return (
    <div>
      <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
        {STAGES.map((s, i) => {
          const x0 = i * seg;
          const x1 = x0 + seg;
          const head = `${x1},0 ${x1 + notch},4 ${x1},8`;
          const tail = i === 0 ? `${x0},8 ${x0},0` : `${x0},8 ${x0 + notch},4 ${x0},0`;
          return <polygon key={s.status} points={`${head} ${tail}`} fill={s.fill} />;
        })}
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-y-5 sm:grid-cols-6">
        {STAGES.map((s) => (
          <Link key={s.status} href={`/crm/leads?status=${s.status}`} className="group flex flex-col items-center text-center">
            <Icon name={s.icon} className="text-on-surface-variant group-hover:text-safety-orange" />
            <p className="mt-1 font-mono text-[11px] text-on-surface-variant">{s.label}</p>
            <p className="mt-0.5 font-work text-xl font-bold text-industrial-blue">{byStatus[s.status] ?? 0}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-outline-variant pt-4">
        <span className="text-sm text-on-surface-variant">Total Leads in Pipeline</span>
        <span className="font-work text-lg font-bold text-industrial-blue">{total}</span>
      </div>
    </div>
  );
}
