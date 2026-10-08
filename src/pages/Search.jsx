import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/Productcard";
import { searchProducts } from "../lib/Catalog";

export default function Search() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!q) {
      setResults([]);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);

    searchProducts(q, 48)
      .then((r) => !cancelled && setResults(r))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl px-4 pb-16 pt-28 md:px-8">
      <h1 className="text-2xl font-black tracking-tight md:text-4xl">
        {q ? `Results for “${q}”` : "Search"}
      </h1>

      {q && !loading && !error && (
        <p className="mt-1 text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "product" : "products"}
        </p>
      )}

      <div className="mt-8">
        {!q && <p className="text-muted-foreground">Type something in the search box to find products.</p>}

        {error && <p className="text-muted-foreground">Couldn&apos;t load results. Please try again.</p>}

        {q && loading && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-8 md:gap-y-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse bg-muted" aria-hidden="true" />
            ))}
          </div>
        )}

        {q && !loading && !error && results.length === 0 && (
          <p className="text-muted-foreground">
            Nothing matched your search. Try a different word, a brand, or a product type like “serum”.
          </p>
        )}

        {q && !loading && !error && results.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-8 md:gap-y-12">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}