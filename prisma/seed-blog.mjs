import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const posts = [
  {
    title: 'Wood & Finishes: Joinery Fitted to Your Room',
    slug: 'wood-and-finishes',
    category: 'Products',
    excerpt: 'Doors, wardrobes, TV units and cabinetry, fitted to your room by our own joinery team.',
    coverImage: '/images/blog/wood-and-finishes.png',
    body: `Wood is the finish that makes a space feel finished. Alongside our aluminium, glass and steel work, our in-house joinery team produces doors, wardrobes, TV units and cabinetry — measured, made and installed by the same people who see the job through.

Because the work is done in our own workshop, the finish matches across every element in the room: the door, the wardrobe front, the panelling and the cabinetry all read as one piece of work rather than parts bought separately.

WHAT WE MAKE IN WOOD

- Interior and entrance doors
- Fitted wardrobes and walk-in closets
- TV units and media walls
- Kitchen cabinetry
- Wall panelling and feature finishes

Every piece is cut to your actual openings, not to a standard size — so there are no filler strips or awkward gaps at the edges.

Talk to our team about your space and we'll advise on materials, finishes and what will last in Uganda's climate.`,
  },
  {
    title: 'Wardrobes & TV Units, Built In',
    slug: 'wardrobes-and-tv-units-built-in',
    category: 'Products',
    excerpt: 'Fitted to the room, not bought off a showroom floor — storage that uses every inch of wall you give it.',
    coverImage: '/images/blog/wardrobes-tv-units.png',
    body: `Freestanding furniture is made for an average room. Yours isn't average — it has a particular ceiling height, a window in a particular place, and corners that never quite match the catalogue.

Built-in wardrobes and TV units solve that. We measure the room, design around what is actually there, and build storage that uses every inch of wall you give it — floor to ceiling, wall to wall, no dead space above or beside the unit.

WHY BUILT-IN WORKS BETTER

- Uses the full height of the room, including the space most furniture wastes
- Fits around windows, beams, sloping ceilings and awkward corners
- Cable management designed in, not added afterwards
- Finishes matched to the rest of your joinery
- Fixed properly to the wall — no wobble, no tipping risk

A media wall can carry the screen, the equipment, storage and lighting in one clean run. A fitted wardrobe can hold noticeably more than a standalone unit of the same footprint.

Send us the room dimensions, or ask us to come and measure.`,
  },
  {
    title: 'Cabinetry & Partitions: The Detail Work',
    slug: 'cabinetry-and-partitions',
    category: 'Products',
    excerpt: 'Kitchen cabinetry and office partitions, finished to match the detail work that makes a space feel complete.',
    coverImage: '/images/blog/cabinetry-partitions.png',
    body: `The difference between a room that is built and a room that is finished usually comes down to detail work — how the cabinetry meets the wall, whether the partition lines up with the ceiling grid, whether the handles and edges match.

We produce kitchen cabinetry and office partitioning as part of the same fit-out, so those details line up rather than being negotiated between separate contractors on site.

KITCHEN CABINETRY

Worktops, base and wall units, tall units and pantry storage — laid out around how the kitchen is actually used, with appliance spaces set to the units you're installing.

OFFICE PARTITIONS

Aluminium and glass partitioning to divide open floors into offices, meeting rooms and boardrooms without losing daylight. We also fabricate solid and board partitions where privacy or acoustics matter more than light.

Because we handle the aluminium, glass and wood ourselves, a glazed partition and the joinery beside it are finished to the same standard and delivered on the same programme.

Contact our team to plan a kitchen or an office fit-out.`,
  },
];

async function main() {
  let created = 0;
  for (const p of posts) {
    const existing = await prisma.post.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log('  skip (exists):', p.slug);
      continue;
    }
    await prisma.post.create({
      data: { ...p, status: 'PUBLISHED', publishedAt: new Date() },
    });
    created += 1;
    console.log('  created:', p.slug);
  }
  console.log('created', created, '| total posts:', await prisma.post.count());
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
