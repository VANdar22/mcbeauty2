import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useRewards, formatMoney, REWARD_TIERS } from "../components/Rewardscontext";
import SlideCommit from "../components/SlideCommit";

/* ================================================================
   GIFT CARD IMAGES
   ================================================================ */

const GIFT_CARD_IMAGES = {
  25: "https://res.cloudinary.com/zomqdsfa/image/upload/v1791387397/25giftcard.jpg",
  50: "https://res.cloudinary.com/zomqdsfa/image/upload/v1791387396/50giftcard.jpg",
  100: "https://res.cloudinary.com/zomqdsfa/image/upload/v1791387396/100giftcard.jpg",
};

const DENOMINATIONS = [25, 50, 100];
const ACTIVITY_LIMIT = 5;

/* ================================================================
   DESIGN IMAGES (purely decorative)
   ================================================================ */

const SKIN_IMAGE = "https://res.cloudinary.com/zomqdsfa/image/upload/v1791387397/skin3.webp";
const BEAUTY_IMAGE = "https://res.cloudinary.com/zomqdsfa/image/upload/v1791387398/beauty3.webp";

// Square corners, with an inner shadow on top of the photo so it looks sunk into the page.
// object-cover fills the box. To change which part of the photo stays in view,
// add a class like object-top, object-bottom or object-[center_30%] on the <img>.
function DesignImage({ src, className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      <img
        src={src}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      {/* The "hole": shadow falls from the top and left edges, plus a thin inner line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: [
            "inset 0 14px 32px -10px hsl(var(--foreground) / 0.55)",
            "inset 14px 0 32px -14px hsl(var(--foreground) / 0.3)",
            "inset 0 0 0 1px hsl(var(--foreground) / 0.15)",
          ].join(", "),
        }}
      />
    </div>
  );
}

function GiftCardImage({ amount, className = "" }) {
  const src = GIFT_CARD_IMAGES[amount];

  return (
    <div className={`aspect-[7/5] overflow-hidden rounded-lg bg-background shadow-[var(--shadow-md)] ${className}`}>
      {src ? (
        <img
          src={src}
          alt={`${formatMoney(amount)} gift card`}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="grid h-full place-items-center border border-border text-2xl font-medium text-primary">
          {formatMoney(amount).replace(".00", "")}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   STYLES
   ================================================================ */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const pillButton =
  "border border-foreground px-6 py-3 text-sm font-medium transition hover:bg-primary/25 ";

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground focus:ring-1 focus:ring-foreground";

function Section({ title, children }) {
  return (
    <section className="mt-20 sm:mt-24">
      <h2 className="text-lg font-medium tracking-tight">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

// Replace this with your real payment API.
async function payForGiftCard(order) {
  return order;
}

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "");

/* ================================================================
   REWARDS PAGE
   ================================================================ */

export default function Rewards() {
  const navigate = useNavigate();

  const { points, credit, cards, redeemPointsForCard, purchaseGiftCard, claimCode } = useRewards();

  const [status, setStatus] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [amount, setAmount] = useState(25);
  const [mode, setMode] = useState("self");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");

  const wallet = cards.filter((card) => card.claimed && !card.used);

  // Purchases and redemptions in one list, newest first, capped at 5.
  const activity = [
    ...cards
      .filter((card) => card.source === "purchase")
      .map((card) => ({
        key: `purchase-${card.id}`,
        title: `${formatMoney(card.amount)} gift card`,
        note: card.recipientName ? `For ${card.recipientName}` : "",
        date: card.createdAt,
      })),
    ...cards
      .filter((card) => card.used)
      .map((card) => ({
        key: `used-${card.id}`,
        title: `${formatMoney(card.amount)} redeemed`,
        note: "",
        date: card.usedAt,
      })),
  ]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, ACTIVITY_LIMIT);

  const amountValid = DENOMINATIONS.includes(Number(amount));

  const giftValid =
    mode === "self" || Boolean(recipientName.trim() && /^\S+@\S+\.\S+$/.test(recipientEmail));

  const canBuy = amountValid && giftValid;

  /* Redeem points */
  const handleRedeemPoints = (tier) => {
    const card = redeemPointsForCard(tier);

    setStatus(
      card
        ? { type: "ok", text: `${formatMoney(card.amount)} gift card added to your wallet.` }
        : { type: "error", text: "You don't have enough points for that reward." }
    );
  };

  /* Claim code */
  const handleClaim = (event) => {
    event.preventDefault();

    const result = claimCode(codeInput);

    if (result.ok) {
      setCodeInput("");
      setStatus({ type: "ok", text: `${formatMoney(result.card.amount)} gift card added to your wallet.` });
      return;
    }

    setStatus({ type: "error", text: result.reason });
  };

  /* Purchase */
  const handlePurchased = () => {
    const card = purchaseGiftCard({
      amount: Number(amount),
      recipientName: mode === "gift" ? recipientName.trim() : "",
      recipientEmail: mode === "gift" ? recipientEmail.trim() : "",
      message: mode === "gift" ? message.trim() : "",
    });

    setStatus({
      type: "ok",
      text:
        mode === "gift"
          ? `Gift card purchased for ${card.recipientName}.`
          : `${formatMoney(card.amount)} gift card added to your wallet.`,
    });

    setRecipientName("");
    setRecipientEmail("");
    setMessage("");
  };

  const openGiftCard = (card) => navigate(`/rewards/card/${card.id}`);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-32 pt-28">
      {/* HERO: title + balances on the left, image on the right */}
      <header className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div>
          <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">Rewards</h1>

          <div className="mt-12 flex flex-wrap gap-x-16 gap-y-8">
            <div>
              <p className="text-sm text-muted-foreground">Points</p>
              <p className="mt-2 text-4xl font-medium tracking-tight">{points.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Store credit</p>
              <p className="mt-2 text-4xl font-medium tracking-tight">{formatMoney(credit)}</p>
            </div>
          </div>
        </div>

        <DesignImage src={SKIN_IMAGE} className="aspect-[16/9] sm:aspect-[16/10] lg:aspect-[4/3]" />
      </header>

      {/* STATUS */}
      {status && (
        <div
          role="status"
          className={`mt-10 flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
            status.type === "error" ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground"
          }`}
        >
          <span>{status.text}</span>

          <button
            type="button"
            onClick={() => setStatus(null)}
            className="ml-auto text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* REDEEM POINTS: the card shows the value, so only the points are written */}
      <Section title="Redeem points">
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {REWARD_TIERS.map((tier) => {
            const affordable = points >= tier.cost;

            return (
              <div key={tier.id}>
                <GiftCardImage amount={tier.amount} className="w-full" />

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{tier.cost.toLocaleString()} points</p>

                  <button
                    type="button"
                    disabled={!affordable}
                    onClick={() => handleRedeemPoints(tier)}
                    className={`${pillButton} ${affordable ? "hover:bg-foreground hover:text-background" : ""}`}
                  >
                    {affordable ? "Redeem" : `${(tier.cost - points).toLocaleString()} more`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* WALLET */}
      <Section title="Your gift cards">
        {wallet.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
            {wallet.map((card) => (
              <button
                key={card.id}
                type="button"
                aria-label={`Open ${formatMoney(card.amount)} gift card`}
                onClick={() => openGiftCard(card)}
                className={`group rounded-lg text-left ${focusRing}`}
              >
                <div className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-1 motion-reduce:transform-none motion-reduce:transition-none">
                  <GiftCardImage amount={card.amount} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No gift cards yet.</p>
        )}
      </Section>

      {/* GIVE A GIFT */}
      <Section title="Give a gift">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <DesignImage src={BEAUTY_IMAGE} className="aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[28rem]" />

          <div>
        <div
          role="radiogroup"
          aria-label="Gift card amount"
          className="grid grid-cols-3 gap-4 sm:gap-6"
        >
          {DENOMINATIONS.map((value) => {
            const selected = Number(amount) === value;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={formatMoney(value)}
                onClick={() => setAmount(value)}
                className={`rounded-lg transition-all duration-300 motion-reduce:transform-none motion-reduce:transition-none ${focusRing} ${
                  selected ? "-translate-y-2" : "opacity-60 hover:-translate-y-0.5 hover:opacity-100"
                }`}
              >
                <GiftCardImage amount={value} />
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex gap-2">
          {[
            ["self", "For me"],
            ["gift", "Someone else"],
          ].map(([value, label]) => (
            <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
            className={`${pillButton} ${mode === value ? "bg-primary/25" : "hover:bg-primary/10"}`}
          >
            {label}
          </button>
          ))}
        </div>

        {mode === "gift" && (
          <div className="mt-6 grid max-w-xl gap-3">
            <input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Recipient's name"
              className={inputClass}
            />

            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Recipient's email"
              className={inputClass}
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message (optional)"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <SlideCommit
            label="Slide to pay"
            doneLabel="Paid"
            errorLabel="Payment failed"
            onConfirm={() => payForGiftCard({ amount: Number(amount), mode, recipientEmail })}
            onDone={handlePurchased}
            onError={() => setStatus({ type: "error", text: "Payment failed. Please try again." })}
            trackColor="hsl(var(--background)/0.50)"
            handleColor="hsl(var(--primary))"
            successColor="#22c55e"
            dangerColor="#e5484d"
            width={280}
            height={56}
            radius={28}
            speed={50}
            returnBounce={0.38}
            landingDip={0.026}
            holdMs={1200}
            outcome="resolve"
            latency={900}
            disabled={!canBuy}
          />

          {amountValid && <p className="text-sm font-medium">{formatMoney(amount)}</p>}
        </div>
      </div>
        </div>
      </Section>

      {/* CLAIM CODE */}
      <Section title="Add a code">
        <form onSubmit={handleClaim} className="flex max-w-lg gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="GC-XXXX-XXXX"
            autoComplete="off"
            aria-label="Gift card code"
            className={inputClass}
          />

          <button type="submit" disabled={!codeInput.trim()} className={`${pillButton} shrink-0`}>
            Add
          </button>
        </form>
      </Section>

      {/* ACTIVITY: latest 5 only */}
      {activity.length > 0 && (
        <Section title="Activity">
          <ul className="divide-y divide-border border-y border-border">
            {activity.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-4 py-5">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.note && <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>}
                </div>

                <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </main>
  );
}