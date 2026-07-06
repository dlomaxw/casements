import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  imageAlt: string;
  type?: string;
}

export default function ProductCard({ title, description, image, href, imageAlt, type }: ProductCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-brand-100 transition-shadow hover:shadow-xl"
    >
      <div className="relative h-52 overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {type && (
          <span className="absolute left-3 top-3 rounded bg-brand-950/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent-400 backdrop-blur">
            {type}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-bold text-brand-950">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-800/70">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-accent-600">
          Learn More
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M5 12h14m-6-6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
