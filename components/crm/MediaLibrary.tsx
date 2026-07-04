'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  createdAt: string;
  uploadedBy?: { name: string } | null;
}

export default function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError('');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/crm/upload', { method: 'POST', body: fd });
    setUploading(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.media) {
      setItems((prev) => [data.media, ...prev]);
      router.refresh();
    } else {
      setError(data.error ?? 'Upload failed');
    }
  };

  const copy = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-mono text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
          <Icon name="upload" className="text-[18px]" /> {uploading ? 'Uploading…' : 'Upload Image'}
        </button>
        <span className="font-mono text-xs text-on-surface-variant">{items.length} files</span>
      </div>

      {error && <p className="mb-4 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</p>}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant bg-white p-12 text-center">
          <Icon name="image" className="text-4xl text-outline-variant" />
          <p className="mt-2 text-sm text-on-surface-variant">No media yet. Upload your first image.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-xl border border-outline-variant bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.filename} className="h-36 w-full object-cover" />
              <div className="p-3">
                <p className="truncate font-mono text-[11px] text-on-surface-variant" title={m.filename}>{m.filename}</p>
                <button type="button" onClick={() => copy(m.url)}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-outline-variant py-1.5 font-mono text-[11px] font-medium text-industrial-blue hover:border-safety-orange">
                  <Icon name={copied === m.url ? 'check' : 'content_copy'} className="text-[14px]" />
                  {copied === m.url ? 'Copied' : 'Copy URL'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
