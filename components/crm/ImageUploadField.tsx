'use client';

import { useRef, useState } from 'react';
import Icon from './Icon';

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export default function ImageUploadField({
  value,
  onChange,
  label = 'Image',
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (file: File) => {
    setError('');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/crm/upload', { method: 'POST', body: fd });
    setUploading(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) onChange(data.url);
    else setError(data.error ?? 'Upload failed');
  };

  return (
    <div>
      <label className="mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant">{label}</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste an image URL, or upload →"
          className={field}
        />
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 font-mono text-xs font-medium text-industrial-blue hover:border-safety-orange disabled:opacity-50">
          <Icon name="upload" className="text-[16px]" />
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {error && <p className="mt-1 font-mono text-[11px] text-error">{error}</p>}
      {value && (
        <div className="mt-2 overflow-hidden rounded-lg border border-outline-variant">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="h-40 w-full object-cover" />
        </div>
      )}
    </div>
  );
}
