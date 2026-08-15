/**
 * Keyword sets harvested from a competitor audit (August 2026) of:
 *   fabrimart.ug · furniture.ug · italaluminium.com · aluminiumug.com
 *   giantuganda.co.ug · euraluminltd.com
 *
 * These are the terms competitors put in their headings, navigation and product
 * names that we were not using anywhere on the site. They are attached to page
 * metadata and reused in visible copy where the term genuinely describes work we
 * do — never stuffed into hidden markup.
 *
 * Spelling variants matter here: Ugandan searchers and our competitors use
 * "curtain walling", "burglar proofing", "balustrade" and "aluminium" (never
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
  'aluminium-doors-and-windows': [
    'aluminium doors Uganda',
    'aluminium windows Kampala',
    'casement windows Uganda',
    'sliding windows Uganda',
    'sliding doors Kampala',
    'tilt and turn windows Uganda',
    'awning windows Uganda',
    'top hung windows Kampala',
    'projected windows Uganda',
    'side hung windows Uganda',
    'pivot doors Uganda',
    'swing doors Kampala',
    'sliding folding doors Uganda',
    'french doors Uganda',
    'double glazed windows Uganda',
    'powder coated aluminium windows Kampala',
    'thermal break windows Uganda',
    'shop fronts Uganda',
    'aluminium window prices Uganda',
  ],
  ceiling: [
    'suspended ceiling Uganda',
    'acoustic ceiling Kampala',
    'gypsum ceiling Uganda',
    'aluminium ceiling Uganda',
    'ceiling installation Kampala',
    'false ceiling Uganda',
    'stretch ceiling Kampala',
  ],
  'curtain-wall': [
    'curtain wall Uganda',
    'curtain walling Kampala',
    'structural glazing Uganda',
    'glass facade Uganda',
    'commercial glazing Kampala',
    'spider glazing Uganda',
    'unitised curtain wall Uganda',
    'glass curtain wall prices Uganda',
  ],
  facade: [
    'ACP cladding Uganda',
    'aluminium composite panel Kampala',
    'facade Kampala',
    'wall cladding Uganda',
    'building facade contractors Uganda',
    'aluminium cladding Kampala',
    'sky dome Uganda',
    'glass canopy Kampala',
    'louvers Uganda',
    'aluminium louvres Kampala',
  ],
  partitions: [
    'glass partitions Uganda',
    'office partitions Kampala',
    'aluminium partitions Uganda',
    'frameless glass partitions Kampala',
    'demountable partitions Uganda',
    'office fit out partitions Uganda',
    'toilet cubicles Uganda',
  ],
  'glass-products': [
    'glass products Uganda',
    'glass doors Uganda',
    'frameless glass Kampala',
    'shower doors Uganda',
    'shower cubicles Kampala',
    'tempered glass Uganda',
    'toughened glass Kampala',
    'laminated glass Uganda',
    'mirrors Uganda',
    'glass installation Kampala',
  ],
  'interior-design': [
    'interior design Kampala',
    'office fit-out Uganda',
    'interior fit out contractors Uganda',
    'wooden doors Uganda',
    'panel doors Kampala',
    'wardrobes Uganda',
    'kitchen fittings Kampala',
    'office furniture fit out Uganda',
  ],
  railings: [
    'stainless steel railings Uganda',
    'glass balustrade Kampala',
    'balustrades Uganda',
    'handrails Uganda',
    'staircase railings Kampala',
    'balcony railings Uganda',
    'modern rails Uganda',
    'CNC laser cut railings Kampala',
    'stainless steel handrail prices Uganda',
  ],
  'steel-products': [
    'steel grills Uganda',
    'burglar proofing Kampala',
    'burglarproof Uganda',
    'security doors Uganda',
    'steel doors Kampala',
    'wrought iron gates Uganda',
    'sliding gates Kampala',
    'swing gates Uganda',
    'garage doors Uganda',
    'fence grill Kampala',
    'steel windows Uganda',
    'Trellidor Uganda',
    'mosquito nets for windows Uganda',
  ],
};

/** Merge core terms with a product's own set, de-duplicated, order preserved. */
export function keywordsFor(slug: string, extra: string[] = []): string[] {
  return Array.from(new Set([...extra, ...(PRODUCT_KEYWORDS[slug] ?? []), ...CORE_KEYWORDS]));
}
