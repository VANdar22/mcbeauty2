// Test catalog + query layer. Same shape your real API/DB should return.
// Swap the body of queryProducts / searchProducts for a fetch() later:
//   const res = await fetch(`/api/products?${new URLSearchParams(params)}`);

const DAY = 86_400_000;
const ago = (d) => Date.now() - d * DAY;
const ahead = (d) => Date.now() + d * DAY;

/* ------------------------------------------------------------------
   IMAGES
   A product shows the first image it finds, in this order:
     1. its own `image`
     2. a brand image (BRAND_IMAGES)
     3. a default for its category (CATEGORY_IMAGES)
   Each entry can be one URL or a list. With a list, products get a
   steady pick from it, so the grid isn't the same picture repeated.
------------------------------------------------------------------ */

const CLOUD = "https://res.cloudinary.com/zomqdsfa/image/upload/w_600,q_auto,f_auto";

export const CATEGORY_IMAGES = {
  skincare: [`${CLOUD}/v1791387398/skin2.webp`],
  hair: [`${CLOUD}/v1791387396/hair1.webp`],
  perfume: [`${CLOUD}/v1791387397/perfume1.webp`],
};

// Keyed by brand slug (lowercase, dashes). Add the brands you have photos for, e.g.:
//   cerave: [`${CLOUD}/v123/cerave1.webp`, `${CLOUD}/v123/cerave2.webp`],
//   "mc-beauty": [`${CLOUD}/v123/mc-beauty.webp`],
export const BRAND_IMAGES = {};

// helper: id, name, brand, category, type, price, extras
const p = (id, name, brand, category, type, price, extra = {}) => ({
  id, name, brand, category, type, price,
  currency: "$",
  image: null,                 // set a URL here to override brand and category images
  description: `${brand} · ${type}`,
  compareAtPrice: null,        // original price when discounted
  stock: 20,
  shipsReady: true,
  unitsSold: 0,
  createdAt: ago(90),
  restockedAt: null,
  releaseDate: null,           // future date => "coming soon"
  dealEndsAt: null,            // future date => limited-time deal
  ...extra,
});

const CATALOG = [
  p("s1", "Gentle Foaming Cleanser", "CeraVe", "skincare", "cleansers", 16, { unitsSold: 940 }),
  p("s2", "Hydrating Facial Cleanser", "Cetaphil", "skincare", "cleansers", 14, { unitsSold: 610, compareAtPrice: 18, dealEndsAt: ahead(3) }),
  p("s3", "Niacinamide 10% Serum", "The Ordinary", "skincare", "serums", 12, { unitsSold: 1200, createdAt: ago(5) }),
  p("s4", "Vitamin C Brightening Serum", "Neutrogena", "skincare", "serums", 28, { unitsSold: 300, createdAt: ago(3), shipsReady: false }),
  p("s5", "Daily Moisturizing Lotion", "CeraVe", "skincare", "moisturizers", 18, { unitsSold: 880, restockedAt: ago(4) }),
  p("s6", "Regenerist Night Cream", "Olay", "skincare", "moisturizers", 32, { unitsSold: 420, compareAtPrice: 42, dealEndsAt: ahead(5) }),
  p("s7", "Ultra Sheer Sunscreen SPF 50", "Neutrogena", "skincare", "sunscreen", 15, { unitsSold: 760, compareAtPrice: 20 }),
  p("s8", "Soothing Body Oil", "Palmer's", "skincare", "body oils", 11, { stock: 0, restockedAt: null }),
  p("h1", "Repair Shampoo", "NIVEA", "hair", "shampoo", 9, { unitsSold: 500, createdAt: ago(10), compareAtPrice: 12 }),
  p("h2", "Deep Conditioning Hair Mask", "Palmer's", "hair", "treatments", 13, { unitsSold: 250, createdAt: ago(20), dealEndsAt: ahead(2), compareAtPrice: 17 }),
  p("p1", "Amber Rose Eau de Parfum", "MC Beauty", "perfume", "eau de parfum", 45, { unitsSold: 700, createdAt: ago(2) }),
  p("p2", "Fresh Linen Body Mist", "MC Beauty", "perfume", "body mist", 22, { unitsSold: 190, createdAt: ago(25), compareAtPrice: 30 }),
  p("p3", "Oud Noir Eau de Parfum", "MC Beauty", "perfume", "eau de parfum", 58, { stock: 0, releaseDate: ahead(14), createdAt: ahead(14) }),
  p("h3", "Scalp Serum", "NIVEA", "hair", "treatments", 19, { stock: 0, releaseDate: ahead(7), createdAt: ahead(7) }),
];

const discountPct = (x) => (x.compareAtPrice ? Math.round((1 - x.price / x.compareAtPrice) * 100) : 0);
const within = (t, days) => t != null && t <= Date.now() && t >= ago(days);
const isComingSoon = (x) => x.releaseDate != null && x.releaseDate > Date.now();

// Steady pick from a list (same product always gets the same image).
function pick(list, key) {
  const urls = [].concat(list ?? []).filter(Boolean);
  if (urls.length === 0) return null;
  let hash = 0;
  for (const ch of String(key)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return urls[hash % urls.length];
}

const resolveImage = (x) =>
  x.image ?? pick(BRAND_IMAGES[slugify(x.brand)], x.id) ?? pick(CATEGORY_IMAGES[x.category], x.id) ?? null;

// Badge and image are derived, never stored, so they can't go stale.
function withBadge(x) {
  let badge;
  if (isComingSoon(x)) badge = "Coming soon";
  else if (x.unitsSold >= 800) badge = "Bestseller";
  else if (within(x.createdAt, 14)) badge = "New";
  else if (within(x.restockedAt, 14)) badge = "Back in stock";
  else if (discountPct(x) >= 10) badge = `-${discountPct(x)}%`;
  return { ...x, image: resolveImage(x), badge };
}

const FILTERS = {
  "in-stock": (x) => x.stock > 0,
  "ready-to-ship": (x) => x.stock > 0 && x.shipsReady,
  restocked: (x) => within(x.restockedAt, 30),
  "coming-soon": isComingSoon,
};

const COLLECTIONS = {
  "best-offers": (x) => discountPct(x) >= 15,
  "new-in": (x) => within(x.createdAt, 30),
  deals: (x) => x.dealEndsAt != null && x.dealEndsAt > Date.now(),
};

const SORTS = {
  new: (a, b) => b.createdAt - a.createdAt,
  "best-selling": (a, b) => b.unitsSold - a.unitsSold,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  discount: (a, b) => discountPct(b) - discountPct(a),
};

// Default sort per collection so each home section is ordered sensibly.
const COLLECTION_SORT = { "best-offers": "discount", "new-in": "new", deals: "discount" };

/**
 * params come straight from the URL: ?collection=&sort=&filter=&range=&category=
 */
const list = (v) => (v ? String(v).split(",").filter(Boolean) : []);
export const slugify = (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Brands and categories (with counts) for filter panels and the Brands page. */
export function getFacets() {
  const live = CATALOG.filter((x) => !isComingSoon(x));
  const tally = (get) => {
    const map = new Map();
    live.forEach((x) => map.set(get(x), (map.get(get(x)) ?? 0) + 1));
    return [...map.entries()];
  };
  return {
    brands: tally((x) => x.brand)
      .map(([name, count]) => ({ name, slug: slugify(name), count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    categories: tally((x) => x.category).map(([slug, count]) => ({ slug, count })),
    types: [
      ...new Map(
        live.map((x) => [
          slugify(x.type),
          { name: x.type[0].toUpperCase() + x.type.slice(1), slug: slugify(x.type), category: x.category },
        ])
      ).values(),
    ],
  };
}

export async function queryProducts({ collection, sort, filter, range, category, brand, type, instock, limit = 24 } = {}) {
  let items = CATALOG.filter((x) => (filter === "coming-soon" ? isComingSoon(x) : !isComingSoon(x)));

  // category and brand accept comma lists: ?brand=cerave,olay
  if (category) {
    const c = list(category);
    items = items.filter((x) => c.includes(x.category));
  }
  if (brand) {
    const b = list(brand);
    items = items.filter((x) => b.includes(slugify(x.brand)));
  }
  if (type) {
    const t = list(type);
    items = items.filter((x) => t.includes(slugify(x.type)));
  }
  if (instock) items = items.filter((x) => x.stock > 0);
  if (collection && COLLECTIONS[collection]) items = items.filter(COLLECTIONS[collection]);
  if (filter && FILTERS[filter]) items = items.filter(FILTERS[filter]);
  if (range === "week") items = items.filter((x) => within(x.createdAt, 7));

  const sortKey = sort ?? COLLECTION_SORT[collection] ?? "best-selling";
  items = [...items].sort(SORTS[sortKey] ?? SORTS["best-selling"]);

  return items.slice(0, limit).map(withBadge);
}

export async function searchProducts(query, limit = 12) {
  const tokens = String(query).toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  return CATALOG.filter((x) => !isComingSoon(x))
    .filter((x) => {
      const hay = `${x.name} ${x.brand} ${x.category} ${x.type}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    })
    .sort(
      (a, b) =>
        Number(b.name.toLowerCase().startsWith(tokens[0])) -
        Number(a.name.toLowerCase().startsWith(tokens[0]))
    )
    .slice(0, limit)
    .map(withBadge);
}