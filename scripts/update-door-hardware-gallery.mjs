// Replaces the Door Hardware gallery with the full product catalogue, and adds
// the range detail the catalogue sheets revealed (master key systems, keyed-
// alike suites, fire-rated viewers) that the brochure's generic list omitted.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Neon parks its compute when idle; the first query after a quiet spell fails
// while it wakes.
async function retry(fn, attempts = 8) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts) throw err;
      console.log(`  attempt ${i} failed — waiting for the database…`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

const G = '/images/product-gallery/door-hardware';

// Ordered to match the "What we offer" list: levers, pulls, cylinders,
// escutcheons, viewers, stoppers, then the showroom boards and lock set.
const gallery = [
  { src: `${G}/lever-handles-rose-straight-knurled-designer.jpg`, alt: 'Lever handles — square rose, straight, knurled and designer' },
  { src: `${G}/lever-handles-curved-flat-bar-classic.jpg`, alt: 'Lever handles — curved, flat bar and classic' },
  { src: `${G}/lever-handles-slim-wave-minimalist.jpg`, alt: 'Lever handles — sleek slim, wave and minimalist' },
  { src: `${G}/pull-handle-standard-d.jpg`, alt: 'Standard D pull handle · 300–600mm' },
  { src: `${G}/pull-handle-offset-d.jpg`, alt: 'Offset D pull handle · 300–600mm' },
  { src: `${G}/pull-handle-slim-d.jpg`, alt: 'Slim D pull handle · 300–600mm' },
  { src: `${G}/pull-handle-heavy-duty-d.jpg`, alt: 'Heavy-duty D pull handle · 450–900mm' },
  { src: `${G}/pull-handle-large-d.jpg`, alt: 'Large D pull handle · 600–1200mm' },
  { src: `${G}/pull-handle-back-to-back.jpg`, alt: 'Back-to-back D pull handle · 450–1200mm' },
  { src: `${G}/cylinders-types-and-anatomy.jpg`, alt: 'Cylinder types and anatomy' },
  { src: `${G}/cylinders-security-and-master-key.jpg`, alt: 'High-security and master-key cylinders' },
  { src: `${G}/escutcheons-keyhole-privacy-cylinder.jpg`, alt: 'Escutcheons — keyhole, privacy and cylinder ring' },
  { src: `${G}/escutcheons-key-decorative-lift-slide.jpg`, alt: 'Escutcheons — mortise key, decorative and lift & slide' },
  { src: `${G}/escutcheons-blank-thin-custom.jpg`, alt: 'Escutcheons — blank, thin and custom finishes' },
  { src: `${G}/door-viewers-standard-long-brass.jpg`, alt: 'Door viewers — standard, long body and brass' },
  { src: `${G}/door-viewers-fire-rated-square.jpg`, alt: 'Door viewers — fire-rated and square' },
  { src: `${G}/door-stoppers-floor-spring-wedge.jpg`, alt: 'Door stoppers — floor, spring, adjustable and wedge' },
  { src: `${G}/handles-and-accessories-board.jpg`, alt: 'Showroom display board' },
  { src: `${G}/hardware-specification-board.jpg`, alt: 'Finishes, materials and specifications' },
  { src: `${G}/marina-lock-set-front.jpg`, alt: 'Marina sliding door lock set' },
  { src: `${G}/marina-lock-set-mechanism.jpg`, alt: 'Marina lock internal mechanism' },
];

const subItems = [
  'Lever Handles',
  'Pull Handles',
  'Mortise Locks',
  'Euro Profile Cylinders',
  'Master Key Systems',
  'Keyed-Alike Suites',
  'Door Hinges',
  'Door Closers',
  'Floor Springs',
  'Multipoint Locking Systems',
  'Panic Exit Devices',
  'Glass Door Hardware',
  'Sliding Door Hardware',
  'Smart & Electronic Locks',
  'Privacy & Bathroom Hardware',
  'Escutcheons & Cylinder Caps',
  'Thumb Turns & Flush Bolts',
  'Door Stoppers, Viewers & Accessories',
];

// Added off the back of the cylinder catalogue sheets, which show master key,
// construction key, keyed-alike and emergency-function options.
const masterKeyFaq = {
  question: 'Can one key open several doors?',
  answer:
    'Yes — that is what a master key system does. Every door keeps its own key, and a single master key opens all of them, which suits offices, schools, hotels and any building with a caretaker or facilities manager. Where several doors should share one key outright, keyed-alike cylinders do that instead. We also supply construction-key cylinders, which let contractors work on site and are then locked out permanently when the owner first uses their key, and emergency-function cylinders that can be opened from outside even when a key is left in the inside of the lock.',
};

const product = await retry(() => prisma.product.findUnique({ where: { slug: 'door-hardware' } }));
if (!product) throw new Error('door-hardware product not found — run seed-door-hardware.mjs first');

const faqs = Array.isArray(product.faqs) ? [...product.faqs] : [];
if (!faqs.some((f) => f.question === masterKeyFaq.question)) {
  // Sits after the multipoint-lock question, with the other security topics.
  faqs.splice(3, 0, masterKeyFaq);
}

await retry(() =>
  prisma.product.update({
    where: { slug: 'door-hardware' },
    data: {
      gallery,
      subItems,
      faqs,
      image: `${G}/lever-handles-rose-straight-knurled-designer.jpg`,
      imageAlt: 'Lever handle range in matte black, chrome, nickel and brass finishes',
    },
  }),
);

const p = await retry(() => prisma.product.findUnique({ where: { slug: 'door-hardware' } }));
console.log(`gallery: ${p.gallery.length} · faqs: ${p.faqs.length} · subItems: ${p.subItems.length}`);
await prisma.$disconnect();
