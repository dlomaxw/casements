import type { PriceGroup } from '@/lib/products-db';

// UGX has no minor unit in practice, so no decimals.
const ugx = new Intl.NumberFormat('en-UG', {
  style: 'currency',
  currency: 'UGX',
  maximumFractionDigits: 0,
});

export default function PriceTable({ groups }: { groups: PriceGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <div className="mt-4 space-y-6">
      {groups.map((g) => (
        <div key={g.group} className="overflow-hidden rounded-lg ring-1 ring-brand-100">
          <div className="flex flex-wrap items-baseline justify-between gap-2 bg-brand-50 px-5 py-3">
            <h4 className="font-display text-base font-bold text-brand-950">{g.group}</h4>
            {g.note && <span className="text-xs text-brand-800/70">{g.note}</span>}
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-brand-100">
              {g.items.map((item) => (
                <tr key={item.label}>
                  <th scope="row" className="px-5 py-3 text-left font-medium text-brand-900">
                    {item.label}
                  </th>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-brand-700">
                    {ugx.format(item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
