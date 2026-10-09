import { Link } from "react-router-dom";
import { useCart } from "../components/Cartcontext";

const FREE_SHIPPING_THRESHOLD = 50; // TODO: load from your settings

const CATEGORY_LABELS = { skincare: "Skincare", perfume: "Perfume", hair: "Hair product" };

const money = (currency, n) =>
  `${currency}${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const pillBtn =
  " border border-foreground px-6 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function Thumb({ image, name }) {
  return (
    <div className="h-24 w-24 shrink-0 overflow-hidden bg-muted sm:h-32 sm:w-32">
      {image ? (
        <img src={image} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center text-xs text-muted-foreground">Image</div>
      )}
    </div>
  );
}

function QtyStepper({ item, updateQty }) {
  const btn =
    "grid h-9 w-9 place-items-center text-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <div className="inline-flex shrink-0 items-center rounded-full border border-foreground">
      <button
        type="button"
        className={`${btn} rounded-l-full`}
        onClick={() => updateQty(item.id, item.qty - 1)}
        aria-label={`Decrease quantity of ${item.name}`}
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium" aria-live="polite">
        {item.qty}
      </span>
      <button
        type="button"
        className={`${btn} rounded-r-full`}
        onClick={() => updateQty(item.id, item.qty + 1)}
        aria-label={`Increase quantity of ${item.name}`}
      >
        +
      </button>
    </div>
  );
}

export default function Cart() {
  const { items, subtotal, cartCount, updateQty, removeItem, clearCart } = useCart();

  const currency = items[0]?.currency ?? "$";
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1) * 100;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 pb-10 pt-24 text-center sm:px-6 md:pt-28">
        <p className="text-base font-medium text-muted-foreground md:text-lg">
          Oops! Looks like you haven't added anything yet.
        </p>

        <img
          src="https://res.cloudinary.com/zomqdsfa/image/upload/v1791492783/copy_of_copy_of_cosmos_2032777511.webp"
          alt="Your bag is empty"
          className="mt-8 ml-6 h-auto w-full max-w-[20rem] object-contain sm:max-w-sm md:max-w-md"
        />

        <Link to="/products" className={`${pillBtn} mt-8 hover:bg-primary/25`}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium">Your bag</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Clear bag
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ul className="min-w-0 divide-y divide-border border-y border-border">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5 sm:gap-5 sm:py-6">
              <Thumb image={item.image} name={item.name} />

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:gap-4">
                <div className="min-w-0 space-y-1 text-sm">
                  <p className="text-muted-foreground">{CATEGORY_LABELS[item.category] ?? item.category}</p>
                  <p className="break-words text-base font-medium">{item.name}</p>
                  <p className="text-muted-foreground">{money(item.currency, item.price)} each</p>
                </div>

                <div className="flex min-w-0 flex-col gap-3 sm:items-end sm:justify-between">
                  <p className="font-medium text-primary">{money(item.currency, item.price * item.qty)}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <QtyStepper item={item} updateQty={updateQty} />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit min-w-0 space-y-5 bg-card p-5 text-card-foreground shadow-[var(--shadow-md)] sm:p-6">
          <h2 className="text-xl font-medium">Order summary</h2>

          <div>
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

          <dl className="space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{money(currency, subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-right font-medium">{remaining === 0 ? "Free" : "Calculated at checkout"}</dd>
            </div>
          </dl>

          <div className="flex justify-between border-t border-border pt-5 text-lg font-medium">
            <span>Total</span>
            <span>{money(currency, subtotal)}</span>
          </div>

          <Link
            to="/checkout"
            className={`${pillBtn} block  text-center hover:bg-primary/25`}
          >
            Checkout
          </Link>
          <Link
            to="/products"
            className={`${pillBtn} block text-center hover:bg-primary/25`}
          >
            Keep shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}