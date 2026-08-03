'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';

interface QuoteModalContext {
  open: (defaultCategory?: string) => void;
}
const Ctx = createContext<QuoteModalContext | null>(null);

export function useQuoteModal() {
  const ctx = useContext(Ctx);
  if (!ctx) return { open: () => {} };
  return ctx;
}

interface Category { slug: string; title: string }
interface Values {
  fullName: string;
  phone: string;
  email?: string;
  productCategory: string;
  projectSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'COMMERCIAL';
  message?: string;
}

export default function QuoteModalProvider({ categories, children }: { categories: Category[]; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState<string | undefined>();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>();

  const open = useCallback((cat?: string) => {
    setDefaultCategory(cat);
    setStatus('idle');
    reset({ productCategory: cat });
    setIsOpen(true);
  }, [reset]);

  const close = () => setIsOpen(false);

  const onSubmit = async (v: Values) => {
    setStatus('idle');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, sourcePage: typeof window !== 'undefined' ? window.location.pathname : undefined }),
      });
      if (!res.ok) throw new Error();
      reset();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const field = 'w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm text-steel-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-steel-950/50 backdrop-blur-sm" onClick={close} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <button onClick={close} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-steel-800/60 hover:bg-brand-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            {status === 'success' ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h3 className="mt-4 font-display text-2xl font-extrabold text-steel-950">Request received!</h3>
                <p className="mt-2 text-sm text-steel-800/70">A sales engineer will contact you shortly — usually within one business day.</p>
                <button onClick={close} className="mt-6 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Done</button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl font-extrabold text-steel-950">Request a Free Quote</h3>
                <p className="mt-1 text-sm text-steel-800/70">Tell us about your project and we&rsquo;ll get right back to you.</p>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <input className={field} placeholder="Full name *" {...register('fullName', { required: true, minLength: 2 })} />
                      {errors.fullName && <p className="mt-1 text-xs text-red-600">Name is required</p>}
                    </div>
                    <div>
                      <input className={field} placeholder="Phone *" {...register('phone', { required: true, minLength: 7 })} />
                      {errors.phone && <p className="mt-1 text-xs text-red-600">Phone is required</p>}
                    </div>
                  </div>
                  <input className={field} placeholder="Email (optional)" type="email" {...register('email', { pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/ })} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select className={field} {...register('productCategory', { required: true })} defaultValue={defaultCategory}>
                      <option value="">Product…</option>
                      {categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                    </select>
                    <select className={field} {...register('projectSize', { required: true })}>
                      <option value="">Project size…</option>
                      <option value="SMALL">Small (single room/repair)</option>
                      <option value="MEDIUM">Medium (whole home)</option>
                      <option value="LARGE">Large (multi-unit)</option>
                      <option value="COMMERCIAL">Commercial building</option>
                    </select>
                  </div>
                  <textarea className={field} rows={3} placeholder="Tell us about your project (optional)" {...register('message')} />
                  {status === 'error' && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">Something went wrong. Please call +256 752 700 700.</p>}
                  <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
                    {isSubmitting ? 'Sending…' : 'Send Quote Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
