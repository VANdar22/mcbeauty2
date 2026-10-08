import { Link } from "react-router-dom";
import { useCart } from "@/components/Cartcontext";

const CATEGORY_LABELS = {
  skincare: "Skincare",
  perfume: "Perfume",
  hair: "Hair product",
};

const BagIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

/*
  product = {
    id, name, price, currency, category, image,
    description?  -> short line under the name
    badge?        -> e.g. "Bestseller", "New", "-20%"
  }
*/
export function ProductCard({ product }) {
  const { addItem } = useCart();
  const href = `/product/${product.id}`;

  return (
    <div className="group">
      {/* Image area. The button sits on top of it, outside the Link. */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Link to={href} tabIndex={-1} aria-hidden="true" className="block h-full w-full">
          {product.image ? (
            <img
              src={product.image}
              alt=""
              loading="lazy"
              draggable={false}
              className="h-full w-full select-none object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">Image</div>
          )}
        </Link>

        {product.badge && (
          <span className="pointer-events-none absolute left-0 top-3 bg-white px-2 py-1 text-[9px] font-bold uppercase leading-none tracking-[0.12em] text-black sm:top-4">
            {product.badge}
          </span>
        )}

        {/* Icon square; on desktop hover/focus it expands to "Add to bag" */}
        <button
          type="button"
          onClick={() => addItem(product)}
          aria-label={`Add ${product.name} to bag`}
          className="absolute bottom-3 right-3 flex h-9 max-w-[2.25rem] items-center overflow-hidden bg-primary/25 transition-[max-width] duration-300 focus-visible:max-w-[11rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none md:group-hover:max-w-[11rem]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center">
            <BagIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="whitespace-nowrap pr-3 text-[11px] font-bold uppercase tracking-[0.08em]">
            Add to bag
          </span>
        </button>
      </div>

      {/* Text */}
      <Link
        to={href}
        className="block space-y-1 pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
        <p className="line-clamp-2 min-h-8 text-xs leading-4 text-muted-foreground">
          {product.description ?? CATEGORY_LABELS[product.category] ?? product.category}
        </p>
        <p className="pt-1 text-md font-semibold">
          {product.currency} {Number(product.price).toLocaleString()}
        </p>
      </Link>
    </div>
  );
}

export default ProductCard;