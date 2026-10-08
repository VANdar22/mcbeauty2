import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ORDER_STEPS, trackOrder } from "../lib/orders";
import { useUser } from "../lib/clerk";
import LoopVideo from "../components/LoopVideo";

const VIDEO_DELIVERED =
  "https://res.cloudinary.com/zomqdsfa/video/upload/v1791456038/cosmos_398577695.mp4";
const VIDEO_IN_PROGRESS =
  "https://res.cloudinary.com/zomqdsfa/video/upload/v1791456038/cosmos_1397371085.mp4";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const label = "text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground";

const input = `h-10 w-full border-b border-foreground/40 bg-transparent text-sm placeholder:text-muted-foreground focus:border-foreground ${focusRing}`;

const formatDate = (ms) =>
  new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const formatDateTime = (ms) =>
  new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function Detail({ title, children }) {
  return (
    <div>
      <dt className={label}>{title}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

function OrderResult({ order }) {
  const stepIndex = Math.max(
    ORDER_STEPS.findIndex(([key]) => key === order.status),
    0
  );
  const [, statusLabel] = ORDER_STEPS[stepIndex];
  const delivered = order.status === "delivered";
  const accentBg = delivered ? "bg-green-500" : "bg-primary";
  const updates = [...order.updates].sort((a, b) => b.at - a.at);
  const deliveredAt = order.updates.find((u) => u.status === "delivered")?.at ?? order.eta;

  return (
    <section
      aria-live="polite"
      className="mt-12 grid grid-cols-[1fr_auto] gap-x-4 border-t border-border pt-10 md:grid-cols-[1fr_16rem] md:gap-x-12"
    >
      {/* Header: order number, status, delivery date */}
      <div>
        <p className={label}>Order {order.number}</p>
        <h2
          className={`mt-2 flex items-center gap-3 text-2xl font-medium md:text-3xl ${
            delivered ? "text-green-600" : ""
          }`}
        >
          {delivered && (
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m7.5 12.5 3 3 6-6.5" />
            </svg>
          )}
          {statusLabel}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {delivered ? `Delivered on ${formatDate(deliveredAt)}` : `Estimated delivery ${formatDate(order.eta)}`}
        </p>
      </div>

      {/* One video element, placed differently per screen:
          mobile  -> small clip beside the status
          desktop -> sticky column on the right, keeps its own proportions */}
      <LoopVideo
        key={delivered ? "delivered" : "in-progress"}
        src={delivered ? VIDEO_DELIVERED : VIDEO_IN_PROGRESS}
        width={600}
        posterAt={delivered ? 2 : 1}
        className="block h-auto w-24 self-start sm:w-28 md:sticky md:top-28 md:row-span-2 md:w-full"
      />

      <div className="col-span-2 md:col-span-1">
      <ol aria-label="Order progress" className="mt-8 flex gap-1.5">
        {ORDER_STEPS.map(([key, text], i) => (
          <li key={key} className="flex-1" aria-current={i === stepIndex ? "step" : undefined}>
            <span className="sr-only">
              {text}
              {i <= stepIndex ? " (done)" : ""}
            </span>
            <div className={`h-1 ${i <= stepIndex ? accentBg : "bg-muted"}`} aria-hidden="true" />
            <p
              className={`mt-2 hidden text-xs sm:block ${
                i === stepIndex
                  ? `font-medium ${delivered ? "text-green-600" : "text-foreground"}`
                  : "text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              {text}
            </p>
          </li>
        ))}
      </ol>

      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-border py-8">
        <Detail title="Placed on">{formatDate(order.placedAt)}</Detail>
        <Detail title="Shipping to">{order.shipTo}</Detail>
        <Detail title="Carrier">{order.carrier ?? "Assigned once shipped"}</Detail>
        <Detail title="Tracking number">
          <span className="break-all">{order.trackingNumber ?? "Available once shipped"}</span>
        </Detail>
      </dl>

      <div className="mt-10">
        <h3 className={label}>Updates</h3>
        <ul className="mt-5 space-y-6">
          {updates.map((u, i) => (
            <li key={`${u.status}-${u.at}`} className="flex gap-4">
              <span
                aria-hidden="true"
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${i === 0 ? accentBg : "bg-border"}`}
              />
              <div className="text-sm">
                <p className="font-medium">{ORDER_STEPS.find(([key]) => key === u.status)?.[1]}</p>
                <p className="text-muted-foreground">{u.note}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(u.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <h3 className={label}>Items</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.name} className="flex justify-between gap-4">
              <span>{item.name}</span>
              <span className="text-muted-foreground">× {item.qty}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Something not right?{" "}
        <Link to="/contact" className={`text-foreground underline underline-offset-4 ${focusRing}`}>
          Contact us
        </Link>
      </p>
      </div>
    </section>
  );
}

export default function TrackOrder() {
  const [params] = useSearchParams();
  const { isLoaded, isSignedIn, user } = useUser();
  const accountEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const lookupEmail = isSignedIn ? accountEmail : email.trim();

    if (!orderNumber.trim() || !/^\S+@\S+\.\S+$/.test(lookupEmail)) {
      setOrder(null);
      setError(
        isSignedIn
          ? "Enter your order number."
          : "Enter your order number and the email you used at checkout."
      );
      return;
    }

    setLoading(true);
    try {
      const result = await trackOrder(orderNumber, lookupEmail);
      setOrder(result);
      if (!result) setError("We couldn't find an order with those details. Please check and try again.");
    } catch {
      setOrder(null);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-[70vh] max-w-4xl px-6 pb-24 pt-28 md:pt-36">
      <h1 className="text-3xl font-medium md:text-4xl">Track your order</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isSignedIn
          ? "Enter your order number to see where your package is."
          : "Enter your order number and email to see where your package is."}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-10 max-w-2xl space-y-8">
        <div className={`grid gap-8 ${isLoaded && !isSignedIn ? "sm:grid-cols-2" : ""}`}>
          <div>
            <label htmlFor="order-number" className={label}>
              Order number
            </label>
            <input
              id="order-number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="MC-0000"
              autoComplete="off"
              className={input}
            />
          </div>

          {isLoaded && !isSignedIn && (
            <div>
              <label htmlFor="order-email" className={label}>
                Email
              </label>
              <input
                id="order-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={input}
              />
            </div>
          )}
        </div>

        {isSignedIn && accountEmail && (
          <p className="text-sm text-muted-foreground">Signed in as {accountEmail}</p>
        )}

        <button
          type="submit"
          disabled={loading || !isLoaded}
          className={`h-11 w-full border border-foreground px-10 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-primary/25 disabled:opacity-50 motion-reduce:transition-none sm:w-auto ${focusRing}`}
        >
          {loading ? "Checking" : "Track order"}
        </button>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>

      {order && <OrderResult order={order} />}
    </div>
  );
}