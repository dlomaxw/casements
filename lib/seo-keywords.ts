/**
 * Keyword sets harvested from a competitor audit (August 2026) of:
 *   fabrimart.ug · furniture.ug · italaluminium.com · aluminiumug.com
 *   giantuganda.co.ug · euraluminltd.com
 *
 * RULE: every term here must map to something we actually fabricate — check it
 * against the product's `subItems` before adding. Competitor terms for services
 * we don't offer (gates other than steel gates, garage doors, shower doors,
 * mosquito nets, louvers, wardrobes, furniture) are deliberately absent: they
 * pull in enquiries we have to turn away and dilute the pages that do convert.
 *
 * Spelling variants matter: Ugandan searchers and our competitors write
 * "curtain walling", "burglar proofing", "balustrades" and "aluminium" (never
 * "aluminum"), so both forms are carried where the variant is common.
 */

// Terms every page can legitimately carry — brand, trade and geography.
export const CORE_KEYWORDS = [
  'aluminium fabrication Uganda',
  'aluminium company Uganda',
  'aluminium works Kampala',
  'aluminium and glass Uganda',
  'steel fabrication Kampala',
  'aluminium fabricators Kampala',
  'windows and doors Uganda',
  'glass and aluminium contractors Uganda',
  'architectural aluminium East Africa',
  'Casements Africa',
];

// Per-product-slug keyword sets. Keys match Product.slug.
export const PRODUCT_KEYWORDS: Record<string, string[]> = {
  // subItems: Bi-Fold Doors, Sliding Doors & Windows, Side-Hung Casements,
  // Pivot Doors, Revolving Doors, Fixed Panels, Top-Hung Windows
  'aluminium-doors-and-windows': [
    'aluminium doors Uganda',
    'aluminium windows Kampala',
    'casement windows Uganda',
    'side hung windows Uganda',
    'sliding windows Uganda',
    'sliding doors Kampala',
    'top hung windows Kampala',
    'projected windows Uganda',
    'awning windows Uganda', // synonym of top-hung
    'bi-fold doors Uganda',
    'sliding folding doors Uganda', // synonym of bi-fold
    'pivot doors Uganda',
    'revolving doors Kampala',
    'double glazed windows Uganda',
    'powder coated aluminium windows Kampala',
    'aluminium window prices Uganda',
  ],
  // subItems: Suspended, Coffered, Stretch, Acoustic, Perforated Metal Ceilings
  ceiling: [
    'suspended ceiling Uganda',
    'acoustic ceiling Kampala',
    'false ceiling Uganda', // synonym of suspended
    'stretch ceiling Kampala',
    'coffered ceiling Uganda',
    'perforated metal ceiling Uganda',
    'ceiling installation Kampala',
  ],
  // subItems: Unitized, Semi-Unitized, Stick Curtain Wall, Spider Glazing
  'curtain-wall': [
    'curtain wall Uganda',
    'curtain walling Kampala',
    'structural glazing Uganda',
    'glass facade Uganda',
    'commercial glazing Kampala',
    'spider glazing Uganda',
    'unitised curtain wall Uganda',
    'stick curtain wall Kampala',
    'glass curtain wall prices Uganda',
  ],
  // subItems: ACP Cladding, Solid Aluminium Board, Aluminium Fins, Sun Shading
  facade: [
    'ACP cladding Uganda',
    'aluminium composite panel Kampala',
    'facade Kampala',
    'wall cladding Uganda',
    'aluminium cladding Kampala',
    'building facade contractors Uganda',
    'aluminium fins Uganda',
    'brise soleil Kampala',
    'sun shading aluminium Uganda',
  ],
  // subItems: Frameless Glass, Aluminium Office, Demountable Partitions
  partitions: [
    'glass partitions Uganda',
    'office partitions Kampala',
    'aluminium partitions Uganda',
    'frameless glass partitions Kampala',
    'demountable partitions Uganda',
    'office fit out partitions Uganda',
  ],
  // subItems: Double-Glazed Units, Laminated Safety Glass, Frameless Glass,
  // Sand-Blasted & Etched Glass, Glass Skylights
  'glass-products': [
    'glass products Uganda',
    'glass doors Uganda',
    'frameless glass Kampala',
    'laminated safety glass Uganda',
    'double glazed units Kampala',
    'sandblasted glass Uganda',
    'etched glass Kampala',
    'glass skylights Uganda',
    'glass installation Kampala',
  ],
  // subItems: Office Fit-Outs, Reception Counters & Feature Walls, Shopfronts,
  // Mini Homes & Modular Spaces
  'interior-design': [
    'interior design Kampala',
    'office fit-out Uganda',
    'interior fit out contractors Uganda',
    'shopfronts Uganda',
    'shop fronts Kampala',
    'reception counters Uganda',
    'feature walls Kampala',
    'modular spaces Uganda',
  ],
  // subItems: Stainless Steel Railings, Frameless Glass Balustrades,
  // Staircase Handrails, Balcony Railings
  railings: [
    'stainless steel railings Uganda',
    'glass balustrade Kampala',
    'balustrades Uganda',
    'handrails Uganda',
    'staircase railings Kampala',
    'staircase handrails Uganda',
    'balcony railings Uganda',
    'stainless steel handrail prices Uganda',
  ],
  // subItems: Steel Gates, Burglar-Proofing & Window Grills, Roller Shutters,
  // Sliding Grilles, Trellidor Systems
  'steel-products': [
    'steel grills Uganda',
    'burglar proofing Kampala',
    'burglarproof Uganda',
    'window grills Uganda',
    'steel gates Uganda',
    'roller shutters Kampala',
    'sliding grilles Uganda',
    'Trellidor Uganda',
    'steel fabrication Uganda',
  ],
};

/** Merge core terms with a product's own set, de-duplicated, order preserved. */
export function keywordsFor(slug: string, extra: string[] = []): string[] {
  return Array.from(new Set([...extra, ...(PRODUCT_KEYWORDS[slug] ?? []), ...CORE_KEYWORDS]));
}
