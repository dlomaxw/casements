'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from './Button';

interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onSubmit = async (values: ContactValues) => {
    setStatus('idle');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Request failed');
      // GA4 lead event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', { event_category: 'Contact' });
      }
      reset();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const field = 'w-full rounded-md border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-brand-100 sm:p-8">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-brand-900">Name</label>
        <input id="name" className={field} placeholder="Your full name"
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-brand-900">Email Address</label>
        <input id="email" type="email" className={field} placeholder="you@example.com"
          {...register('email', { required: 'Email is required', pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Enter a valid email' } })} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-brand-900">Message</label>
        <textarea id="message" rows={4} className={field} placeholder="How can we help?"
          {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Please add a little more detail' } })} />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </Button>

      {status === 'success' && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          Thank you! Your message has been sent. We&rsquo;ll be in touch shortly.
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
