'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploadField from './ImageUploadField';
import Icon from './Icon';
import { OUTREACH_CATEGORIES, OUTREACH_UNITS, type GalleryImage, type OutreachItem } from '@/lib/outreach';

interface OutreachData {
  id?: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  location: string;
  happenedOn: string; // yyyy-mm-dd
  peopleReached: number;
  items: OutreachItem[];
  image: string;
  gallery: GalleryImage[];
  published: boolean;
}

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant';

/**
 * Adding or editing one piece of outreach — a food distribution, a school
 * supported, a donation made.
 *
 * Whatever is entered under "What we gave" and "People reached" is added to the
 * running totals on the public page, so the meter moves as soon as this is
 * published. Nobody edits the headline figure by hand.
 */
export default function OutreachEditor({ initial }: { initial?: Partial<OutreachData> }) {
  const router = useRouter();
  const editing = Boolean(initial?.id);

  const [o, setO] = useState<OutreachData>({
    title: initial?.title ?? '',
    category: initial?.category ?? 'Food',
    summary: initial?.summary ?? '',
    body: initial?.body ?? '',
    location: initial?.location ?? '',
    happenedOn: initial?.happenedOn ?? new Date().toISOString().slice(0, 10),
    peopleReached: initial?.peopleReached ?? 0,
    items: initial?.items ?? [],
    image: initial?.image ?? '',
    gallery: initial?.gallery ?? [],
    published: initial?.published ?? true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof OutreachData>(k: K, v: OutreachData[K]) => setO((prev) => ({ ...prev, [k]: v }));

  // --- what we gave ---------------------------------------------------------
  const addItem = () => set('items', [...o.items, { item: '', quantity: 0, unit: 'kg' }]);
  const setItem = (i: number, patch: Partial<OutreachItem>) =>
    set('items', o.items.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const delItem = (i: number) => set('items', o.items.filter((_, idx) => idx !== i));

  // --- more photographs -----------------------------------------------------
  const addPhoto = () => set('gallery', [...o.gallery, { src: '', alt: '' }]);
  const setPhoto = (i: number, patch: Partial<GalleryImage>) =>
    set('gallery', o.gallery.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const delPhoto = (i: number) => set('gallery', o.gallery.filter((_, idx) => idx !== i));

  const save = async (published: boolean) => {
    setError('');
    if (!o.title || !o.summary || !o.body) {
      setError('A title, a short summary and the full story are all needed.');
      return;
    }
    if (!o.image) {
      setError('A main photograph is required.');
      return;
    }
    setSaving(true);
    const url = editing ? `/api/crm/outreach/${initial!.id}` : '/api/crm/outreach';
    const res = await fetch(url, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...o,
        peopleReached: Number(o.peopleReached) || 0,
        items: o.items.filter((i) => i.item.trim()),
        gallery: o.gallery.filter((g) => g.src),
        published,
      }),
    });
    setSaving(false);
    if (res.ok) {
      router.push('/crm/foundation');
      router.refresh();
      return;
    }
    const d = await res.json().catch(() => ({}));
    setError(d.error ?? 'Could not save this entry.');
  };

  const del = async () => {
    if (!editing || !confirm('Delete this outreach entry permanently? It will be removed from the website and from the totals.')) return;
    await fetch(`/api/crm/outreach/${initial!.id}`, { method: 'DELETE' });
    router.push('/crm/foundation');
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* What happened */}
        <div className="space-y-4 rounded-xl border border-outline-variant bg-white p-6">
          <h2 className="font-work font-semibold text-industrial-blue">What happened</h2>
          <div>
            <label className={label}>Title</label>
            <input value={o.title} onChange={(e) => set('title', e.target.value)} className={field}
              placeholder="Friday food distribution, Kisenyi" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>Type</label>
              <select value={o.category} onChange={(e) => set('category', e.target.value)} className={field}>
                {OUTREACH_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Date</label>
              <input type="date" value={o.happenedOn} onChange={(e) => set('happenedOn', e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>Place</label>
              <input value={o.location} onChange={(e) => set('location', e.target.value)} className={field}
                placeholder="Kisenyi, Kampala" />
            </div>
          </div>
          <div>
            <label className={label}>Short summary</label>
            <input value={o.summary} onChange={(e) => set('summary', e.target.value)} className={field}
              placeholder="Hot meals and dry food for 200 families." />
          </div>
          <div>
            <label className={label}>The full story</label>
            <textarea value={o.body} onChange={(e) => set('body', e.target.value)} rows={6} className={field}
              placeholder="Write it as you would tell it. Leave a blank line between paragraphs." />
          </div>
        </div>

        {/* What we gave — this feeds the totals */}
        <div className="rounded-xl border border-outline-variant bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-work font-semibold text-industrial-blue">What we gave</h2>
              <p className="mt-1 font-mono text-[11px] text-on-surface-variant">
                Each line is added to the running totals on the website.
              </p>
            </div>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 font-mono text-[11px] font-medium text-industrial-blue hover:border-safety-orange">
              <Icon name="add" className="text-[16px]" /> Add item
            </button>
          </div>

          {o.items.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-outline-variant py-6 text-center font-mono text-[11px] text-outline">
              No items yet — press “Add item” to record food or supplies given.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {o.items.map((row, i) => (
                <div key={i} className="grid items-end gap-2 sm:grid-cols-[1fr_110px_130px_auto]">
                  <div>
                    <label className={label}>Item</label>
                    <input value={row.item} onChange={(e) => setItem(i, { item: e.target.value })} className={field}
                      placeholder="Maize flour" />
                  </div>
                  <div>
                    <label className={label}>Quantity</label>
                    <input type="number" min={0} value={row.quantity}
                      onChange={(e) => setItem(i, { quantity: Number(e.target.value) })} className={field} />
                  </div>
                  <div>
                    <label className={label}>Unit</label>
                    <input list="outreach-units" value={row.unit} onChange={(e) => setItem(i, { unit: e.target.value })}
                      className={field} placeholder="kg" />
                  </div>
                  <button type="button" onClick={() => delItem(i)} aria-label={`Remove ${row.item || 'item'}`}
                    className="mb-0.5 rounded-lg border border-outline-variant px-2 py-2 text-error hover:border-error">
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
              ))}
              <datalist id="outreach-units">
                {OUTREACH_UNITS.map((u) => <option key={u} value={u} />)}
              </datalist>
            </div>
          )}

          <div className="mt-5 border-t border-outline-variant/60 pt-4">
            <label className={label}>People reached</label>
            <input type="number" min={0} value={o.peopleReached}
              onChange={(e) => set('peopleReached', Number(e.target.value))}
              className={`${field} max-w-[200px]`} />
            <p className="mt-1 font-mono text-[11px] text-on-surface-variant">
              How many people this helped. This is what the meter on the website counts.
            </p>
          </div>
        </div>

        {/* More photographs */}
        <div className="rounded-xl border border-outline-variant bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-work font-semibold text-industrial-blue">More photographs</h2>
            <button type="button" onClick={addPhoto}
              className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 font-mono text-[11px] font-medium text-industrial-blue hover:border-safety-orange">
              <Icon name="add" className="text-[16px]" /> Add photo
            </button>
          </div>
          {o.gallery.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-outline-variant py-6 text-center font-mono text-[11px] text-outline">
              Optional. The main photograph on the right is enough on its own.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {o.gallery.map((g, i) => (
                <div key={i} className="rounded-lg border border-outline-variant/60 p-3">
                  <ImageUploadField label={`Photo ${i + 1}`} value={g.src} onChange={(v) => setPhoto(i, { src: v })} />
                  <div className="mt-2 flex items-end gap-2">
                    <div className="flex-1">
                      <label className={label}>Caption</label>
                      <input value={g.alt} onChange={(e) => setPhoto(i, { alt: e.target.value })} className={field}
                        placeholder="Families collecting their parcels" />
                    </div>
                    <button type="button" onClick={() => delPhoto(i)} aria-label={`Remove photo ${i + 1}`}
                      className="mb-0.5 rounded-lg border border-outline-variant px-2 py-2 text-error hover:border-error">
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side column */}
      <div className="space-y-4">
        <div className="rounded-xl border border-outline-variant bg-white p-6">
          <ImageUploadField label="Main photograph" value={o.image} onChange={(v) => set('image', v)} />
        </div>

        {error && <p className="rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>}

        <div className="flex flex-col gap-2">
          <button type="button" disabled={saving} onClick={() => save(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
            <Icon name="publish" className="text-[18px]" /> {editing ? 'Save & publish' : 'Publish to the website'}
          </button>
          <button type="button" disabled={saving} onClick={() => save(false)}
            className="rounded-lg border border-outline-variant px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-industrial-blue hover:bg-surface-container-low disabled:opacity-50">
            Save as draft
          </button>
          {editing && (
            <button type="button" onClick={del}
              className="rounded-lg px-5 py-2 font-mono text-xs font-medium text-error hover:bg-error-container/40">
              Delete entry
            </button>
          )}
        </div>

        <p className="rounded-lg bg-surface-container-low px-3 py-2.5 font-mono text-[11px] text-on-surface-variant">
          A draft is kept here and does not appear on the website, and does not count towards the totals.
        </p>
      </div>
    </div>
  );
}
