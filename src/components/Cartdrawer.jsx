import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "./Cartcontext";

const FREE_SHIPPING_THRESHOLD = 50; // TODO: load from your settings

// TODO: replace with your database call, e.g.
// const res = await fetch("/api/products/recommended?limit=12"); return res.json();
async function fetchRecommended() {
  return [
    { id: "r1", name: "Product name", price: 32, currency: "$", category: "skincare", image: null },
    { id: "r2", name: "Product name", price: 27, currency: "$", category: "perfume", image: null },
    { id: "r3", name: "Product name", price: 18, currency: "$", category: "hair", image: null },
  ];
}

const CATEGORY_LABELS = { skincare: "Skincare", perfume: "Perfume", hair: "Hair product" };

const money = (currency, n) =>
  `${currency}${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const pillBtn =
  "rounded-full border border-foreground px-6 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function Thumb({ image, name }) {
  return (
    <div className="h-24 w-24 shrink-0 overflow-hidden bg-muted">
      {image ? (
        <img src={image} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center text-[0.65rem] text-muted-foreground">Image</div>
      )}
    </div>
  );
}

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, addedIds, items, subtotal, addItem } = useCart();
  const [recommended, setRecommended] = useState([]);
  const closeRef = useRef(null);

  useEffect(() => {
    fetchRecommended().then(setRecommended).catch(() => setRecommended([]));
  }, []);

  // Escape closes, focus moves into the drawer, page scroll locks while open.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen, closeDrawer]);

  // Every item added during this drawer session, newest first (live qty from the cart).
  const addedLines = addedIds.map((id) => items.find((i) => i.id === id)).filter(Boolean);

  // Don't recommend something that's already in the "Added" list.
  const visibleRecommended = recommended.filter((p) => !addedIds.includes(p.id));

  const currency = addedLines[0]?.currency ?? items[0]?.currency ?? "$";
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1) * 100;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-foreground/40 transition-all duration-300 motion-reduce:transition-none ${
          drawerOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Added to bag"
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-[440px] flex-col bg-background text-foreground shadow-[var(--shadow-2xl)] transition-all duration-300 motion-reduce:transition-none ${
          drawerOpen ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-end border-b border-border px-5">
          <button
            ref={closeRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close"
            className="p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="m5 5 14 14M19 5 5 19" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {addedLines.length > 0 && (
            <>
              <h2 className="text-2xl font-medium">Added to bag!</h2>

              <ul className="mt-5 space-y-6">
                {addedLines.map((line) => (
                  <li key={line.id} className="flex gap-4">
                    <Thumb image={line.image} name={line.name} />
                    <div className="min-w-0 space-y-1 text-sm">
                      <p className="text-muted-foreground">{CATEGORY_LABELS[line.category] ?? line.category}</p>
                      <p className="font-medium">{line.name}</p>
                      <p className="pt-1 font-medium text-primary">{money(line.currency, line.price)}</p>
                      {line.qty > 1 && <p className="text-muted-foreground">Qty {line.qty}</p>}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Free shipping progress */}
              <div className="mt-6">
                <p className="text-sm">
                  {remaining === 0
                    ? "You have earned FREE shipping!"
                    : `Add ${money(currency, remaining)} more for FREE shipping`}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 motion-reduce:transition-none"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className={`${pillBtn} block bg-foreground text-center text-background hover:bg-foreground/90`}
                >
                  View bag
                </Link>
                <button type="button" onClick={closeDrawer} className={`${pillBtn} w-full hover:bg-muted`}>
                  Keep shopping
                </button>
              </div>
            </>
          )}

          {/* Recommended */}
          {visibleRecommended.length > 0 && (
            <section className="mt-10">
              <h3 className="text-xl font-medium">Recommended for you</h3>
              <p className="mt-1 text-sm text-muted-foreground">{visibleRecommended.length} items</p>

              <ul className="mt-5 space-y-8">
                {visibleRecommended.map((p) => (
                  <li key={p.id} className="flex gap-4">
                    <Thumb image={p.image} name={p.name} />
                    <div className="min-w-0 space-y-1 text-sm">
                      <p className="text-muted-foreground">{CATEGORY_LABELS[p.category] ?? p.category}</p>
                      <p className="font-medium">{p.name}</p>
                      <p className="font-medium text-primary">{money(p.currency, p.price)}</p>
                      <button
                        type="button"
                        onClick={() => addItem(p)}
                        className={`${pillBtn} mt-2 hover:bg-foreground hover:text-background`}
                      >
                        Add to bag
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}