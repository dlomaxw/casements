'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ContentBlock } from '@/lib/content';
import ImageUploadField from './ImageUploadField';
import Icon from './Icon';

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export default function ContentEditor({
  blocks,
  values,
}: {
  blocks: ContentBlock[];
  values: Record<string, string>;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, string>>(values);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok?: string; err?: string }>({});

  const dirty = Object.keys(draft).filter((k) => draft[k] !== values[k]);

  const set = (key: string, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    if (dirty.length === 0) return;
    setSaving(true);
    setStatus({});
    const updates = Object.fromEntries(dirty.map((k) => [k, draft[k]]));
    const res = await fetch('/api/crm/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus({ ok: `Saved ${dirty.length} change${dirty.length > 1 ? 's' : ''}. The website is updated.` });
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setStatus({ err: d.error ?? 'Could not save changes.' });
    }
  };

  // Group blocks by page
  const pages = Array.from(new Set(blocks.map((b) => b.page)));
  const dirtyByPage = (page: string) => blocks.filter((b) => b.page === page && draft[b.key] !== values[b.key]).length;

  return (
    <div className="space-y-3 pb-24">
      {pages.map((page, idx) => {
        const pageDirty = dirtyByPage(page);
        return (
        <details key={page} open={idx === 0} className="group overflow-hidden rounded-xl border border-outline-variant bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between border-b border-transparent bg-surface-container-low px-6 py-4 group-open:border-outline-variant">
            <h2 className="flex items-center gap-2 font-work font-semibold text-industrial-blue">
              <Icon name="chevron_right" className="transition-transform group-open:rotate-90" />
              {page}
              {pageDirty > 0 && <span className="rounded-full bg-safety-orange/20 px-2 py-0.5 text-[10px] font-bold text-safety-orange">{pageDirty} edited</span>}
            </h2>
          </summary>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            {blocks.filter((b) => b.page === page).map((b) => {
              const changed = draft[b.key] !== values[b.key];
              return (
                <div key={b.key} className={b.type === 'textarea' || b.type === 'image' ? 'md:col-span-2' : ''}>
                  <label className="mb-1 flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                    {b.label}
                    {changed && <span className="rounded-full bg-safety-orange/20 px-1.5 py-0.5 text-[10px] font-bold text-safety-orange">edited</span>}
                  </label>
                  {b.type === 'image' ? (
                    <ImageUploadField label="" value={draft[b.key] ?? ''} onChange={(v) => set(b.key, v)} />
                  ) : b.type === 'textarea' ? (
                    <textarea value={draft[b.key] ?? ''} onChange={(e) => set(b.key, e.target.value)} rows={3} className={field} />
                  ) : (
                    <input value={draft[b.key] ?? ''} onChange={(e) => set(b.key, e.target.value)} className={field} />
                  )}
                </div>
              );
            })}
          </div>
        </details>
        );
      })}

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="font-mono text-xs text-on-surface-variant">
            {status.ok && <span className="text-primary">{status.ok}</span>}
            {status.err && <span className="text-error">{status.err}</span>}
            {!status.ok && !status.err && (dirty.length > 0 ? `${dirty.length} unsaved change${dirty.length > 1 ? 's' : ''}` : 'All changes saved')}
          </div>
          <button type="button" onClick={save} disabled={saving || dirty.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-40">
            <Icon name="save" className="text-[18px]" /> {saving ? 'Saving…' : 'Save & publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
