import { useState } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  ["Shop", "/products"],
  ["About us", "/about"],
  ["Contact", "/contact"],
];

const SOCIAL_LINKS = [
  ["Instagram", "https://instagram.com"],
  ["TikTok", "https://tiktok.com"],
];

const LEGAL_LINKS = [
  ["Return Policy", "/returns"],
  ["Terms & Conditions", "/terms"],
  ["Privacy policy", "/privacy"],
];

const CURRENCIES = ["United States (USD)", "Ghana (GHS)", "United Kingdom (GBP)", "Europe (EUR)"];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const heading = "text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground md:text-xs";
const link = `inline-block py-1 underline-offset-4 hover:underline ${focusRing}`;

async function subscribe(email) {
  // TODO: replace with your API call
  // const res = await fetch("/api/newsletter", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email }),
  // });
  // if (!res.ok) throw new Error("Subscription failed");
  return email;
}

export default function Footer({ brand = "MC Beauty", credit = "" }) {
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    setSending(true);
    try {
      await subscribe(email.trim());
      setEmail("");
      setStatus({ type: "ok", text: "Thanks for subscribing!" });
    } catch {
      setStatus({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="bg-background text-foreground">
      {/* Links + newsletter */}
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 pt-12 sm:px-6 md:grid-cols-[1fr_auto] md:gap-24 md:px-10 md:pt-20">
        <div className="space-y-6 md:space-y-8">
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] uppercase tracking-[0.12em] md:gap-x-8 md:text-sm"
          >
            {NAV_LINKS.map(([label, href]) => (
              <Link key={label} to={href} className={link}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] md:gap-x-6 md:text-sm">
            <span className={heading}>Follow us</span>
            {SOCIAL_LINKS.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={link}>
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="w-full space-y-5 md:w-96 md:space-y-6">
          <h2 className={heading}>Subscribe to our newsletter</h2>

          <form onSubmit={handleSubmit} noValidate className="flex items-end gap-3 md:gap-4">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className={`h-11 min-w-0 flex-1 border-b border-foreground/40 bg-transparent text-base placeholder:text-muted-foreground focus:border-foreground md:h-10 md:text-sm ${focusRing}`}
            />
            <button
              type="submit"
              disabled={sending}
              className={`h-11 shrink-0 border border-foreground px-5 text-[11px] uppercase tracking-[0.15em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-50 motion-reduce:transition-none md:h-10 md:px-6 md:text-xs ${focusRing}`}
            >
              {sending ? "Sending" : "Submit"}
            </button>
          </form>

          {status && (
            <p
              role="status"
              className={`text-sm ${status.type === "error" ? "text-destructive" : "text-muted-foreground"}`}
            >
              {status.text}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <label htmlFor="footer-currency" className={heading}>
              Shop in
            </label>
            <select
              id="footer-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`min-w-0 max-w-full cursor-pointer border-b border-foreground/40 bg-transparent py-1 pr-2 text-sm ${focusRing}`}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Big brand name. Scales with the screen, capped on large monitors. */}
      <div
        className="mx-auto max-w-[1400px] select-none overflow-hidden px-5 pb-3 pt-10 text-center sm:px-6 md:px-10 md:pb-5 md:pt-16"
        aria-hidden="true"
      >
        <span className="block whitespace-nowrap text-[clamp(2.5rem,13.5vw,11rem)] font-black uppercase leading-[0.9] tracking-tighter text-primary opacity-40">
          {brand}
        </span>
      </div>

      {/* Legal row */}
      <div className="border-t border-border text-muted-foreground">
        <div className="mx-auto grid max-w-[1400px] items-center gap-2 px-5 py-5 text-xs sm:px-6 md:grid-cols-3 md:gap-3 md:px-10">
          <p className="order-2 md:order-1">
            © {new Date().getFullYear()} {brand}. All rights reserved.
          </p>

          <nav
            aria-label="Legal"
            className="order-1 flex flex-wrap gap-x-5 gap-y-0 md:order-2 md:justify-center md:gap-x-8"
          >
            {LEGAL_LINKS.map(([label, href]) => (
              <Link key={label} to={href} className={link}>
                {label}
              </Link>
            ))}
          </nav>

          {credit && <p className="order-3 md:text-right">{credit}</p>}
        </div>
      </div>
    </footer>
  );
}