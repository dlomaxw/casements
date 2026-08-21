// Adds (or refreshes) the Roller Blinds product line.
// Copy condensed from the Casements Roller Blinds brochure. The brochure's
// hedged language ("where specified", "depends on the fabric") is kept
// deliberately — blind performance genuinely varies by fabric and opening.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const G = '/images/product-gallery/roller-blinds';

const gallery = [
  { src: `${G}/roller-blind-window-head.jpg`, alt: 'Roller blind fitted at the window head' },
  { src: `${G}/blackout-blind-charcoal.jpg`, alt: 'Blackout fabric in charcoal' },
  { src: `${G}/plain-roller-blind-cream.jpg`, alt: 'Plain roller blind in cream' },
  { src: `${G}/plain-roller-blind-stone.jpg`, alt: 'Plain roller blind in stone grey' },
  { src: `${G}/plain-roller-blind-green.jpg`, alt: 'Plain roller blind in green' },
  { src: `${G}/zebra-blind-grey.jpg`, alt: 'Dual-layer zebra blind in grey' },
  { src: `${G}/zebra-blind-natural.jpg`, alt: 'Dual-layer zebra blind in natural tones' },
  { src: `${G}/zebra-blind-green.jpg`, alt: 'Dual-layer zebra blind in green' },
  { src: `${G}/zebra-blind-cassette.jpg`, alt: 'Zebra blind with a cassette head' },
  { src: `${G}/zebra-blind-glazed-door.jpg`, alt: 'Zebra blind at a glazed door' },
  { src: `${G}/zebra-blind-residential.jpg`, alt: 'Zebra blind in a residential window' },
  { src: `${G}/patterned-blind-sash.jpg`, alt: 'Patterned blind fitted to the sash' },
  { src: `${G}/roller-blind-sash-orange.jpg`, alt: 'Roller blind fitted directly to the sash' },
];

const longDescription = [
  'Roller blinds are a clean, practical way to manage natural light, glare, privacy and solar exposure. Their minimal design sits comfortably alongside contemporary aluminium and glass systems without competing with the architecture.',
  'We build each blind around the size, use and appearance of the opening: site measurement, fabric and mechanism selection, colour coordination, custom sizing, fabrication, installation and final adjustment.',
  'Blackout fabrics give the strongest light reduction and privacy, for bedrooms, hotel rooms, boardrooms and presentation spaces. Sunscreen fabrics cut glare while keeping a degree of outward visibility, which suits offices, reception areas and glazed facades. Translucent and light-filtering fabrics diffuse direct brightness while still admitting daylight. Dual roller systems combine two fabrics in one opening, typically a sunscreen for daytime and a blackout for privacy.',
  'Blinds operate by chain or, where specified, by motor with wall switch, remote or centralised control. Actual light-blocking, privacy and glare performance depends on the fabric, the blind dimensions and the mounting arrangement, so final fabric and colour selection should be confirmed from physical samples.',
].join('\n\n');

const faqs = [
  {
    question: 'Which roller blind should I choose for an office?',
    answer:
      'Sunscreen fabric is usually the best fit for open-plan offices and workstations: it cuts glare on computer screens and reduces direct sun while keeping a view out. For boardrooms and meeting rooms where presentations are shown, or where privacy matters, blackout fabric is the better choice. Dual roller systems give you both in one opening.',
  },
  {
    question: 'Do blackout blinds block all light?',
    answer:
      'Blackout fabric itself blocks light, but no roller blind seals an opening completely — a small amount passes at the edges between the fabric and the reveal. How much depends on the fabric, the blind dimensions and how it is mounted. Fitting inside a deep reveal, or face-fixing wider than the opening, reduces it considerably.',
  },
  {
    question: 'What is a dual or zebra blind?',
    answer:
      'A dual roller blind runs alternating bands of sheer and solid fabric on a single roller. Aligning the solid bands closes the blind for privacy; offsetting them opens horizontal sheer stripes that let in filtered light and a partial view. It gives you two levels of control from one blind.',
  },
  {
    question: 'Can roller blinds be motorised?',
    answer:
      'Yes, where specified. Motorised blinds can be operated by wall switch, remote control, centralised control or a schedule, and are worth considering for large, high-level or numerous windows. Electrical and control requirements need to be confirmed during project design, so tell us early if you want them.',
  },
  {
    question: 'How are roller blinds measured and fitted?',
    answer:
      'We inspect the site, measure each opening, review the frame condition and confirm the mounting position — inside the reveal, face-fixed above the opening, or ceiling-mounted — before anything is fabricated. Custom-sized blinds are only made once measurements are approved. Installation covers bracket positioning, levelling, mechanism and bottom-bar adjustment, operational testing and handover.',
  },
  {
    question: 'What colours are available?',
    answer:
      'Fabrics come in whites, off-whites, greys, charcoal, black, beige and neutral tones, and project-specific colours can be sourced. Blind colour has a real effect on the finished interior, so we coordinate it with your aluminium frames, walls, ceilings, flooring and any corporate branding. Confirm final colours from physical manufacturer samples rather than from a screen.',
  },
];

const data = {
  slug: 'roller-blinds',
  title: 'Roller Blinds',
  shortTitle: 'Blinds',
  type: 'Blinds',
  description:
    'Blackout, sunscreen, translucent and dual roller blind systems — measured, fabricated and installed for offices, homes, hotels and healthcare interiors.',
  longDescription,
  image: `${G}/zebra-blind-residential.jpg`,
  imageAlt: 'Roller blinds fitted to a residential window',
  subItems: [
    'Blackout Roller Blinds',
    'Sunscreen Roller Blinds',
    'Translucent Roller Blinds',
    'Light-Filtering Roller Blinds',
    'Dual (Zebra) Roller Blinds',
    'Manual Chain Operation',
    'Motorised Roller Blinds',
    'Custom Commercial Blinds',
    'Site Measurement & Installation',
  ],
  faqs,
  keywords: [
    'roller blinds Uganda',
    'roller blinds Kampala',
    'blackout blinds Uganda',
    'sunscreen blinds Kampala',
    'zebra blinds Uganda',
    'dual roller blinds Kampala',
    'translucent blinds Uganda',
    'office blinds Kampala',
    'window blinds Uganda',
    'motorised blinds Uganda',
    'blinds installation Kampala',
    'roller blind prices Uganda',
  ],
};

const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
if (existing) {
  await prisma.product.update({ where: { slug: data.slug }, data: { ...data, gallery } });
  console.log('Updated roller-blinds.');
} else {
  const max = await prisma.product.aggregate({ _max: { order: true } });
  await prisma.product.create({
    data: { ...data, gallery, order: (max._max.order ?? 0) + 1, published: true },
  });
  console.log('Created roller-blinds.');
}

// Route its leads to the Sales Team, like every other category.
const rep = await prisma.user.findUnique({ where: { email: 'sales@casements.co.ug' } });
if (rep && !(await prisma.repProductMap.findUnique({ where: { category: data.slug } }))) {
  await prisma.repProductMap.create({ data: { category: data.slug, userId: rep.id } });
  console.log(`Mapped roller-blinds -> ${rep.name}`);
}

const p = await prisma.product.findUnique({ where: { slug: data.slug } });
console.log(
  `gallery: ${p.gallery.length} · faqs: ${p.faqs.length} · subItems: ${p.subItems.length} · keywords: ${p.keywords.length}`,
);
await prisma.$disconnect();
