'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/crm/login' })}
      className="rounded-lg border border-outline-variant px-4 py-2 font-mono text-xs font-medium tracking-wide text-industrial-blue transition-colors hover:border-safety-orange hover:text-safety-orange"
    >
      Sign out
    </button>
  );
}
