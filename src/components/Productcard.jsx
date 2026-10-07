import { Link } from "react-router-dom";
import { useCart } from "@/components/Cartcontext";

const CATEGORY_LABELS = {
  skincare: "Skincare",
  perfume: "Perfume",
  hair: "Hair product",
};

/*
  product = { id, name, price, currency, category, image }
  category: "skincare" | "perfume" | "hair"
*/
export function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="group">
      {/* Image + text link to the product page */}
      <Link
        to={`/product/${product.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">Image</div>
          )}
        </div>

        <div className="space-y-1.5 pt-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </p>
          <h3 className="line-clamp-1 text-base font-medium tracking-wide md:text-lg">{product.name}</h3>
          <p className="text-base font-medium tracking-wide text-primary md:text-lg">
            {product.currency} {Number(product.price).toLocaleString()}
          </p>
        </div>
      </Link>

      {/* Outside the link so the button is valid HTML and doesn't navigate */}
      <button
        type="button"
        onClick={() => addItem(product)}
        className="mt-4 rounded-full border border-foreground px-6 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Add to bag
      </button>
    </div>
  );
}

export default ProductCard;