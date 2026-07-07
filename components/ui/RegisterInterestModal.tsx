'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Props {
  phone: string;
  phoneHref: string;
  email: string;
}

const SESSION_KEY = 'casements_interest_shown';

export default function RegisterInterestModal({ phone, phoneHref, email }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const whatsappHref = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    "Hello Casements, I'd like to register my interest.",
  )}`;

  // Open once per browser session, shortly after landing on the homepage.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, '1');
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);

  const submit = async () => {
    if (!form.name || !form.phone) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/register-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Request failed');
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', { event_category: 'RegisterInterest' });
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (!open) return null;

  const field =
    'w-full rounded-md border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-brand-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Register your interest"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-32 w-full">
          <Image src="/images/brand-hero.jpg" alt="Casements Africa projects" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-950/60 text-white transition hover:bg-brand-950"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 p-6 pt-3">
          {status === 'success' ? (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-extrabold text-brand-950">Thank you!</h3>
              <p className="text-sm text-brand-800/70">
                Your details are with our sales team — we&rsquo;ll be in touch shortly.
              </p>
              <button
                onClick={close}
                className="rounded-md bg-accent-500 px-6 py-2.5 text-sm font-semibold text-brand-950 hover:bg-accent-400"
              >
                Explore Casements
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-1 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-500">Casements (A) Ltd</p>
                <h3 className="font-display text-2xl font-extrabold text-brand-950">Register Your Interest</h3>
                <p className="text-sm text-brand-800/70">
                  Aluminium, glass, steel &amp; wood since 1965. Leave your details for a fast quote and expert advice.
                </p>
              </div>

              <div className="space-y-3">
                <input
                  className={field}
                  placeholder="Full name *"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
                <input
                  className={field}
                  placeholder="Phone number *"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
                <input
                  className={field}
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-600">Something went wrong — please try again or use the buttons below.</p>
              )}

              <button
                onClick={submit}
                disabled={status === 'loading' || !form.name || !form.phone}
                className="w-full rounded-md bg-accent-500 px-6 py-3 text-sm font-semibold text-brand-950 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? 'Sending…' : 'Register My Interest'}
              </button>

              {/* Direct contact channels */}
              <div className="grid grid-cols-3 gap-2 border-t border-brand-100 pt-4">
                <a
                  href={phoneHref}
                  className="flex flex-col items-center gap-1.5 rounded-lg bg-brand-50 p-3 text-center transition hover:bg-brand-100"
                >
                  <svg className="h-5 w-5 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <span className="text-[10px] font-medium text-brand-700">Call Us</span>
                </a>
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent('Casements enquiry')}`}
                  className="flex flex-col items-center gap-1.5 rounded-lg bg-brand-50 p-3 text-center transition hover:bg-brand-100"
                >
                  <svg className="h-5 w-5 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                  <span className="text-[10px] font-medium text-brand-700">Email</span>
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 rounded-lg bg-brand-50 p-3 text-center transition hover:bg-brand-100"
                >
                  <svg className="h-5 w-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.71.63.72.23 1.37.2 1.89.12.58-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.5 9.5 0 01-4.84-1.33l-.35-.2-3.6.94.96-3.5-.23-.36a9.46 9.46 0 01-1.45-5.05c0-5.24 4.27-9.5 9.52-9.5a9.48 9.48 0 016.73 2.8 9.42 9.42 0 012.78 6.71c0 5.24-4.27 9.5-9.51 9.5zm5.6-15.1A11.36 11.36 0 0012.05.5C5.76.5.62 5.63.62 11.93c0 2.02.53 3.99 1.53 5.73L.5 23.5l6-1.57a11.4 11.4 0 005.54 1.41h.01c6.29 0 11.42-5.13 11.43-11.43a11.35 11.35 0 00-3.33-8.08z" />
                  </svg>
                  <span className="text-[10px] font-medium text-brand-700">WhatsApp</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
