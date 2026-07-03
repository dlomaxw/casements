'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function CrmLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password.');
    } else {
      router.push('/crm');
      router.refresh();
    }
  };

  const field =
    'w-full rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl border border-outline-variant bg-white p-8 shadow-sm">
        <div className="mb-6">
          <span className="font-work text-2xl font-extrabold tracking-tight text-industrial-blue">CASEMENTS AFRICA</span>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-safety-orange">CRM Access</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">{error}</p>}

        <button type="submit" disabled={loading}
          className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-mono text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
