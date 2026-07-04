import HeroBanner from '@/components/home/HeroBanner';
import ServicesStrip from '@/components/home/ServicesStrip';
import ProductHighlights from '@/components/home/ProductHighlights';
import ProcessSteps from '@/components/home/ProcessSteps';
import ConsultationCTA from '@/components/home/ConsultationCTA';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BlogPreview from '@/components/home/BlogPreview';
import ContactForm from '@/components/ui/ContactForm';
import { getSiteContent } from '@/lib/content';

export default async function HomePage() {
  const c = await getSiteContent();
  return (
    <>
      <HeroBanner />
      <ServicesStrip />
      <ProductHighlights />
      <ProcessSteps />
      <ConsultationCTA />
      <TestimonialsSection />
      <BlogPreview />
      <section id="contact" className="bg-steel-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">{c('home.contact.eyebrow')}</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-950 sm:text-4xl">
              {c('home.contact.heading')}
            </h2>
            <p className="mt-4 max-w-md text-brand-800/70">
              {c('home.contact.body')}
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
