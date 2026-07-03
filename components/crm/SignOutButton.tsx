'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/crm/login' })}
      className="rounded-md border border-brand-200 px-3 py-1.5 font-medium text-brand-700 hover:border-accent-500 hover:text-accent-600"
    >
      Sign out
    </button>
  );
}
