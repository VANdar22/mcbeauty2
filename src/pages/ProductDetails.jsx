import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../components/Cartcontext";
import ProductCard from "../components/Productcard";
import PulseHeart from "../components/PulseHeart"; // adjust the path to where your PulseHeart file lives

/* ------------------------------------------------------------------ */
/* 1. DATABASE — replace the bodies of these two functions.            */
/*                                                                     */
/*  Product: { id, name, brand?, category, price, compare_price?,      */
/*    currency, image, images[], summary, highlights[], details,       */
/*    how_to_use, ingredients, in_stock, likes?, liked? }                              */
/*  Similar items: same shape as the cards on the home page           */
/*    [{ id, name, price, currency, category, image }]                 */
/* ------------------------------------------------------------------ */

async function fetchProduct(id) {
  // TODO: const res = await fetch(`/api/products/${id}`);
  //       if (!res.ok) throw new Error("Not found");
  //       return res.json();
  return {
    id,
    name: "Product name",
    brand: "Brand name",
    category: "skincare",
    price: 24,
    compare_price: 30,
    currency: "$",
    image: null,
    images: [null, null, null, null], // image URLs; null shows a grey placeholder
    summary: "A short summary of the product and what it does for your skin, hair or fragrance routine.",
    highlights: ["Sustainable packaging", "Cruelty free"],
    details: "Size, formulation and other product details go here.",
    how_to_use: "Step-by-step directions for using the product.",
    ingredients: "Full ingredient list goes here.",
    in_stock: true,
    likes: 0, // how many people saved it
    liked: false, // has the current user saved it
  };
}

async function fetchSimilarProducts(id) {
  // TODO: const res = await fetch(`/api/products/${id}/similar?limit=12`); return res.json();
  return Array.from({ length: 6 }, (_, i) => ({
    id: `similar-${i + 1}`,
    name: "Product name",
    price: 18 + i * 6,
    currency: "$",
    category: ["skincare", "perfume", "hair"][i % 3],
    image: null,
  }));
}

const CATEGORY_LABELS = { skincare: "Skincare", perfume: "Perfume", hair: "Hair product" };

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/* ------------------------------------------------------------------ */
/* 2. SMALL PIECES                                                     */
/* ------------------------------------------------------------------ */

function Picture({ src, alt, className = "" }) {
  return src ? (
    <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />
  ) : (
    <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">Image</div>
  );
}

function Gallery({ images, name }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden bg-muted">
        <Picture src={images[active]} alt={name} />
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-3">
          {images.map((src, i) => (
            <li key={i} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={`h-16 w-16 overflow-hidden bg-muted md:h-24 md:w-24 ${focusRing} ${
                  i === active ? "ring-1 ring-foreground" : "opacity-80 hover:opacity-100"
                }`}
              >
                <Picture src={src} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between py-5 text-left text-sm font-medium ${focusRing}`}
      >
        {title}
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M5 12h14" />
          {!open && <path d="M12 5v14" />}
        </svg>
      </button>
      {open && <div className="pb-5 text-sm leading-relaxed text-muted-foreground">{children}</div>}
    </div>
  );
}

function SimilarItems({ items }) {
  const scroller = useRef(null);
  if (items.length === 0) return null;

  const scrollNext = () =>
    scroller.current?.scrollBy({ left: scroller.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="mt-16 md:mt-24" aria-labelledby="similar-items">
      <h2 id="similar-items" className="text-xl font-medium tracking-wide md:text-2xl">
        Similar items for you
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{items.length} items</p>

      <div className="relative mt-6">
        <ul
          ref={scroller}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p) => (
            <li key={p.id} className="w-[calc(50%-0.5rem)] shrink-0 snap-start md:w-[calc(25%-0.75rem)]">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={scrollNext}
          aria-label="Scroll to next items"
          className={`absolute -right-4 top-[35%] hidden h-9 w-9 place-items-center rounded-full border border-foreground bg-background shadow-[var(--shadow-md)] md:grid ${focusRing}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}

function PageSkeleton() {
  return (
    <div className="grid animate-pulse gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16" aria-hidden="true">
      <div className="aspect-square bg-muted" />
      <div className="space-y-4">
        <div className="h-4 w-24 bg-muted" />
        <div className="h-8 w-3/4 bg-muted" />
        <div className="h-6 w-32 bg-muted" />
        <div className="h-12 w-full rounded-full bg-muted" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. THE PAGE  (route: /product/:id)                                  */
/* ------------------------------------------------------------------ */

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    window.scrollTo({ top: 0 });

    fetchProduct(id)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));

    fetchSimilarProducts(id)
      .then((items) => !cancelled && setSimilar(items))
      .catch(() => !cancelled && setSimilar([]));

    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = product ? (product.images?.length ? product.images : [product.image]) : [];
  const onSale = product && product.compare_price > product.price;
  const accordions = product
    ? [
        ["Details", product.details],
        ["How to use", product.how_to_use],
        ["Ingredients", product.ingredients],
      ].filter(([, body]) => body)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      {status === "loading" && <PageSkeleton />}

      {status === "error" && (
        <div className="py-24 text-center">
          <h1 className="text-2xl font-medium">We couldn’t find that product</h1>
          <Link to="/products" className="mt-4 inline-block text-sm font-medium underline underline-offset-4">
            Browse all products
          </Link>
        </div>
      )}

      {status === "ready" && product && (
        <>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span>{CATEGORY_LABELS[product.category] ?? product.category}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <Gallery key={product.id} images={images} name={product.name} />

            {/* Details column */}
            <div className="lg:max-w-md">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {product.brand ?? CATEGORY_LABELS[product.category] ?? product.category}
              </p>
              <h1 className="mt-2 text-2xl font-medium leading-snug md:text-3xl">{product.name}</h1>

              <p className="mt-4 flex items-baseline gap-3">
                <span className="text-xl font-medium text-primary">
                  {product.currency} {Number(product.price).toLocaleString()}
                </span>
                {onSale && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.currency} {Number(product.compare_price).toLocaleString()}
                  </span>
                )}
              </p>

              {/* Add to bag + wishlist */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  disabled={!product.in_stock}
                  onClick={() => addItem(product)}
                  className={`border border-foreground px-6 py-3 text-sm font-medium transition hover:bg-foreground hover:text-background ${focusRing}`}
                >
                  {product.in_stock ? "Add to bag" : "Out of stock"}
                </button>
                <PulseHeart
                  key={product.id}
                  count={product.likes ?? 0}
                  defaultLiked={product.liked ?? false}
                  onChange={(liked, count) => {
                    // TODO: save to your database / wishlist
                    console.log(liked, count);
                  }}
                  showCount
                  icon="heart"
                  idleOutline
                  size={40}
                  corner={32}
                  likedColor="#ff4d6d"
                  idleColor="#8b8b93"
                  pillColor="background-muted"
                  textColor="accent"
                  duration={560}
                  dotSize={0.3}
                  overshoot={1.7}
                  beat={3}
                  rollDuration={350}
                  disabled={false}
                />
              </div>

              {/* Highlights */}
              {product.highlights?.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-sm font-medium">Highlights</h2>
                  <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                    {product.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-primary" aria-hidden="true">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m5 12 5 5 9-10" />
                          </svg>
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Summary */}
              {product.summary && (
                <section className="mt-8">
                  <h2 className="text-sm font-medium">Summary</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.summary}</p>
                </section>
              )}

              {/* Details / How to use / Ingredients */}
              {accordions.length > 0 && (
                <div className="mt-8 border-t border-border">
                  {accordions.map(([title, body]) => (
                    <AccordionItem key={title} title={title}>
                      {body}
                    </AccordionItem>
                  ))}
                </div>
              )}
            </div>
          </div>

          <SimilarItems items={similar.filter((p) => String(p.id) !== String(product.id))} />
        </>
      )}
    </div>
  );
}