// Adds (or refreshes) the Door Hardware product line.
//
// Copy condensed from the Casements Door Hardware brochure. Finishes and
// materials in the FAQ are taken from the labelled display board photo
// (zinc alloy lever handles, stainless steel escutcheons and caps), not
// invented — the board is the reference for what is actually stocked.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Neon scales its compute to zero when idle, so the first query after a quiet
// spell can fail while it wakes. Retry rather than making this a manual re-run.
async function retry(fn, attempts = 6) {
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

const gallery = [
  { src: `${G}/handles-and-accessories-board.jpg`, alt: 'Lever handle and accessory range' },
  { src: `${G}/hardware-specification-board.jpg`, alt: 'Finishes, materials and specifications' },
  { src: `${G}/marina-lock-set-front.jpg`, alt: 'Marina sliding door lock set' },
  { src: `${G}/marina-lock-set-mechanism.jpg`, alt: 'Marina lock internal mechanism' },
];

const longDescription = [
  'A door is several components working together: the handle decides how it feels to use, the lock protects what is behind it, the hinges carry its weight, the closer controls its movement and the cylinder controls access. We supply and fit the complete package.',
  'Our architectural hardware suits aluminium, timber, steel, glass and composite door systems across residential, commercial, hospitality, institutional and industrial projects — from a single replacement handle to a full schedule for a development.',
  'The range covers lever and pull handles, mortise locks, euro-profile cylinders, hinges, door closers, floor springs, panic exit devices, glass door fittings, sliding door gear, multipoint locking, smart and electronic locks, privacy and bathroom hardware, escutcheons, thumb turns, flush bolts, door stoppers, viewers and accessories.',
  'Finishes run from matte black and satin nickel through polished and satin chrome, polished and satin gold, antique bronze, rose gold, gunmetal, brushed brass and stainless steel, so hardware can be coordinated with your aluminium frames, glass and interior finishes rather than chosen in isolation.',
  'Getting the specification right matters as much as the product. Door material, door weight, how often it is used, the security level required, exposure to weather and any fire or emergency-exit requirements all change what should be fitted. Our team advises on the selection and installs it correctly, because even premium hardware performs badly when it is fitted badly.',
].join('\n\n');

const faqs = [
  {
    question: 'Do you supply hardware for aluminium, glass, timber and steel doors?',
    answer:
      'Yes — all four, plus composite and sliding systems. Aluminium doors typically take multipoint locks, euro cylinders and matching lever sets. Glass doors need patch fittings, floor springs, glass locks and pivots. Timber doors take mortise locks, butt or concealed hinges and privacy hardware. Steel doors take heavy-duty handles, locks and commercial-grade exit devices. Tell us the door type and we will specify to suit it.',
  },
  {
    question: 'What finishes are available?',
    answer:
      'Matte black, polished chrome, satin chrome, satin nickel, polished gold, satin gold, antique bronze, rose gold, gunmetal, brushed brass and stainless steel. Handle sets, escutcheons, cylinder caps, thumb turns and stoppers can all be matched in the same finish so a door reads as one piece rather than assembled parts.',
  },
  {
    question: 'What is a multipoint lock, and do I need one?',
    answer:
      'A multipoint lock secures the door at several heights at once — a central lock plus top and bottom locking points, using hook bolts, roller cams or shoot bolts. Besides the obvious security gain, it pulls the door evenly against its seals, which improves weather sealing and stops tall doors flexing. Worth specifying on aluminium entrance doors and any large or exposed entrance.',
  },
  {
    question: 'What is the difference between a door closer and a floor spring?',
    answer:
      'A door closer mounts on the door and frame and returns the door to closed — surface-mounted, or concealed for a cleaner look. A floor spring sits hidden in the floor and carries the door as well as closing it, which is what heavy frameless glass and double-action entrance doors need. Both offer adjustable closing and latching speed; floor springs also allow hold-open.',
  },
  {
    question: 'Can you supply smart locks and access control?',
    answer:
      'Yes. Smart locks can support PIN, card, fingerprint, mobile app and temporary access codes. We also supply electronic strike locks and magnetic locks that work with access-control readers using cards, key fobs, biometrics, keypads or mobile credentials. Power and control requirements need to be confirmed during design, so raise it early.',
  },
  {
    question: 'What hardware do fire and emergency exit doors need?',
    answer:
      'Emergency exits need panic bars or push pads so anyone can open the door quickly under pressure, and outside access devices where controlled entry is also required. Fire-rated doors need approved compatible hardware, including closers. Selection must comply with the fire, safety and building regulations applying to your project — we specify against those requirements rather than on appearance.',
  },
  {
    question: 'How should door hardware be maintained?',
    answer:
      'Clean with a soft cloth only — no abrasives and no strongly corrosive chemicals, which strip finishes. Periodically check fixing screws, lubricate moving parts, and check the door is still hanging true, since misalignment is what wears locks and hinges. Closers and floor springs should be serviced when their action changes. Exterior hardware needs attention more often.',
  },
];

const data = {
  slug: 'door-hardware',
  title: 'Door Hardware',
  shortTitle: 'Hardware',
  type: 'Hardware',
  description:
    'Lever and pull handles, mortise locks, cylinders, hinges, closers, floor springs, glass fittings and smart locks — supplied and fitted in a full range of architectural finishes.',
  longDescription,
  image: `${G}/handles-and-accessories-board.jpg`,
  imageAlt: 'Architectural door hardware range by Casements Africa',
  subItems: [
    'Lever Handles',
    'Pull Handles',
    'Mortise Locks',
    'Euro Profile Cylinders',
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
  ],
  faqs,
  keywords: [
    'door hardware Uganda',
    'door handles Kampala',
    'lever handles Uganda',
    'pull handles Kampala',
    'mortise locks Uganda',
    'door locks Kampala',
    'euro cylinder Uganda',
    'door closers Uganda',
    'floor springs Kampala',
    'panic bars Uganda',
    'glass door fittings Uganda',
    'multipoint lock Uganda',
    'smart locks Kampala',
    'door hinges Uganda',
    'architectural hardware Uganda',
  ],
};

const existing = await retry(() => prisma.product.findUnique({ where: { slug: data.slug } }));
if (existing) {
  await retry(() => prisma.product.update({ where: { slug: data.slug }, data: { ...data, gallery } }));
  console.log('Updated door-hardware.');
} else {
  const max = await retry(() => prisma.product.aggregate({ _max: { order: true } }));
  await retry(() =>
    prisma.product.create({ data: { ...data, gallery, order: (max._max.order ?? 0) + 1, published: true } }),
  );
  console.log('Created door-hardware.');
}

const rep = await retry(() => prisma.user.findUnique({ where: { email: 'sales@casements.co.ug' } }));
if (rep && !(await retry(() => prisma.repProductMap.findUnique({ where: { category: data.slug } })))) {
  await retry(() => prisma.repProductMap.create({ data: { category: data.slug, userId: rep.id } }));
  console.log(`Mapped door-hardware -> ${rep.name}`);
}

const p = await retry(() => prisma.product.findUnique({ where: { slug: data.slug } }));
console.log(
  `gallery: ${p.gallery.length} · faqs: ${p.faqs.length} · subItems: ${p.subItems.length} · keywords: ${p.keywords.length}`,
);
await prisma.$disconnect();
