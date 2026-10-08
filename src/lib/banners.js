const CLOUD = "https://res.cloudinary.com/zomqdsfa/image/upload";
const COSMOS = `${CLOUD}/v1791440784`;

// Used when nothing more specific matches.
const DEFAULT_BANNER = `${CLOUD}/v1791440783/cosmos_508605237.webp`;

// Shown when the page is filtered to one category.
const CATEGORY_BANNERS = {
  skincare: `${CLOUD}/w_1600,q_auto,f_auto/v1791387398/skin2.webp`,
  hair: `${CLOUD}/w_1600,q_auto,f_auto/v1791387396/hair1.webp`,
  perfume: `${CLOUD}/w_1600,q_auto,f_auto/v1791387397/perfume1.webp`,
};

// Shown for ?collection=best-offers, new-in or deals.
const COLLECTION_BANNERS = {
  "best-offers": `${CLOUD}/v1791440785/cosmos_518142604.webp`,
  "new-in": `${COSMOS}/cosmos_739864427.webp`,
  deals: `${COSMOS}/cosmos_825163157.webp`,
};

// Shown when the page is filtered to one brand. Key = brand slug (lowercase, dashes).
// Give a list to rotate between several banners (one is picked each visit).
const BRAND_BANNERS = {
  olay: [
    `${CLOUD}/v1791387398/olay1.webp`,
    `${CLOUD}/v1791387398/olay.webp`,
  ],
  "the-ordinary": [`${CLOUD}/v1791387398/ordinary1.webp`],
  cerave: [`${CLOUD}/v1791387396/skin1.webp`],
};

const pickOne = (value) => {
  const list = [].concat(value ?? []).filter(Boolean);
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
};

// Priority: brand, then collection, then category, then the default.
export function getBanner({ brand, collection, category } = {}) {
  return (
    pickOne(BRAND_BANNERS[brand]) ??
    COLLECTION_BANNERS[collection] ??
    CATEGORY_BANNERS[category] ??
    DEFAULT_BANNER
  );
}