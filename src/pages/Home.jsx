import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import ProductCard from "../components/Productcard";
import ProductCarousel from "../components/Productcarousel";

async function fetchHomeProducts() {
  // TODO: replace with your API call
  // const res = await fetch("/api/home-products");
  // if (!res.ok) throw new Error("Failed to load products");
  // return res.json();

  const make = (collection, count) =>
    Array.from({ length: count }, (_, i) => ({
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

const SECTIONS = [
  { key: "best-offers", eyebrow: "Don't miss out", title: "Best offers" },
  { key: "new-in", eyebrow: "Just landed", title: "New in" },
  { key: "deals", eyebrow: "Limited time", title: "Deals available" },
];

const BANNER_FONTS = {
  ranchers: {
    family: '"Ranchers", system-ui, sans-serif',
    size: "text-2xl sm:text-4xl md:text-5xl",
    leading: "leading-[0.95]",
  },
  lobster: {
    family: '"Lobster", system-ui, cursive',
    size: "text-2xl sm:text-4xl md:text-5xl",
    leading: "leading-[1]",
  },
  michroma: {
    family: '"Michroma", system-ui, sans-serif',
    size: "text-sm sm:text-2xl md:text-3xl",
    leading: "leading-[1.15]",
  },
  ultra: {
    family: '"Ultra", Georgia, serif',
    size: "text-2xl sm:text-4xl md:text-4xl",
    leading: "leading-[1]",
  },
};

const BANNERS = [
  {
    tag: "LIMITED TIME",
    title: "Glow more.\nSpend less.",
    text: "Up to 30% off selected skincare, perfume and hair care.",
    ctaLabel: "Shop the offers",
    ctaHref: "/products?collection=best-offers",
    background:
      "https://res.cloudinary.com/zomqdsfa/image/upload/v1791440785/cosmos_518142604.webp",
    productImage:
      "https://res.cloudinary.com/zomqdsfa/image/upload/v1791448041/copy_of_cosmos_1298594243.webp",
    font: "lobster",
  },
  {
    tag: "NEW DROPS",
    title: "Something\nnew is here.",
    text: "Fresh arrivals made to upgrade your everyday routine.",
    ctaLabel: "Explore new in",
    ctaHref: "/products?sort=new",
    background:
      "https://res.cloudinary.com/zomqdsfa/image/upload/v1791440784/cosmos_739864427.webp",
    productImage:
      "https://res.cloudinary.com/zomqdsfa/image/upload/v1791448005/copy_of_cosmos_1543011661.webp",
    font: "ultra",
  },
  {
    tag: "DON'T MISS IT",
    title: "Big deals.\nSmall prices.",
    text: "Your favourites are waiting. But not forever.",
    ctaLabel: "Shop deals",
    ctaHref: "/products?collection=deals",
    background:
      "https://res.cloudinary.com/zomqdsfa/image/upload/v1791440784/cosmos_825163157.webp",
    productImage:
      "https://res.cloudinary.com/zomqdsfa/image/upload/v1791447972/copy_of_cosmos_1891796726.webp",
    font: "michroma",
  },
];

const sectionWrap = "mx-auto max-w-7xl px-4 pt-10 md:px-8 md:pt-20";

function ProductSection({ section, products, loading, error }) {
  if (!loading && !error && products.length === 0) return null;

  return (
    <section className={sectionWrap}>
      <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
        <div>
          <p className="text-sm font-light text-primary uppercase tracking-[0.2em] text-muted-foreground">
            {section.eyebrow}
          </p>
          <h2 className="mt-1 text-2xl font-medium tracking-tight md:text-3xl">
            {section.title}
          </h2>
        </div>

        <Link
          to={`/products?collection=${section.key}`}
          className="text-sm font-bold underline-offset-4 transition-opacity hover:underline hover:opacity-60"
        >
          View all
        </Link>
      </div>

      {error ? (
        <p className="text-muted-foreground">
          Couldn&apos;t load products. Please refresh.
        </p>
      ) : (
        <div>
          {loading ? (
            <ProductCarousel label={section.title}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse bg-muted"
                  aria-hidden="true"
                />
              ))}
            </ProductCarousel>
          ) : (
            <ProductCarousel label={section.title}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductCarousel>
          )}
        </div>
      )}
    </section>
  );
}

function Banner({
  tag,
  title,
  text,
  ctaLabel,
  ctaHref = "/",
  background,
  productImage,
  font = "ranchers",
  imageSide = "right",
}) {
  const fontStyle = BANNER_FONTS[font] ?? BANNER_FONTS.ranchers;
  const imageLeft = imageSide === "left";

  return (
    <section className={sectionWrap}>
      <div className="relative grid min-h-[200px] grid-cols-2 items-center gap-3 overflow-hidden p-4 text-gray-800/80 sm:min-h-[260px] sm:gap-6 sm:p-8 md:min-h-[320px] md:gap-10 md:p-10">
        <img
          src={background}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div
          className={`relative flex items-end justify-center self-stretch ${
            imageLeft ? "order-1" : "order-2"
          }`}
        >
          {productImage && (
            <img
              src={productImage}
              alt=""
              loading="lazy"
              className="max-h-[170px] w-auto max-w-full object-contain sm:max-h-[220px] md:max-h-[280px]"
            />
          )}
        </div>

        <div
          className={`relative flex flex-col ${
            imageLeft
              ? "order-2 items-end text-right"
              : "order-1 items-start text-left"
          }`}
        >
          {tag && (
            <span className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] sm:mb-3 sm:text-[10px] sm:tracking-[0.25em]">
              {tag}
            </span>
          )}

          <h2
            style={{ fontFamily: fontStyle.family }}
            className={`whitespace-pre-line ${fontStyle.size} ${fontStyle.leading}`}
          >
            {title}
          </h2>

          {text && (
            <p className="mt-2 max-w-sm text-xs leading-relaxed sm:mt-3 sm:text-sm">
              {text}
            </p>
          )}

          {ctaLabel && (
            <Link
              to={ctaHref}
              className="mt-3 inline-flex w-fit items-center gap-2 bg-black px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-black/90 motion-reduce:transition-none sm:mt-5 sm:px-5 sm:py-2.5 sm:text-xs"
            >
              {ctaLabel}
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
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
    <div className="pb-16 md:pb-24">
      <HeroSection />

      {SECTIONS.map((section, index) => {
        const sectionProducts = products.filter(
          (p) => p.collection === section.key
        );
        const showBanner =
          BANNERS[index] && !error && (loading || sectionProducts.length > 0);

        return (
          <Fragment key={section.key}>
            {showBanner && <Banner {...BANNERS[index]} />}
            <ProductSection
              section={section}
              products={sectionProducts}
              loading={loading}
              error={error}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
