import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./Productcard.jsx";

// TODO: replace with your database call, e.g.
// const res = await fetch("/api/products?featured=true&limit=8"); return res.json();
async function fetchFeaturedProducts() {
  return [
    { id: "1", name: "Product name", price: 25, currency: "$", category: "skincare", image: null },
    { id: "2", name: "Product name", price: 80, currency: "$", category: "perfume", image: null },
    { id: "3", name: "Product name", price: 18, currency: "$", category: "hair", image: null },
    { id: "4", name: "Product name", price: 32, currency: "$", category: "skincare", image: null },
  ];
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchFeaturedProducts()
      .then((data) => !cancelled && setProducts(data))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Featured</p>
          <h2 className="mt-2 text-2xl font-medium tracking-wide md:text-3xl">Shop our favourites</h2>
        </div>
        <Link to="/products" className="text-sm font-medium underline-offset-4 hover:underline">
          View all
        </Link>
      </div>

      {error && <p className="text-muted-foreground">Couldn’t load products. Please refresh.</p>}

      {!error && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-8 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse bg-muted" aria-hidden="true" />
              ))
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-muted-foreground">No products to show yet.</p>
      )}
    </section>
  );
}