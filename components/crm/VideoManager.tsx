'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';

interface Video {
  id: string;
  title: string;
  url: string;
  order: number;
  published: boolean;
}

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant';

// Same matcher the server and the public site use — keeps the preview honest.
function ytId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube-nocookie\.com\/embed\/)([\w-]{11})/,
  );
  if (m) return m[1];
  return /^[\w-]{11}$/.test(url.trim()) ? url.trim() : null;
}

export default function VideoManager({ initial }: { initial: Video[] }) {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>(initial);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const res = await fetch('/api/crm/videos');
    if (res.ok) setVideos((await res.json()).videos);
    router.refresh();
  };

  const add = async () => {
    setError('');
    if (!newTitle.trim() || !newUrl.trim()) { setError('Give the video a caption and a YouTube link.'); return; }
    if (!ytId(newUrl)) { setError('That link has no YouTube video id in it.'); return; }
    setBusy(true);
    const res = await fetch('/api/crm/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), url: newUrl.trim() }),
    });
    setBusy(false);
    if (!res.ok) { setError((await res.json().catch(() => ({}))).error ?? 'Could not add the video.'); return; }
    setNewTitle('');
    setNewUrl('');
    await refresh();
  };

  const patch = async (id: string, data: Partial<Video>) => {
    setError('');
    const res = await fetch(`/api/crm/videos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { setError((await res.json().catch(() => ({}))).error ?? 'Could not save.'); return false; }
    return true;
  };

  // Local edits are held in state; Save writes them and re-reads the list.
  const edit = (id: string, data: Partial<Video>) =>
    setVideos((v) => v.map((x) => (x.id === id ? { ...x, ...data } : x)));

  const save = async (v: Video) => {
    setBusy(true);
    const ok = await patch(v.id, { title: v.title, url: v.url });
    setBusy(false);
    if (ok) await refresh();
  };

  const togglePublished = async (v: Video) => {
    edit(v.id, { published: !v.published });
    if (!(await patch(v.id, { published: !v.published }))) edit(v.id, { published: v.published });
    else router.refresh();
  };

  // Swap order values with the neighbour so the home page reflows.
  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= videos.length) return;
    const a = videos[index];
    const b = videos[target];
    setBusy(true);
    await Promise.all([patch(a.id, { order: b.order }), patch(b.id, { order: a.order })]);
    setBusy(false);
    await refresh();
  };

  const remove = async (v: Video) => {
    if (!confirm(`Remove “${v.title}” from the home page? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/crm/videos/${v.id}`, { method: 'DELETE' });
    setBusy(false);
    await refresh();
  };

  return (
    <div className="space-y-8">
      {/* Add */}
      <div className="rounded-xl border border-outline-variant bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 font-work text-lg font-semibold text-industrial-blue">
          <Icon name="add_circle" className="text-safety-orange" /> Add a video
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Caption</label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className={field} placeholder="Our Workshop" />
          </div>
          <div>
            <label className={label}>YouTube link</label>
            <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className={field} placeholder="https://youtu.be/ryzOBNT5x3w" />
          </div>
        </div>
        <button type="button" disabled={busy} onClick={add}
          className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
          <Icon name="add" className="text-[18px]" /> Add video
        </button>
      </div>

      {error && <p className="rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>}

      {/* List */}
      {videos.length === 0 ? (
        <p className="rounded-xl border border-outline-variant bg-white p-6 text-sm text-on-surface-variant">
          No videos yet — the video section is hidden on the home page until you add one.
        </p>
      ) : (
        <ul className="space-y-4">
          {videos.map((v, i) => {
            const id = ytId(v.url);
            return (
              <li key={v.id} className="rounded-xl border border-outline-variant bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg bg-surface-container-high sm:w-44">
                    {id ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center font-mono text-[11px] text-error">Bad link</span>
                    )}
                    {!v.published && (
                      <span className="absolute left-2 top-2 rounded bg-secondary-container px-2 py-0.5 font-mono text-[10px] font-bold text-on-secondary-container">
                        HIDDEN
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <label className={label}>Caption</label>
                      <input value={v.title} onChange={(e) => edit(v.id, { title: e.target.value })} className={field} />
                    </div>
                    <div>
                      <label className={label}>YouTube link</label>
                      <input value={v.url} onChange={(e) => edit(v.id, { url: e.target.value })} className={field} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" disabled={busy} onClick={() => save(v)}
                        className="rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
                        Save
                      </button>
                      <button type="button" disabled={busy} onClick={() => togglePublished(v)}
                        className="rounded-lg border border-outline-variant px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-industrial-blue hover:bg-surface-container-low disabled:opacity-50">
                        {v.published ? 'Hide' : 'Show'}
                      </button>
                      <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)}
                        aria-label="Move up"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-industrial-blue hover:bg-surface-container-low disabled:opacity-30">
                        <Icon name="arrow_upward" className="text-[18px]" />
                      </button>
                      <button type="button" disabled={busy || i === videos.length - 1} onClick={() => move(i, 1)}
                        aria-label="Move down"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-industrial-blue hover:bg-surface-container-low disabled:opacity-30">
                        <Icon name="arrow_downward" className="text-[18px]" />
                      </button>
                      <button type="button" disabled={busy} onClick={() => remove(v)}
                        className="ml-auto rounded-lg px-4 py-2 font-mono text-xs font-medium text-error hover:bg-error-container/40 disabled:opacity-50">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
