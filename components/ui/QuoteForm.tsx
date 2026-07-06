'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from './Button';

interface QuoteValues {
  fullName: string;
  phone: string;
  email?: string;
  productCategory: string;
  projectSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'COMMERCIAL';
  timeline?: string;
  message?: string;
}

interface Category { slug: string; title: string }

export default function QuoteForm({ defaultCategory, categories }: { defaultCategory?: string; categories: Category[] }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteValues>({ defaultValues: { productCategory: defaultCategory } });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onSubmit = async (values: QuoteValues) => {
    setStatus('idle');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, sourcePage: typeof window !== 'undefined' ? window.location.pathname : undefined }),
      });
      if (!res.ok) throw new Error('Request failed');
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', { event_category: 'CRM', event_label: values.productCategory });
      }
      reset();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const field = 'w-full rounded-md border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';
  const label = 'mb-1 block text-sm font-medium text-brand-900';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-brand-100 sm:p-8">
      <h3 className="font-display text-xl font-bold text-brand-950">Request a Quote</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={label}>Name</label>
          <input id="fullName" className={field} placeholder="Full name"
            {...register('fullName', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })} />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={label}>Phone</label>
          <input id="phone" className={field} placeholder="+256…"
            {...register('phone', { required: 'Phone is required', minLength: { value: 7, message: 'Enter a valid phone' } })} />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className={label}>Email <span className="text-brand-400">(optional)</span></label>
        <input id="email" type="email" className={field} placeholder="you@example.com"
          {...register('email', { pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Enter a valid email' } })} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="productCategory" className={label}>Product Category</label>
          <select id="productCategory" className={field}
            {...register('productCategory', { required: 'Please choose a category' })}>
            <option value="">Select…</option>
            {categories.map((p) => (
              <option key={p.slug} value={p.slug}>{p.title}</option>
            ))}
          </select>
          {errors.productCategory && <p className="mt-1 text-xs text-red-600">{errors.productCategory.message}</p>}
        </div>
        <div>
          <label htmlFor="projectSize" className={label}>Project Size</label>
          <select id="projectSize" className={field}
            {...register('projectSize', { required: 'Please choose a size' })}>
            <option value="">Select…</option>
            <option value="SMALL">Small (single room / repair)</option>
            <option value="MEDIUM">Medium (whole home)</option>
            <option value="LARGE">Large (multi-unit)</option>
            <option value="COMMERCIAL">Commercial building</option>
          </select>
          {errors.projectSize && <p className="mt-1 text-xs text-red-600">{errors.projectSize.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="timeline" className={label}>Timeline <span className="text-brand-400">(optional)</span></label>
        <input id="timeline" className={field} placeholder="e.g. Within 3 months" {...register('timeline')} />
      </div>

      <div>
        <label htmlFor="message" className={label}>Message <span className="text-brand-400">(optional)</span></label>
        <textarea id="message" rows={3} className={field} placeholder="Tell us about your project" {...register('message')} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Sending…' : 'Request Quote'}
      </Button>

      {status === 'success' && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          Thank you! Your request has been received. A sales engineer will contact you shortly.
        </p>
      )}
      {status === 'error' && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          Something went wrong. Please call us on +256 752 700 700.
        </p>
      )}
    </form>
  );
}
