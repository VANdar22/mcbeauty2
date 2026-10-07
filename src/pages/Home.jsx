import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/Productcard";

/* ------------------------------------------------------------------ */
/* 1. DATABASE — one call returns every product for the home page.     */
/*    Each product has a `collection` that decides which section it    */
/*    appears in: "best-offers" | "new-in" | "deals"                   */
/*    Shape: { id, name, price, currency, category, image, collection }*/
/* ------------------------------------------------------------------ */

async function fetchHomeProducts() {
  // TODO: replace with your database call, e.g.
  // const res = await fetch("/api/home-products"); return res.json();
  const make = (collection, n) =>
    Array.from({ length: n }, (_, i) => ({
      id: `${collection}-${i + 1}`,
      name: "Product name",
      price: 20 + i * 7,
      currency: "$",
      category: ["skincare", "perfume", "hair"][i % 3],
      image: null,
      collection,
    }));
  return [...make("best-offers", 4), ...make("new-in", 4), ...make("deals", 4)];
}

/* ------------------------------------------------------------------ */
/* 2. PAGE LAYOUT — sections render in this order. A banner sits       */
/*    between sections: BANNERS[0] after section 1, BANNERS[1] after   */
/*    section 2, and so on. Add/remove entries freely.                 */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  { key: "best-offers", eyebrow: "Don't miss out", title: "Best offers" },
  { key: "new-in", eyebrow: "Just landed", title: "New in" },
  { key: "deals", eyebrow: "Limited time", title: "Deals available" },
];

// TODO: edit by hand, or load from your database / CMS.
const BANNERS = [
  {
    tag: "Limited time",
    title: "Up to 30% off",
    text: "Select skincare, perfume and hair care. Find your favourites.",
    ctaLabel: "Shop all",
    ctaHref: "/products",
    image: null, // add an image URL to show a picture on the right
    className: "bg-primary text-primary-foreground",
  },
  {
    tag: "New drops",
    title: "Fresh arrivals every week",
    text: "Be the first to try what's new.",
    ctaLabel: "Explore new in",
    ctaHref: "/products?sort=new",
    image: null,
    className: "bg-foreground text-background",
  },
];

/* ------------------------------------------------------------------ */
/* 3. SMALL PIECES (kept in this file on purpose)                      */
/* ------------------------------------------------------------------ */

function ProductSection({ section, products, loading, error }) {
  if (!loading && !error && products.length === 0) return null; // hide empty sections

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 md:px-8 md:pt-20">
      <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">{section.eyebrow}</p>
          <h2 className="mt-1 text-xl font-medium tracking-wide md:text-3xl">{section.title}</h2>
        </div>
        <Link
          to={`/products?collection=${section.key}`}
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          View all
        </Link>
      </div>

      {error ? (
        <p className="text-muted-foreground">Couldn’t load products. Please refresh.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-8 md:gap-y-12">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse bg-muted" aria-hidden="true" />
              ))
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}

function Banner({ tag, title, text, ctaLabel, ctaHref = "/", image, className }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 md:px-8 md:pt-20">
      <div className={`grid overflow-hidden rounded-lg ${image ? "md:grid-cols-2" : ""} ${className}`}>
        <div className="flex flex-col items-start justify-center gap-3 p-6 md:gap-4 md:p-14">
          {tag && <span className="bg-background px-2 py-1 text-xs font-medium text-foreground">{tag}</span>}
          <h2 className="text-3xl font-semibold leading-tight md:text-5xl">{title}</h2>
          {text && <p className="max-w-md text-sm md:text-base">{text}</p>}
          {ctaLabel && (
            <Link
              to={ctaHref}
              className="inline-flex items-center gap-2 font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {ctaLabel}
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          )}
        </div>
        {image && (
          <div className="min-h-[200px] md:min-h-[320px]">
            <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. THE PAGE                                                         */
/* ------------------------------------------------------------------ */

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchHomeProducts()
      .then((data) => !cancelled && setProducts(data))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pb-16 md:pb-24">
        <HeroSection />

        {SECTIONS.map((section, i) => (
          <Fragment key={section.key}>
            <ProductSection
              section={section}
              products={products.filter((p) => p.collection === section.key)}
              loading={loading}
              error={error}
            />
            {BANNERS[i] && <Banner {...BANNERS[i]} />}
          </Fragment>
        ))}
      </main>

    </div>
  );
};

export default Home;