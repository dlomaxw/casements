import { getSiteContent } from '@/lib/content';

export default async function StatsStrip() {
  const c = await getSiteContent();
  const stats = [1, 2, 3, 4].map((i) => ({
    value: c(`home.stat${i}.value`),
    label: c(`home.stat${i}.label`),
  }));

  return (
    <div className="relative z-10 -mt-14 sm:-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-brand-100 bg-brand-100 shadow-xl shadow-black/10 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white px-6 py-7 text-center sm:px-8">
              <p className="font-display text-3xl font-extrabold text-brand-500 sm:text-4xl">{stat.value}</p>
              <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-steel-800/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
