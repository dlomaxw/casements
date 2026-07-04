'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { POST_CATEGORIES } from '@/lib/blog';
import ImageUploadField from './ImageUploadField';
import Icon from './Icon';

interface PostData {
  id?: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  videoUrl: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant';

export default function PostEditor({ initial }: { initial?: Partial<PostData> }) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [p, setP] = useState<PostData>({
    title: initial?.title ?? '',
    excerpt: initial?.excerpt ?? '',
    body: initial?.body ?? '',
    coverImage: initial?.coverImage ?? '',
    videoUrl: initial?.videoUrl ?? '',
    category: initial?.category ?? 'News',
    status: initial?.status ?? 'DRAFT',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof PostData>(k: K, v: PostData[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const save = async (status: 'DRAFT' | 'PUBLISHED') => {
    setError('');
    setSaving(true);
    const payload = { ...p, status };
    const url = editing ? `/api/crm/posts/${initial!.id}` : '/api/crm/posts';
    const res = await fetch(url, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      router.push('/crm/blog');
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Could not save the post.');
    }
  };

  const del = async () => {
    if (!editing || !confirm('Delete this post permanently?')) return;
    await fetch(`/api/crm/posts/${initial!.id}`, { method: 'DELETE' });
    router.push('/crm/blog');
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-xl border border-outline-variant bg-white p-6">
          <div className="space-y-4">
            <div>
              <label className={label}>Title</label>
              <input value={p.title} onChange={(e) => set('title', e.target.value)} className={field} placeholder="Post headline" />
            </div>
            <div>
              <label className={label}>Excerpt <span className="text-outline">(short summary)</span></label>
              <input value={p.excerpt} onChange={(e) => set('excerpt', e.target.value)} className={field} placeholder="One-line teaser shown in listings" />
            </div>
            <div>
              <label className={label}>Body</label>
              <textarea value={p.body} onChange={(e) => set('body', e.target.value)} rows={14} className={`${field} font-sans`} placeholder="Write the post… (line breaks preserved)" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-4 rounded-xl border border-outline-variant bg-white p-6">
          <div>
            <label className={label}>Category</label>
            <select value={p.category} onChange={(e) => set('category', e.target.value)} className={field}>
              {POST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <ImageUploadField label="Cover Image" value={p.coverImage} onChange={(v) => set('coverImage', v)} />
          <div>
            <label className={label}>Video Link <span className="text-outline">(YouTube / Vimeo)</span></label>
            <input value={p.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} className={field} placeholder="https://youtube.com/watch?v=…" />
          </div>
        </div>

        {error && <p className="rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>}

        <div className="flex flex-col gap-2">
          <button type="button" disabled={saving} onClick={() => save('PUBLISHED')}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
            <Icon name="publish" className="text-[18px]" /> {p.status === 'PUBLISHED' ? 'Update & keep live' : 'Publish'}
          </button>
          <button type="button" disabled={saving} onClick={() => save('DRAFT')}
            className="rounded-lg border border-outline-variant px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-industrial-blue hover:bg-surface-container-low disabled:opacity-50">
            Save as draft
          </button>
          {editing && (
            <button type="button" onClick={del}
              className="rounded-lg px-5 py-2 font-mono text-xs font-medium text-error hover:bg-error-container/40">
              Delete post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
