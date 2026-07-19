import { ORG, SITE_URL, canonical } from '@/lib/seo';

/**
 * Structured data builders. Every value comes from our own verified site data —
 * nothing is asserted that isn't true of the business (no invented ratings,
 * prices or locations).
 */

export function organizationSchema(contact: { phone: string; email: string; address: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG.name,
    legalName: ORG.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/images/casements-logo.png`,
    foundingDate: ORG.founded,
    description:
      "Uganda's leading aluminium, glass, steel and wood finishing specialists — design, fabrication and installation for homes, offices, hotels, hospitals and commercial spaces.",
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG.street,
      addressLocality: ORG.city,
      addressCountry: ORG.country,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contact.phone,
      email: contact.email,
      contactType: 'sales',
      areaServed: 'East Africa',
      availableLanguage: 'English',
    },
    sameAs: ORG.sameAs,
  };
}

export function localBusinessSchema(contact: { phone: string; email: string; address: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: ORG.name,
    image: `${SITE_URL}/images/brand-hero.jpg`,
    url: SITE_URL,
    telephone: contact.phone,
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG.street,
      addressLocality: ORG.city,
      addressCountry: ORG.country,
    },
    areaServed: [{ '@type': 'Country', name: 'Uganda' }],
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: ORG.name,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: canonical(t.path),
    })),
  };
}

// Product pages describe a fabricated-and-installed offering, so Service is the
// honest type — we don't publish per-unit prices, and no ratings are invented.
export function productServiceSchema(p: {
  slug: string;
  title: string;
  description: string;
  image: string;
  type: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${canonical(`/products/${p.slug}`)}#service`,
    name: p.title,
    description: p.description,
    image: p.image.startsWith('http') ? p.image : `${SITE_URL}${p.image}`,
    serviceType: p.type,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: [{ '@type': 'Country', name: 'Uganda' }],
    url: canonical(`/products/${p.slug}`),
  };
}

// Google requires FAQ content to be visible on the page — this is only emitted
// alongside the rendered FAQ section, never as hidden markup.
export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function blogPostingSchema(p: {
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | null;
  updatedAt: Date;
  author?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.excerpt ?? undefined,
    image: p.coverImage
      ? p.coverImage.startsWith('http')
        ? p.coverImage
        : `${SITE_URL}${p.coverImage}`
      : undefined,
    datePublished: p.publishedAt?.toISOString(),
    dateModified: p.updatedAt.toISOString(),
    author: p.author ? { '@type': 'Person', name: p.author } : { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: canonical(`/blog/${p.slug}`),
  };
}
