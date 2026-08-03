'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuoteModal } from './QuoteModal';

interface Msg { role: 'bot' | 'user'; text: string; actions?: { label: string; go: string }[] }

const PHONE = '+256 752 700 700';
const WHATSAPP = 'https://wa.me/256752700700';

// Canned, on-topic answers. Off-topic questions steer back to the business.
const ANSWERS: Record<string, { text: string; actions?: { label: string; go: string }[] }> = {
  products: {
    text: 'We fabricate aluminium windows & doors, curtain walls, façades, glass products, steel security, ceilings, partitions, railings and more. Which are you interested in?',
    actions: [{ label: 'See all products', go: 'link:/products' }, { label: 'Get a quote', go: 'quote' }],
  },
  quote: {
    text: 'Happy to help you get a free quote! You can open our quick quote form, or call us directly.',
    actions: [{ label: 'Open quote form', go: 'quote' }, { label: `Call ${PHONE}`, go: 'link:tel:+256752700700' }],
  },
  projects: {
    text: 'We’ve delivered 500+ projects since 1965 — Speke Resort, Course View Tower, Crested Towers, UPDF Referral Hospital and many more.',
    actions: [{ label: 'View projects', go: 'link:/projects' }],
  },
  location: {
    text: 'We’re at Plot 86/90, 5th Street, Industrial Area, Kampala, Uganda. Open Mon–Sat.',
    actions: [{ label: 'Chat on WhatsApp', go: `link:${WHATSAPP}` }],
  },
  contact: {
    text: `You can reach our sales team on ${PHONE} or sales@casements.co.ug. Want me to open the quote form?`,
    actions: [{ label: 'Get a quote', go: 'quote' }, { label: 'WhatsApp us', go: `link:${WHATSAPP}` }],
  },
  price: {
    text: 'Pricing depends on the product, sizes and finish — we quote per project. Share a few details and a sales engineer will send you a costed quote.',
    actions: [{ label: 'Request a quote', go: 'quote' }],
  },
  fallback: {
    text: 'I can help with our products, projects, getting a quote, or how to reach us. What would you like to know?',
    actions: [{ label: 'Products', go: 'topic:products' }, { label: 'Get a quote', go: 'quote' }, { label: 'Contact', go: 'topic:contact' }],
  },
};

function route(input: string): { text: string; actions?: { label: string; go: string }[] } {
  const q = input.toLowerCase();
  if (/(price|cost|how much|quote|quotation)/.test(q)) return ANSWERS.quote;
  if (/(product|window|door|glass|steel|aluminium|curtain|facade|railing|ceiling|partition)/.test(q)) return ANSWERS.products;
  if (/(project|portfolio|work|done|built)/.test(q)) return ANSWERS.projects;
  if (/(where|location|address|office|visit|find you)/.test(q)) return ANSWERS.location;
  if (/(contact|call|phone|email|reach|whatsapp)/.test(q)) return ANSWERS.contact;
  return ANSWERS.fallback;
}

export default function Chatbot() {
  const { open: openQuote } = useQuoteModal();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'bot',
      text: "Hi! I’m the Casements assistant. Ask me about our products, projects or getting a quote.",
      actions: [{ label: 'Products', go: 'topic:products' }, { label: 'Get a quote', go: 'quote' }, { label: 'Our projects', go: 'topic:projects' }],
    },
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, open]);

  const botReply = (text: string) => {
    const a = route(text);
    setTimeout(() => setMsgs((m) => [...m, { role: 'bot', text: a.text, actions: a.actions }]), 350);
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: 'user', text }]);
    setInput('');
    botReply(text);
  };

  const doAction = (go: string) => {
    if (go === 'quote') { openQuote(); return; }
    if (go.startsWith('link:')) { window.open(go.slice(5), go.includes('http') ? '_blank' : '_self'); return; }
    if (go.startsWith('topic:')) {
      const key = go.slice(6);
      const a = ANSWERS[key] ?? ANSWERS.fallback;
      setMsgs((m) => [...m, { role: 'bot', text: a.text, actions: a.actions }]);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[28rem] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-2xl">
          <div className="flex items-center gap-3 bg-brand-500 px-5 py-4 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            </div>
            <div>
              <p className="font-display text-sm font-bold">Casements Assistant</p>
              <p className="text-[11px] text-white/80">Typically replies instantly</p>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-steel-50 p-4">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === 'user' ? 'bg-brand-500 text-white' : 'bg-white text-steel-900 ring-1 ring-brand-100'}`}>
                  {m.text}
                  {m.actions && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.actions.map((a) => (
                        <button key={a.label} onClick={() => doAction(a.go)} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 hover:bg-brand-100">
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-brand-100 bg-white p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" className="flex-1 rounded-full border border-brand-100 bg-steel-50 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            <button type="submit" aria-label="Send" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
