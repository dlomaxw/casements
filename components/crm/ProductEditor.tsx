'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploadField from './ImageUploadField';
import Icon from './Icon';

interface GalleryItem { src: string; alt: string }
interface ProductData {
  id?: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  image: string;
  imageAlt: string;
  videoUrl: string;
  subItems: string[];
  gallery: GalleryItem[];
  keywords: string[];
  published: boolean;
}

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant';

export default function ProductEditor({ initial }: { initial?: Partial<ProductData> }) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [p, setP] = useState<ProductData>({
    title: initial?.title ?? '',
    shortTitle: initial?.shortTitle ?? '',
    description: initial?.description ?? '',
    longDescription: initial?.longDescription ?? '',
    image: initial?.image ?? '',
    imageAlt: initial?.imageAlt ?? '',
    videoUrl: initial?.videoUrl ?? '',
    subItems: initial?.subItems ?? [],
    gallery: initial?.gallery ?? [],
    keywords: initial?.keywords ?? [],
    published: initial?.published ?? true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProductData>(k: K, v: ProductData[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const save = async (published: boolean) => {
    setError('');
    if (!p.title || !p.description || !p.longDescription || !p.image) {
      setError('Title, description, overview and main image are required.');
      return;
    }
    setSaving(true);
    const payload = { ...p, shortTitle: p.shortTitle || p.title, published };
    const url = editing ? `/api/crm/products/${initial!.id}` : '/api/crm/products';
    const res = await fetch(url, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) { router.push('/crm/products'); router.refresh(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? 'Could not save.'); }
  };

  const del = async () => {
    if (!editing || !confirm('Delete this product permanently?')) return;
    await fetch(`/api/crm/products/${initial!.id}`, { method: 'DELETE' });
    router.push('/crm/products');
    router.refresh();
  };

  // --- feature list ---
  const setSub = (i: number, v: string) => set('subItems', p.subItems.map((s, idx) => (idx === i ? v : s)));
  const addSub = () => set('subItems', [...p.subItems, '']);
  const delSub = (i: number) => set('subItems', p.subItems.filter((_, idx) => idx !== i));

  // --- gallery ---
  const setGal = (i: number, patch: Partial<GalleryItem>) => set('gallery', p.gallery.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  const addGal = () => set('gallery', [...p.gallery, { src: '', alt: '' }]);
  const delGal = (i: number) => set('gallery', p.gallery.filter((_, idx) => idx !== i));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="space-y-4 rounded-xl border border-outline-variant bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={label}>Title</label><input value={p.title} onChange={(e) => set('title', e.target.value)} className={field} placeholder="Aluminium Doors & Windows" /></div>
            <div><label className={label}>Short title <span className="text-outline">(nav/sidebar)</span></label><input value={p.shortTitle} onChange={(e) => set('shortTitle', e.target.value)} className={field} placeholder="Aluminium" /></div>
          </div>
          <div><label className={label}>Card / index description</label><textarea value={p.description} onChange={(e) => set('description', e.target.value)} rows={3} className={field} /></div>
          <div><label className={label}>Overview (detail page)</label><textarea value={p.longDescription} onChange={(e) => set('longDescription', e.target.value)} rows={6} className={field} /></div>
        </div>

        {/* Feature list */}
        <div className="rounded-xl border border-outline-variant bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-work font-semibold text-industrial-blue">What we offer (features)</h3>
            <button type="button" onClick={addSub} className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 font-mono text-[11px] font-medium text-industrial-blue hover:border-safety-orange">
              <Icon name="add" className="text-[16px]" /> Add feature
            </button>
          </div>
          <div className="space-y-2">
            {p.subItems.length === 0 && <p className="font-mono text-[11px] text-outline">No features yet.</p>}
            {p.subItems.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input value={s} onChange={(e) => setSub(i, e.target.value)} className={field} placeholder="e.g. Bi-Fold Doors" />
                <button type="button" onClick={() => delSub(i)} className="shrink-0 rounded-lg border border-outline-variant px-2 text-error hover:border-error"><Icon name="delete" className="text-[18px]" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="rounded-xl border border-outline-variant bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-work font-semibold text-industrial-blue">Gallery images</h3>
            <button type="button" onClick={addGal} className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 font-mono text-[11px] font-medium text-industrial-blue hover:border-safety-orange">
              <Icon name="add" className="text-[16px]" /> Add image
            </button>
          </div>
          <div className="space-y-4">
            {p.gallery.length === 0 && <p className="font-mono text-[11px] text-outline">No gallery images yet.</p>}
            {p.gallery.map((g, i) => (
              <div key={i} className="rounded-lg border border-outline-variant/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-on-surface-variant">Image {i + 1}</span>
                  <button type="button" onClick={() => delGal(i)} className="text-error hover:opacity-80"><Icon name="delete" className="text-[18px]" /></button>
                </div>
                <ImageUploadField label="Image" value={g.src} onChange={(v) => setGal(i, { src: v })} />
                <div className="mt-2"><label className={label}>Caption / alt</label><input value={g.alt} onChange={(e) => setGal(i, { alt: e.target.value })} className={field} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="space-y-4 rounded-xl border border-outline-variant bg-white p-6">
          <ImageUploadField label="Main image" value={p.image} onChange={(v) => set('image', v)} />
          <div><label className={label}>Main image alt</label><input value={p.imageAlt} onChange={(e) => set('imageAlt', e.target.value)} className={field} /></div>
          <div><label className={label}>Video link <span className="text-outline">(YouTube/Vimeo)</span></label><input value={p.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} className={field} placeholder="https://youtube.com/watch?v=…" /></div>
          <div><label className={label}>SEO keywords <span className="text-outline">(comma-separated)</span></label>
            <input value={p.keywords.join(', ')} onChange={(e) => set('keywords', e.target.value.split(',').map((k) => k.trim()).filter(Boolean))} className={field} />
          </div>
        </div>

        {error && <p className="rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>}

        <div className="flex flex-col gap-2">
          <button type="button" disabled={saving} onClick={() => save(true)} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
            <Icon name="publish" className="text-[18px]" /> {editing ? 'Save & publish' : 'Create & publish'}
          </button>
          <button type="button" disabled={saving} onClick={() => save(false)} className="rounded-lg border border-outline-variant px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-industrial-blue hover:bg-surface-container-low disabled:opacity-50">
            Save as draft
          </button>
          {editing && <button type="button" onClick={del} className="rounded-lg px-5 py-2 font-mono text-xs font-medium text-error hover:bg-error-container/40">Delete product</button>}
        </div>
      </div>
    </div>
  );
}
