'use client';

import Icon from './Icon';

/** Opens the browser print dialog, where "Save as PDF" is the printer choice. */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90"
    >
      <Icon name="picture_as_pdf" className="text-[18px]" />
      Save as PDF
    </button>
  );
}
