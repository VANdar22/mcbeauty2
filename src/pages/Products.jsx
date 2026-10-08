import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/Productcard";
import { queryProducts, getFacets } from "../lib/Catalog";
import { getBanner } from "../lib/banners";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const heading = "text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground";

const SORTS = [
  ["best-selling", "Best selling"],
  ["new", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["discount", "Biggest discount"],
];

const CATEGORY_LABELS = { skincare: "Skincare", perfume: "Perfume", hair: "Hair product" };

const COLLECTION_TITLES = { "best-offers": "Best offers", "new-in": "New in", deals: "Deals available" };
const FILTER_TITLES = {
  restocked: "Back in stock",
  "coming-soon": "Coming soon",
  "in-stock": "In stock now",
  "ready-to-ship": "Ready to ship",
};

const csv = (v) => (v ? v.split(",").filter(Boolean) : []);

export default function Products() {
  const [params, setParams] = useSearchParams();
  const facets = useMemo(() => getFacets(), []);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const query = params.toString();
  const brands = csv(params.get("brand"));
  const categories = csv(params.get("category"));
  const types = csv(params.get("type"));
  const sort = params.get("sort") ?? "";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    queryProducts({ ...Object.fromEntries(new URLSearchParams(query)), limit: 100 })
      .then((data) => !cancelled && setProducts(data))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const toggleIn = (key, current, value) =>
    setParam(key, (current.includes(value) ? current.filter((v) => v !== value) : [...current, value]).join(","));

  const title = (() => {
    if (brands.length === 1) return facets.brands.find((b) => b.slug === brands[0])?.name ?? "Products";
    if (types.length === 1) return facets.types.find((t) => t.slug === types[0])?.name ?? "Products";
    if (params.get("collection")) return COLLECTION_TITLES[params.get("collection")] ?? "Products";
    if (params.get("filter")) return FILTER_TITLES[params.get("filter")] ?? "Products";
    if (sort === "new") return "New in";
    if (sort === "best-selling") return "Best sellers";
    if (categories.length === 1) return CATEGORY_LABELS[categories[0]] ?? "Products";
    return "All products";
  })();

  const bannerBrand = brands.length === 1 ? brands[0] : null;
  const bannerCategory = categories.length === 1 ? categories[0] : null;
  const bannerCollection = params.get("collection");
  const banner = useMemo(
    () => getBanner({ brand: bannerBrand, collection: bannerCollection, category: bannerCategory }),
    [bannerBrand, bannerCollection, bannerCategory]
  );

  const activeCount = brands.length + categories.length + types.length + (params.get("instock") ? 1 : 0);

  const clearFilters = () => {
    const next = new URLSearchParams(params);
    ["brand", "category", "type", "instock"].forEach((k) => next.delete(k));
    setParams(next, { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6 md:px-8">
      <div className="relative flex h-40 items-end overflow-hidden md:h-56">
        <img src={banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <h1 className="relative p-5 text-3xl font-medium tracking-tight text-black md:p-8 md:text-5xl">
          {title}
        </h1>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {loading ? "Loading…" : `${products.length} ${products.length === 1 ? "product" : "products"}`}
        </p>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            className={`text-sm font-medium underline underline-offset-4 lg:hidden ${focusRing}`}
          >
            Filters{activeCount ? ` (${activeCount})` : ""}
          </button>

          <label className="flex items-center gap-3 text-sm">
            <span className={heading}>Sort</span>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className={`cursor-pointer border-b border-foreground/40 bg-transparent py-1 pr-2 ${focusRing}`}
            >
              <option value="">Featured</option>
              {SORTS.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className={`${panelOpen ? "block" : "hidden"} space-y-8 lg:block`} aria-label="Filters">
          <fieldset>
            <legend className={heading}>Category</legend>
            <div className="mt-3 space-y-2">
              {facets.categories.map(({ slug, count }) => (
                <label key={slug} className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={categories.includes(slug)}
                    onChange={() => toggleIn("category", categories, slug)}
                    className="h-4 w-4 accent-foreground"
                  />
                  {CATEGORY_LABELS[slug] ?? slug}
                  <span className="text-muted-foreground">({count})</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={heading}>Brand</legend>
            <div className="mt-3 space-y-2">
              {facets.brands.map(({ slug, name, count }) => (
                <label key={slug} className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={brands.includes(slug)}
                    onChange={() => toggleIn("brand", brands, slug)}
                    className="h-4 w-4 accent-foreground"
                  />
                  {name}
                  <span className="text-muted-foreground">({count})</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={Boolean(params.get("instock"))}
              onChange={(e) => setParam("instock", e.target.checked ? "1" : "")}
              className="h-4 w-4 accent-foreground"
            />
            In stock only
          </label>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className={`text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground ${focusRing}`}
            >
              Clear all filters
            </button>
          )}
        </aside>

        <div className="min-w-0">
          {error ? (
            <p className="text-muted-foreground">Couldn&apos;t load products. Please refresh.</p>
          ) : loading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse bg-muted" aria-hidden="true" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try removing a filter.</p>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`mt-5 border border-foreground px-6 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background ${focusRing}`}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}