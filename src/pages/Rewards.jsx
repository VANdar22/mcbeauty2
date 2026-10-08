import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useRewards,
  formatMoney,
  REWARD_TIERS,
} from "../components/Rewardscontext";

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

/* ================================================================
   GIFT CARD IMAGE
   ================================================================ */

function GiftCardImage({ amount, className = "" }) {
  const src = GIFT_CARD_IMAGES[amount];

  return (
    <div
      className={`aspect-[7/5] overflow-hidden rounded-lg bg-background shadow-[var(--shadow-md)] ${className}`}
    >
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

const pillButton = `rounded-full border border-foreground px-5 py-2.5 text-sm font-medium transition-all duration-200 ${focusRing} disabled:cursor-not-allowed disabled:opacity-30`;

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground focus:ring-1 focus:ring-foreground";

/* ================================================================
   SECTION
   ================================================================ */

function Section({ title, subtitle, action, children }) {
  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium tracking-tight">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

/* ================================================================
   PAYMENT
   ================================================================ */

async function payForGiftCard(order) {
  return order;
}

/* ================================================================
   REWARDS PAGE
   ================================================================ */

export default function Rewards() {
  const navigate = useNavigate();

  const {
    points,
    credit,
    cards,
    redeemPointsForCard,
    purchaseGiftCard,
    claimCode,
  } = useRewards();

  const [status, setStatus] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [amount, setAmount] = useState(25);
  const [mode, setMode] = useState("self");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");

  /* ================================================================
     FILTER CARDS
     ================================================================ */

  const wallet = cards.filter(
    (card) => card.claimed && !card.used
  );

  const history = cards.filter(
    (card) => card.used
  );

  const purchased = cards.filter(
    (card) => card.source === "purchase"
  );

  /* ================================================================
     VALIDATION
     ================================================================ */

  const amountValid = DENOMINATIONS.includes(Number(amount));

  const giftValid =
    mode === "self" ||
    Boolean(
      recipientName.trim() &&
        /^\S+@\S+\.\S+$/.test(recipientEmail)
    );

  const canBuy = amountValid && giftValid;

  /* ================================================================
     REDEEM POINTS
     ================================================================ */

  const handleRedeemPoints = (tier) => {
    const card = redeemPointsForCard(tier);

    setStatus(
      card
        ? {
            type: "ok",
            text: `${formatMoney(
              card.amount
            )} gift card added to your wallet.`,
          }
        : {
            type: "error",
            text: "You don't have enough points for that reward.",
          }
    );
  };

  /* ================================================================
     CLAIM CODE
     ================================================================ */

  const handleClaim = (event) => {
    event.preventDefault();

    const result = claimCode(codeInput);

    if (result.ok) {
      setCodeInput("");

      setStatus({
        type: "ok",
        text: `${formatMoney(
          result.card.amount
        )} gift card added to your wallet.`,
      });

      return;
    }

    setStatus({
      type: "error",
      text: result.reason,
    });
  };

  /* ================================================================
     PURCHASE
     ================================================================ */

  const handlePurchased = () => {
    const card = purchaseGiftCard({
      amount: Number(amount),
      recipientName:
        mode === "gift"
          ? recipientName.trim()
          : "",
      recipientEmail:
        mode === "gift"
          ? recipientEmail.trim()
          : "",
      message:
        mode === "gift"
          ? message.trim()
          : "",
    });

    setStatus({
      type: "ok",
      text:
        mode === "gift"
          ? `Gift card purchased for ${card.recipientName}.`
          : `${formatMoney(
              card.amount
            )} gift card added to your wallet.`,
    });

    setRecipientName("");
    setRecipientEmail("");
    setMessage("");
  };

  /* ================================================================
     OPEN CARD
     ================================================================ */

  const openGiftCard = (card) => {
    navigate(`/rewards/card/${card.id}`);
  };

  /* ================================================================
     PAGE
     ================================================================ */

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-28">

      {/* HEADER */}

      <header>
        <p className="text-sm font-medium text-muted-foreground">
          Rewards
        </p>

        <h1 className="mt-2 text-4xl font-medium tracking-tight sm:text-5xl">
          Your rewards.
        </h1>

        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Earn points, turn them into gift cards, and spend your
          rewards when you're ready.
        </p>
      </header>

      {/* BALANCES */}

      <section className="mt-10 grid overflow-hidden rounded-2xl border border-border sm:grid-cols-2">

        <div className="p-6 sm:p-8">
          <p className="text-sm text-muted-foreground">
            Points
          </p>

          <p className="mt-2 text-4xl font-medium tracking-tight">
            {points.toLocaleString()}
          </p>
        </div>

        <div className="border-t border-border p-6 sm:border-l sm:border-t-0 sm:p-8">
          <p className="text-sm text-muted-foreground">
            Store credit
          </p>

          <p className="mt-2 text-4xl font-medium tracking-tight">
            {formatMoney(credit)}
          </p>
        </div>

      </section>

      {/* STATUS */}

      {status && (
        <div
          role="status"
          className={`mt-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
            status.type === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-foreground"
          }`}
        >
          <span>
            {status.type === "error" ? "!" : "✓"}
          </span>

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

      {/* REDEEM POINTS */}

      <Section
        title="Redeem points"
        subtitle="Choose a reward and it will appear in your wallet."
      >
        <div className="grid overflow-hidden rounded-2xl border border-border sm:grid-cols-3">

          {REWARD_TIERS.map((tier, index) => {
            const affordable = points >= tier.cost;

            return (
              <div
                key={tier.id}
                className={`flex flex-col justify-between p-6 ${
                  index !== 0
                    ? "border-t border-border sm:border-l sm:border-t-0"
                    : ""
                }`}
              >
                <div>

                  <GiftCardImage
                    amount={tier.amount}
                    className="mb-5 w-36"
                  />

                  <p className="text-2xl font-medium">
                    {formatMoney(tier.amount)}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Gift card
                  </p>

                  <p className="mt-4 text-sm">
                    {tier.cost.toLocaleString()} points
                  </p>

                </div>

                <button
                  type="button"
                  disabled={!affordable}
                  onClick={() =>
                    handleRedeemPoints(tier)
                  }
                  className={`${pillButton} mt-6 w-fit ${
                    affordable
                      ? "hover:bg-foreground hover:text-background"
                      : ""
                  }`}
                >
                  {affordable
                    ? "Redeem"
                    : `${(
                        tier.cost - points
                      ).toLocaleString()} more`}
                </button>

              </div>
            );
          })}

        </div>
      </Section>

      {/* WALLET */}

      <Section
        title="Your gift cards"
        subtitle={
          wallet.length
            ? "Ready when you are."
            : "Your redeemed gift cards will appear here."
        }
        action={
          wallet.length > 0 ? (
            <span className="text-sm text-muted-foreground">
              {wallet.length}{" "}
              {wallet.length === 1
                ? "card"
                : "cards"}
            </span>
          ) : null
        }
      >

        {wallet.length > 0 ? (

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">

            {wallet.map((card) => (

              <button
                key={card.id}
                type="button"
                onClick={() =>
                  openGiftCard(card)
                }
                className={`group rounded-lg text-left ${focusRing}`}
              >

                <div className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-1 motion-reduce:transform-none motion-reduce:transition-none">

                  <GiftCardImage
                    amount={card.amount}
                  />

                </div>

                <p className="mt-3 text-sm font-medium">
                  {formatMoney(card.amount)}
                </p>

                <p className="text-xs text-muted-foreground">
                  Tap to view
                </p>

              </button>

            ))}

          </div>

        ) : (

          <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">

            <p className="text-sm text-muted-foreground">
              No gift cards in your wallet yet.
            </p>

          </div>

        )}

      </Section>

      {/* GIVE A GIFT */}

      <Section
        title="Give a gift"
        subtitle="Send a gift card or keep one for yourself."
      >

        <div className="rounded-2xl border border-border p-6 sm:p-8">

          {/* CHOOSE CARD */}

          <div>

            <p
              className="text-sm font-medium"
              id="amount-label"
            >
              Choose a card
            </p>

            <div
              role="radiogroup"
              aria-labelledby="amount-label"
              className="mt-4 grid max-w-xl grid-cols-3 gap-3 sm:gap-6"
            >

              {DENOMINATIONS.map((value) => {

                const selected =
                  Number(amount) === value;

                return (

                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={formatMoney(value)}
                    onClick={() =>
                      setAmount(value)
                    }
                    className={`rounded-lg transition-all duration-300 motion-reduce:transform-none motion-reduce:transition-none ${focusRing} ${
                      selected
                        ? "-translate-y-1.5 ring-2 ring-foreground ring-offset-4 ring-offset-background"
                        : "opacity-60 hover:-translate-y-0.5 hover:opacity-100"
                    }`}
                  >

                    <GiftCardImage
                      amount={value}
                    />

                  </button>

                );

              })}

            </div>

          </div>

          {/* RECIPIENT */}

          <div className="mt-10">

            <p className="text-sm font-medium">
              Who is it for?
            </p>

            <div className="mt-3 flex gap-2">

              {[
                ["self", "Me"],
                ["gift", "Someone else"],
              ].map(([value, label]) => (

                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  onClick={() =>
                    setMode(value)
                  }
                  className={`${pillButton} ${
                    mode === value
                      ? "bg-foreground text-background"
                      : "hover:bg-muted"
                  }`}
                >
                  {label}
                </button>

              ))}

            </div>

            {mode === "gift" && (

              <div className="mt-5 grid max-w-xl gap-3">

                <input
                  value={recipientName}
                  onChange={(e) =>
                    setRecipientName(
                      e.target.value
                    )
                  }
                  placeholder="Recipient's name"
                  className={inputClass}
                />

                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) =>
                    setRecipientEmail(
                      e.target.value
                    )
                  }
                  placeholder="Recipient's email"
                  className={inputClass}
                />

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Add a message (optional)"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />

              </div>

            )}

          </div>

          {/* PAYMENT */}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">

            <SlideCommit
              label="Slide to pay"
              doneLabel="Paid"
              errorLabel="Payment failed"
              onConfirm={() =>
                payForGiftCard({
                  amount: Number(amount),
                  mode,
                  recipientEmail,
                })
              }
              onDone={handlePurchased}
              onError={() =>
                setStatus({
                  type: "error",
                  text: "Payment failed. Please try again.",
                })
              }
              trackColor="hsl(var(--foreground))"
              handleColor="hsl(var(--background))"
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

            {amountValid && (
              <p className="text-sm font-medium">
                {formatMoney(amount)}
              </p>
            )}

          </div>

        </div>

      </Section>

      {/* CLAIM CODE */}

      <Section
        title="Have a gift card code?"
        subtitle="Add a card that was purchased or sent to you."
      >

        <form
          onSubmit={handleClaim}
          className="flex max-w-lg gap-2"
        >

          <input
            value={codeInput}
            onChange={(e) =>
              setCodeInput(e.target.value)
            }
            placeholder="GC-XXXX-XXXX"
            autoComplete="off"
            className={inputClass}
          />

          <button
            type="submit"
            disabled={!codeInput.trim()}
            className={`${pillButton} shrink-0`}
          >
            Add
          </button>

        </form>

      </Section>

      {/* ACTIVITY */}

      {(purchased.length > 0 ||
        history.length > 0) && (

        <Section
          title="Activity"
          subtitle="Your recent gift card activity."
        >

          <div className="divide-y divide-border border-y border-border">

            {purchased.map((card) => (

              <div
                key={`purchase-${card.id}`}
                className="flex items-center justify-between gap-4 py-4"
              >

                <div>

                  <p className="text-sm font-medium">
                    {formatMoney(card.amount)} gift card
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">

                    {card.recipientName
                      ? `For ${card.recipientName}`
                      : "For you"}

                    {" · "}

                    {new Date(
                      card.createdAt
                    ).toLocaleDateString()}

                  </p>

                </div>

                <span className="text-xs text-muted-foreground">
                  {card.used
                    ? "Redeemed"
                    : card.claimed
                    ? "In wallet"
                    : "Unclaimed"}
                </span>

              </div>

            ))}

            {history.map((card) => (

              <div
                key={`history-${card.id}`}
                className="flex items-center justify-between gap-4 py-4"
              >

                <div>

                  <p className="text-sm font-medium">
                    {formatMoney(card.amount)} redeemed
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.usedAt
                      ? new Date(
                          card.usedAt
                        ).toLocaleDateString()
                      : ""}
                  </p>

                </div>

                <span className="text-xs text-muted-foreground">
                  Store credit
                </span>

              </div>

            ))}

          </div>

        </Section>

      )}

    </main>
  );
}