'use client';

import { useState } from 'react';
import Icon from './Icon';

interface Prefs {
  notifyEmail: boolean;
  notifyDesktop: boolean;
  notifyInventory: boolean;
}

const options: { key: keyof Prefs; title: string; desc: string }[] = [
  { key: 'notifyEmail', title: 'Email Alerts', desc: 'New leads and lead status updates' },
  { key: 'notifyDesktop', title: 'Desktop Notifications', desc: 'Real-time alerts for incoming enquiries' },
  { key: 'notifyInventory', title: 'Inventory Updates', desc: 'Alerts for glass and steel stock levels' },
];

function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
        on ? 'bg-primary' : 'bg-outline-variant'
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`}>
        {on && <Icon name="check" className="text-[14px] leading-5 text-primary" />}
      </span>
    </button>
  );
}

export default function NotificationsForm({ userId, initial }: { userId: string; initial: Prefs }) {
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [pending, setPending] = useState<keyof Prefs | null>(null);

  const toggle = async (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setPending(key);
    const res = await fetch(`/api/crm/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: next[key] }),
    });
    setPending(null);
    if (!res.ok) setPrefs(prefs); // revert on failure
  };

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-6">
      <h2 className="mb-5 flex items-center gap-2 font-work text-lg font-semibold text-industrial-blue">
        <Icon name="notifications" className="text-safety-orange" /> Notifications
      </h2>
      <div className="space-y-3">
        {options.map((o) => (
          <div key={o.key} className="flex items-center justify-between rounded-lg bg-surface-container-low p-4">
            <div className="pr-4">
              <p className="text-sm font-semibold text-industrial-blue">{o.title}</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">{o.desc}</p>
            </div>
            <Toggle on={prefs[o.key]} onClick={() => toggle(o.key)} disabled={pending === o.key} />
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-[11px] text-outline">
        Email delivery activates once a Resend API key is configured.
      </p>
    </div>
  );
}
