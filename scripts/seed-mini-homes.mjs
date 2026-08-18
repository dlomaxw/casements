// Adds (or refreshes) the Mini Homes / Uniport product line.
// Prices transcribed from the Casements "Mini Homes Fabricator" price flyer.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const priceList = [
  {
    group: 'Circular Uniport',
    note: 'Diameter',
    items: [
      { label: '3.2m diameter', price: 3680000 },
      { label: '3.5m diameter', price: 3910000 },
      { label: '4.41m diameter', price: 4830000 },
      { label: '5m diameter', price: 5980000 },
    ],
  },
  {
    group: 'Oval Uniport',
    note: 'Diameter × length',
    items: [
      { label: '3.2m diameter × 4.87m long', price: 5520000 },
      { label: '3.5m diameter × 5.33m long', price: 6210000 },
      { label: '4.41m diameter × 7m long', price: 8337500 },
      { label: '5m diameter × 7.62m long', price: 8625000 },
    ],
  },
  {
    group: 'Pyramidal Uniport',
    note: 'Floor area',
    items: [
      { label: '4.31m × 2.59m', price: 6440000 },
      { label: '4.31m × 5.18m', price: 8337500 },
      { label: '6.1m × 6.1m', price: 9430000 },
    ],
  },
];

const data = {
  slug: 'mini-homes',
  title: 'Mini Homes & Uniports',
  shortTitle: 'Mini Homes',
  type: 'Other',
  description:
    'Prefabricated circular, oval and pyramidal uniports — delivered flat and set up on site in about an hour.',
  longDescription:
    'Our Mini Homes are prefabricated uniport structures fabricated in our Industrial Area workshop and assembled on your site — a complete unit can be set up in about an hour.\n\nThey come in three shapes. Circular uniports are the compact option, sized by diameter, and work well as guard houses, kiosks, site offices and garden rooms. Oval uniports extend the circular form lengthways to give a longer floor plan for shops, clinics, classrooms and staff accommodation. Pyramidal uniports use a rectangular floor plan with a pitched roof, giving the most usable square footage and full-height headroom through the centre.\n\nEvery unit is built from the same materials we use on commercial projects, so the structure holds up to Ugandan sun and rain far better than a temporary shelter. Prices below are for the standard specification — talk to us about doors, windows, insulation, partitions and finishes.',
  image: '/images/products/interior-mini-homes.jpg',
  imageAlt: 'Prefabricated mini home uniport by Casements Africa',
  subItems: [
    'Circular Uniports',
    'Oval Uniports',
    'Pyramidal Uniports',
    'Guard Houses & Kiosks',
    'Site Offices',
    'Set up in about one hour',
  ],
  faqs: [
    {
      question: 'How long does it take to set up a mini home?',
      answer:
        'The unit is fabricated in our workshop and assembled on your site — a standard uniport goes up in about an hour once it reaches the location.',
    },
    {
      question: 'What can a uniport be used for?',
      answer:
        'Guard houses, kiosks and shops, site offices, clinics, classrooms, staff accommodation, garden rooms and storage. The shape you choose depends on the floor plan you need: circular for compact spaces, oval for a longer plan, pyramidal for the most usable floor area.',
    },
    {
      question: 'What is the difference between circular, oval and pyramidal uniports?',
      answer:
        'Circular uniports are sized by diameter and are the most compact. Oval uniports stretch that circle lengthways for a longer floor plan. Pyramidal uniports have a rectangular floor and a pitched roof, giving the largest usable area and the most headroom.',
    },
    {
      question: 'Do the prices include delivery and installation?',
      answer:
        'The listed prices cover the standard unit. Delivery, site preparation and any custom doors, windows, partitions or finishes are quoted separately — contact our sales team for a full costed quote.',
    },
  ],
  priceList,
  keywords: [
    'mini homes Uganda',
    'uniport Uganda',
    'uniports Kampala',
    'prefabricated houses Uganda',
    'prefab house Kampala',
    'portable cabins Uganda',
    'guard house Uganda',
    'site office Kampala',
    'kiosk fabrication Uganda',
    'mini home prices Uganda',
    'uniport price Uganda',
    'modular housing Uganda',
  ],
};

const max = await prisma.product.aggregate({ _max: { order: true } });
const existing = await prisma.product.findUnique({ where: { slug: data.slug } });

if (existing) {
  await prisma.product.update({ where: { slug: data.slug }, data });
  console.log('Updated existing mini-homes product.');
} else {
  await prisma.product.create({ data: { ...data, order: (max._max.order ?? 0) + 1, published: true } });
  console.log('Created mini-homes product.');
}

const check = await prisma.product.findUnique({ where: { slug: data.slug } });
const groups = check.priceList;
console.log(`Price groups: ${groups.length}, rows: ${groups.reduce((n, g) => n + g.items.length, 0)}`);

await prisma.$disconnect();
