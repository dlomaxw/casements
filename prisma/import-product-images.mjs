/**
 * Copies the supplied product photo folders into web-safe paths and sets each
 * product's gallery, with a caption per image.
 *
 * Captions come from the source filenames where those are descriptive
 * (e.g. "Top-Hung Windows.png"), and from the image subject otherwise.
 * Files that don't belong (a revolving door filed under ceilings) and images
 * that aren't product photography (concept sketches) are deliberately skipped.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PUB = 'public/images/products';
const OUT = 'public/images/product-gallery';

const slug = (s) =>
  s.toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** productSlug -> { dir, items: [file, caption] } */
const SETS = {
  'aluminium-doors-and-windows': {
    dir: 'Aluminium Doors -Windows',
    items: [
      ['door.png', 'Aluminium entrance door'],
      ['door a.png', 'Aluminium door with side glazing'],
      ['windows a.png', 'Aluminium window range'],
      ['Top-Hung Windows.png', 'Top-hung aluminium window'],
      ['Top-Hung Windows 1.png', 'Top-hung window, open position'],
      ['Top-Hung Windows 3.png', 'Top-hung windows in a glazed elevation'],
      ['Sliding Doors 2.png', 'Aluminium sliding door'],
      ['Sliding Doors 3.png', 'Multi-panel sliding door system'],
      ['Pivot Doors.png', 'Aluminium pivot door'],
      ['Pivot window.png', 'Aluminium pivot window'],
      ['Pivot window 1.png', 'Pivot window, open position'],
      ['Revolving Doors 3.png', 'Aluminium revolving door'],
      ['Revolving Doors 4.png', 'Revolving door entrance'],
      ['Revolving Doors 5.png', 'Revolving door, commercial entrance'],
    ],
  },
  ceiling: {
    dir: 'Ceiling Systems',
    items: [
      ['Suspended Ceilings.png', 'Suspended ceiling system'],
      ['Suspended Ceilings (2).png', 'Suspended ceiling grid'],
      ['Acoustic Ceilings.png', 'Acoustic ceiling panels'],
      ['Acoustic Ceilings 1.png', 'Acoustic ceiling installation'],
      ['Coffered Ceilings.png', 'Coffered ceiling'],
      ['Coffered Ceilings 2.png', 'Coffered ceiling detail'],
      ['Perforated Metal Ceilings.png', 'Perforated metal ceiling'],
      ['Perforated Metal Ceilings 1.png', 'Perforated metal ceiling panels'],
      ['Perforated Metal Ceilings 2.png', 'Perforated metal ceiling, close detail'],
      ['Stretch Ceiling Systems.png', 'Stretch ceiling system'],
      // 'Revolving Doors 5.png' skipped — misfiled, it is a door not a ceiling
    ],
  },
  'curtain-wall': {
    dir: 'curtain wall',
    items: [
      ['5.unitized curtainwall.jpg', 'Unitized curtain wall'],
      ['SL50_630x630.png', 'Stick curtain wall — mullion and transom detail'],
      ['Section-through-mullion-of-conventional-unitized-curtain-wall-system-with-triple-glazed-insulated-unit.jpg', 'Section through a mullion with triple-glazed insulated unit'],
      ['the-schuco-fws-50-facade-system-aluminum-curtain-wall-elwido-108239.jpg', 'Aluminium curtain wall façade system'],
      ['Wood-based-curtain-wall-with-insulation-and-blinds.webp', 'Timber-based curtain wall with insulation and integrated blinds'],
      ['modern-high-rise-building-with-a-glass-facade-2026-01-09-01-02-53-utc.jpg', 'High-rise glass façade'],
      ['modern-architecture-with-glass-ceiling-and-metal-f-2026-01-07-07-05-29-utc.jpg', 'Structural glazing with glass roof'],
      ['installing-large-size-glass-windows-to-a-multi-com-2026-03-26-08-41-34-utc.jpg', 'Installing large-format glazing on a commercial building'],
      ['the-bergeron-centre-2-min-e1653490922452.jpg', 'Feature curtain wall elevation'],
      ['fenetre-serie-1300-regulier-fixe.png', 'Fixed glazing panel'],
    ],
  },
  partitions: {
    dir: 'Partitions',
    items: [
      ['bright-modern-meeting-room-interior-in-sleek-styl-2026-03-26-08-02-56-utc.jpg', 'Glass-partitioned meeting room'],
      ['3d-rendering-business-meeting-room-on-office-build-2026-01-06-10-41-41-utc.jpg', 'Glazed boardroom partitioning'],
      ['business-team-meeting-in-a-modern-office-space-2026-01-09-09-23-13-utc.jpg', 'Partitioned open-plan office'],
      ['empty-corridor-and-access-system-in-office-center-2026-03-24-00-00-30-utc.jpg', 'Office corridor with glazed partitions'],
      ['part-of-spacious-corridor-inside-large-contemporar-2026-03-24-03-59-29-utc.JPG', 'Full-height glass partition run'],
      ['minsk-belarus-may-23-2019-corner-of-modern-of-2026-01-08-01-15-21-utc.jpg', 'Frameless glass partition corner'],
      // skipped: 'hand-with-pen-drawing…' (a concept sketch, not a product photo)
      // skipped: 'confident-black-businesswoman-stands-mid-corridor…' (portrait, subject is the person)
    ],
  },
};

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  for (const [productSlug, set] of Object.entries(SETS)) {
    const srcDir = path.join(PUB, set.dir);
    if (!existsSync(srcDir)) {
      console.log('  ! missing folder:', srcDir);
      continue;
    }
    const destDir = path.join(OUT, productSlug);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

    const gallery = [];
    const available = readdirSync(srcDir);

    for (const [file, alt] of set.items) {
      if (!available.includes(file)) {
        console.log('  ! not found:', set.dir + '/' + file);
        continue;
      }
      const ext = path.extname(file).toLowerCase();
      const destName = slug(file) + ext;
      copyFileSync(path.join(srcDir, file), path.join(destDir, destName));
      gallery.push({ src: `/images/product-gallery/${productSlug}/${destName}`, alt });
    }

    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) {
      console.log('  ! no product:', productSlug);
      continue;
    }
    await prisma.product.update({
      where: { slug: productSlug },
      // Use the first gallery image as the main product image too, so the
      // catalogue card shows real product photography.
      data: { gallery, image: gallery[0]?.src ?? product.image, imageAlt: gallery[0]?.alt ?? product.imageAlt },
    });
    console.log(`  ${productSlug}: ${gallery.length} images`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
