import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../components/Cartcontext";
import { useRewards } from "../components/Rewardscontext";
import SlideCommit from "../components/SlideCommit";
import { useUser } from "../lib/clerk";
import { startPayment } from "../lib/payments";

// TODO: load these from your settings
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_OPTIONS = [
  { id: "standard", name: "Standard delivery", eta: "3 to 6 business days", price: 5, freeOverThreshold: true },
  { id: "express", name: "Express delivery", eta: "1 to 2 business days", price: 12, freeOverThreshold: false },
];

const COUNTRIES = [
  "Ghana",
  "Nigeria",
  "Kenya",
  "South Africa",
  "Côte d'Ivoire",
  "Rwanda",
  "Egypt",
  "Senegal",
  "Tanzania",
  "Uganda",
  "United Kingdom",
  "United States",
  "Other",
];

const money = (currency, n) =>
  `${currency}${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const labelClass = "text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground";
const fieldClass = `mt-1.5 h-12 w-full border bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-foreground ${focusRing}`;

const EMPTY_FORM = {
  email: "",
  country: "Ghana",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  postal: "",
  phone: "",
};

function validate(f) {
  const e = {};
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
  if (!f.firstName.trim()) e.firstName = "Enter your first name.";
  if (!f.lastName.trim()) e.lastName = "Enter your last name.";
  if (!f.address.trim()) e.address = "Enter your address.";
  if (!f.city.trim()) e.city = "Enter your city.";
  if (!/^\+?[0-9\s-]{9,15}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number.";
  return e;
}

// Measures the available width so the slider never overflows narrow phones.
function useFitWidth(max) {
  const ref = useRef(null);
  const [width, setWidth] = useState(max);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.min(max, Math.floor(el.clientWidth)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [max]);

  return [ref, width];
}

function Field({ id, label, optional, error, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional && <span className="normal-case tracking-normal"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ children, hint }) {
  return (
    <div>
      <h2 className="text-xl font-medium">{children}</h2>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { earnPoints } = useRewards();
  const { isLoaded, isSignedIn, user } = useUser();
  const [slideRef, slideWidth] = useFitWidth(320);

  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [shippingId, setShippingId] = useState(SHIPPING_OPTIONS[0].id);

  // Fill in what Clerk already knows about a signed-in customer.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    setForm((f) => ({
      ...f,
      email: f.email || user.primaryEmailAddress?.emailAddress || "",
      firstName: f.firstName || user.firstName || "",
      lastName: f.lastName || user.lastName || "",
    }));
  }, [isLoaded, isSignedIn, user]);

  const currency = items[0]?.currency ?? "$";
  const errors = validate(form);
  const formValid = Object.keys(errors).length === 0;

  const shippingCost = (opt) => (opt.freeOverThreshold && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : opt.price);
  const shippingOption = SHIPPING_OPTIONS.find((o) => o.id === shippingId);
  const shipping = shippingCost(shippingOption);
  const total = subtotal + shipping;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));
  const err = (key) => (touched[key] ? errors[key] : undefined);
  const fieldProps = (key) => ({
    id: key,
    value: form[key],
    onChange: set(key),
    onBlur: blur(key),
    "aria-invalid": Boolean(err(key)),
    "aria-describedby": err(key) ? `${key}-error` : undefined,
    className: `${fieldClass} ${err(key) ? "border-destructive" : "border-input"}`,
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <p className="text-muted-foreground">Your bag is empty.</p>
        <Link
          to="/products"
          className={`mt-6 border border-foreground px-6 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background ${focusRing}`}
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl lg:grid-cols-[minmax(0,1fr)_26rem]">
      {/* Left: details */}
      <div className="space-y-10 px-4 pb-12 pt-8 sm:px-6 lg:pr-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-medium">Checkout</h1>
          <Link to="/cart" className={`text-sm underline underline-offset-4 ${focusRing}`}>
            Back to bag
          </Link>
        </div>

        <section className="space-y-4">
          <SectionTitle hint={isSignedIn ? "You're signed in, so we've filled in what we know." : undefined}>
            Contact
          </SectionTitle>
          <Field id="email" label="Email" error={err("email")}>
            <input type="email" autoComplete="email" placeholder="you@example.com" {...fieldProps("email")} />
          </Field>
        </section>

        <section className="space-y-4">
          <SectionTitle>Delivery</SectionTitle>

          <Field id="country" label="Country / Region">
            <select
              id="country"
              value={form.country}
              onChange={set("country")}
              autoComplete="country-name"
              className={`${fieldClass} border-input`}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First name" error={err("firstName")}>
              <input autoComplete="given-name" {...fieldProps("firstName")} />
            </Field>
            <Field id="lastName" label="Last name" error={err("lastName")}>
              <input autoComplete="family-name" {...fieldProps("lastName")} />
            </Field>
          </div>

          <Field id="address" label="Address" error={err("address")}>
            <input autoComplete="street-address" {...fieldProps("address")} />
          </Field>

          <Field id="apartment" label="Apartment, suite, etc." optional>
            <input
              id="apartment"
              value={form.apartment}
              onChange={set("apartment")}
              autoComplete="address-line2"
              className={`${fieldClass} border-input`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="city" label="City" error={err("city")}>
              <input autoComplete="address-level2" {...fieldProps("city")} />
            </Field>
            <Field id="postal" label="Postal code" optional>
              <input
                id="postal"
                value={form.postal}
                onChange={set("postal")}
                autoComplete="postal-code"
                className={`${fieldClass} border-input`}
              />
            </Field>
          </div>

          <Field id="phone" label="Phone" error={err("phone")}>
            <input type="tel" autoComplete="tel" placeholder="For delivery updates" {...fieldProps("phone")} />
          </Field>
        </section>

        <section className="space-y-4">
          <SectionTitle>Shipping method</SectionTitle>
          <div role="radiogroup" aria-label="Shipping method" className="divide-y divide-border border border-input">
            {SHIPPING_OPTIONS.map((opt) => {
              const cost = shippingCost(opt);
              const selected = opt.id === shippingId;
              return (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-start justify-between gap-4 p-4 text-sm ${
                    selected ? "bg-primary/25" : "hover:bg-primary/5"
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={selected}
                      onChange={() => setShippingId(opt.id)}
                      className="mt-1 h-4 w-4 accent-foreground"
                    />
                    <span>
                      <span className="block font-medium">{opt.name}</span>
                      <span className="block text-muted-foreground">{opt.eta}</span>
                    </span>
                  </span>
                  <span className="font-medium">{cost === 0 ? "FREE" : money(currency, cost)}</span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle hint="All transactions are secure and encrypted.">Payment</SectionTitle>
          <div className="border border-input p-4 text-sm">
            <p className="font-medium">Pay securely online</p>
            <p className="mt-1 text-muted-foreground">
              After you slide to pay, a secure payment window opens where you choose how to pay: mobile money,
              card or bank transfer. We never see or store your card details.
            </p>
          </div>

          <div ref={slideRef} className="flex w-full justify-center pt-2">
            <SlideCommit
              label="Slide to pay"
              doneLabel="Paid"
              errorLabel="Payment failed"
              onConfirm={() =>
                startPayment({
                  items,
                  customer: form,
                  shippingMethod: shippingOption.name,
                  subtotal,
                  shipping,
                  total,
                  currency,
                })
              }
              onDone={() => {
                earnPoints(subtotal); // 1 point per $1 spent. TODO: use your own rate
                setTimeout(() => {
                  clearCart();
                  navigate("/");
                }, 1500);
              }}
              onError={(reason) => console.log(reason)}
              trackColor="hsl(var(--background)/0.50)"
              handleColor="hsl(var(--primary))"
              successColor="#22c55e"
              dangerColor="#e5484d"
              width={slideWidth}
              height={56}
              radius={28}
              speed={50}
              returnBounce={0.38}
              landingDip={0.026}
              holdMs={1500}
              disabled={!formValid}
            />
          </div>

          {!formValid && (
            <p className="text-center text-xs text-destructive">
              Fill in your contact and delivery details to enable payment.
            </p>
          )}
        </section>
      </div>

      {/* Right: order summary */}
      <aside className="bg-primary/15 px-4 pb-12 pt-8 sm:px-6 lg:border-l lg:border-border lg:px-8">
        <h2 className="sr-only">Order summary</h2>

        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 border border-border bg-muted">
                {item.image ? (
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-[0.6rem] text-muted-foreground">Image</div>
                )}
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-muted px-1 text-xs ">
                  {item.qty}
                </span>
              </div>
              <p className="min-w-0 flex-1 text-sm font-medium">{item.name}</p>
              <p className="text-sm">{money(item.currency, item.price * item.qty)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-8 space-y-2 border-t border-border pt-6 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{money(currency, subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{shipping === 0 ? "FREE" : money(currency, shipping)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex items-baseline justify-between border-t border-border pt-6">
          <span className="text-lg font-medium">Total</span>
          <span>
            <span className="mr-2 text-xs text-muted-foreground">{currency === "$" ? "USD" : ""}</span>
            <span className="text-2xl font-medium">{money(currency, total)}</span>
          </span>
        </div>
      </aside>
    </div>
  );
}