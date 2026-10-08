import { useState } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  ["Shop", "/products"],
  ["About us", "/about"],
  ["Gallery", "/gallery"],
  ["Contact", "/contact"],
  ["FAQ", "/faq"],
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

const heading = "text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground";
const link = `underline-offset-4 hover:underline ${focusRing}`;

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
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 pt-16 md:grid-cols-[1fr_auto] md:gap-24 md:px-10 md:pt-20">
        <div className="space-y-8">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm uppercase tracking-[0.12em]">
            {NAV_LINKS.map(([label, href]) => (
              <Link key={label} to={href} className={link}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className={heading}>Follow us</span>
            {SOCIAL_LINKS.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={link}>
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="w-full space-y-6 md:w-96">
          <h2 className={heading}>Subscribe to our newsletter</h2>

          <form onSubmit={handleSubmit} noValidate className="flex items-end gap-4">
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
              className={`h-10 min-w-0 flex-1 border-b border-foreground/40 bg-transparent text-sm placeholder:text-muted-foreground focus:border-foreground ${focusRing}`}
            />
            <button
              type="submit"
              disabled={sending}
              className={`h-10 border border-foreground px-6 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-50 motion-reduce:transition-none ${focusRing}`}
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

          <div className="flex items-center gap-3 text-sm">
            <label htmlFor="footer-currency" className={heading}>
              Shop in
            </label>
            <select
              id="footer-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`cursor-pointer border-b border-foreground/40 bg-transparent py-1 pr-2 ${focusRing}`}
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

      <div className="overflow-hidden px-4 pb-6 pt-14 text-center md:pt-20" aria-hidden="true">
        <span
className="block whitespace-nowrap text-center text-[14vw] font-black uppercase leading-[0.85] tracking-tighter text-primary opacity-40"        >
          {brand}
        </span>
      </div>

      <div className="bg-background text-gray-500">
        <div className="mx-auto grid max-w-[1400px] items-center gap-3 px-6 py-5 text-xs md:grid-cols-3 md:px-10">
          <p>© {new Date().getFullYear()} {brand}. All rights reserved.</p>

          <nav aria-label="Legal" className="flex flex-wrap gap-x-8 gap-y-2 md:justify-center">
            {LEGAL_LINKS.map(([label, href]) => (
              <Link key={label} to={href} className={link}>
                {label}
              </Link>
            ))}
          </nav>

          {credit && <p className="md:text-right">{credit}</p>}
        </div>
      </div>
    </footer>
  );
}