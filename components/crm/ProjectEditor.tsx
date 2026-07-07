'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploadField from './ImageUploadField';
import Icon from './Icon';

interface ProjectData {
  id?: string;
  name: string;
  location: string;
  completion: string;
  scope: string;
  image: string;
  published: boolean;
}

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant';

export default function ProjectEditor({ initial }: { initial?: Partial<ProjectData> }) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [p, setP] = useState<ProjectData>({
    name: initial?.name ?? '',
    location: initial?.location ?? '',
    completion: initial?.completion ?? '',
    scope: initial?.scope ?? '',
    image: initial?.image ?? '',
    published: initial?.published ?? true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProjectData>(k: K, v: ProjectData[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const save = async (published: boolean) => {
    setError('');
    if (!p.name || !p.location || !p.completion || !p.scope || !p.image) {
      setError('All fields including the image are required.');
      return;
    }
    setSaving(true);
    const url = editing ? `/api/crm/projects/${initial!.id}` : '/api/crm/projects';
    const res = await fetch(url, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, published }),
    });
    setSaving(false);
    if (res.ok) { router.push('/crm/projects'); router.refresh(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? 'Could not save.'); }
  };

  const del = async () => {
    if (!editing || !confirm('Delete this project permanently?')) return;
    await fetch(`/api/crm/projects/${initial!.id}`, { method: 'DELETE' });
    router.push('/crm/projects');
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 rounded-xl border border-outline-variant bg-white p-6 lg:col-span-2">
        <div><label className={label}>Project name</label><input value={p.name} onChange={(e) => set('name', e.target.value)} className={field} placeholder="Course View Tower" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>Location</label><input value={p.location} onChange={(e) => set('location', e.target.value)} className={field} placeholder="Nakasero, Kampala" /></div>
          <div><label className={label}>Completion</label><input value={p.completion} onChange={(e) => set('completion', e.target.value)} className={field} placeholder="December 2010" /></div>
        </div>
        <div><label className={label}>Scope of works</label><textarea value={p.scope} onChange={(e) => set('scope', e.target.value)} rows={4} className={field} placeholder="ACP Cladding, Curtain Walling, Automatic Doors…" /></div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-outline-variant bg-white p-6">
          <ImageUploadField label="Project image" value={p.image} onChange={(v) => set('image', v)} />
        </div>

        {error && <p className="rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>}

        <div className="flex flex-col gap-2">
          <button type="button" disabled={saving} onClick={() => save(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
            <Icon name="publish" className="text-[18px]" /> {editing ? 'Save & publish' : 'Create & publish'}
          </button>
          <button type="button" disabled={saving} onClick={() => save(false)}
            className="rounded-lg border border-outline-variant px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-industrial-blue hover:bg-surface-container-low disabled:opacity-50">
            Save as draft
          </button>
          {editing && (
            <button type="button" onClick={del} className="rounded-lg px-5 py-2 font-mono text-xs font-medium text-error hover:bg-error-container/40">
              Delete project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
