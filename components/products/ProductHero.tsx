import Image from 'next/image';

interface ProductHeroProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  eyebrow?: string;
}

export default function ProductHero({ title, description, image, imageAlt, eyebrow = 'Products' }: ProductHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/80 to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold text-white sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">{description}</p>
      </div>
    </section>
  );
}
