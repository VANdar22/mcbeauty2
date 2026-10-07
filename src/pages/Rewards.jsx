import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useRewards,
  formatMoney,
  REWARD_TIERS,
  GIFT_CARD_PRESETS,
  GIFT_CARD_MIN,
  GIFT_CARD_MAX,
} from "../components/Rewardscontext";

import SlideCommit from "../components/SlideCommit";
import GiftCardRow from "../components/GiftCardRow";

const pillButton = `
  rounded-full
  border
  border-foreground
  px-5
  py-2.5
  text-sm
  font-medium
  transition-all
  duration-200
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-ring
  focus-visible:ring-offset-2
  disabled:cursor-not-allowed
  disabled:opacity-30
`;

const inputClass = `
  w-full
  rounded-xl
  border
  border-input
  bg-background
  px-4
  py-3
  text-sm
  outline-none
  transition
  placeholder:text-muted-foreground
  focus:border-foreground
  focus:ring-1
  focus:ring-foreground
`;

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

// Replace this with your real payment API.
async function payForGiftCard(order) {
  return order;
}

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

  // Claim code
  const [codeInput, setCodeInput] = useState("");

  // Purchase
  const [amount, setAmount] = useState(25);
  const [mode, setMode] = useState("self");

  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");

  const wallet = cards.filter(
    (card) => card.claimed && !card.used
  );

  const history = cards.filter((card) => card.used);

  const purchased = cards.filter(
    (card) => card.source === "purchase"
  );

  const amountValid =
    Number.isFinite(Number(amount)) &&
    Number(amount) >= GIFT_CARD_MIN &&
    Number(amount) <= GIFT_CARD_MAX;

  const giftValid =
    mode === "self" ||
    Boolean(
      recipientName.trim() &&
        /^\S+@\S+\.\S+$/.test(recipientEmail)
    );

  const canBuy = amountValid && giftValid;

  // ----------------------------------------
  // Redeem points
  // ----------------------------------------

  const handleRedeemPoints = (tier) => {
    const card = redeemPointsForCard(tier);

    if (!card) {
      setStatus({
        type: "error",
        text: "You don't have enough points for that reward.",
      });

      return;
    }

    setStatus({
      type: "ok",
      text: `${formatMoney(card.amount)} gift card added to your wallet.`,
    });
  };

  // ----------------------------------------
  // Claim code
  // ----------------------------------------

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

  // ----------------------------------------
  // Purchase
  // ----------------------------------------

  const handlePurchased = () => {
    const card = purchaseGiftCard({
      amount: Number(amount),
      recipientName:
        mode === "gift" ? recipientName.trim() : "",
      recipientEmail:
        mode === "gift" ? recipientEmail.trim() : "",
      message:
        mode === "gift" ? message.trim() : "",
    });

    if (mode === "gift") {
      setStatus({
        type: "ok",
        text: `Gift card purchased for ${card.recipientName}.`,
      });
    } else {
      setStatus({
        type: "ok",
        text: `${formatMoney(
          card.amount
        )} gift card added to your wallet.`,
      });
    }

    // Reset gift fields
    setRecipientName("");
    setRecipientEmail("");
    setMessage("");
  };

  // ----------------------------------------
  // Open card
  // ----------------------------------------

  const openGiftCard = (card) => {
    navigate(`/rewards/card/${card.id}`);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-28">
      {/* -------------------------------- */}
      {/* Header */}
      {/* -------------------------------- */}

      <header>
        <p className="text-sm font-medium text-muted-foreground">
          Rewards
        </p>

        <h1 className="mt-2 text-4xl font-medium tracking-tight sm:text-5xl">
          Your rewards.
        </h1>

        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Earn points, turn them into gift cards, and
          spend your rewards when you're ready.
        </p>
      </header>

      {/* -------------------------------- */}
      {/* Balances */}
      {/* -------------------------------- */}

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

      {/* -------------------------------- */}
      {/* Status */}
      {/* -------------------------------- */}

      {status && (
        <div
          role="status"
          className={`
            mt-6
            flex
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            ${
              status.type === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-foreground"
            }
          `}
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

      {/* -------------------------------- */}
      {/* Redeem points */}
      {/* -------------------------------- */}

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
                className={`
                  flex
                  min-h-48
                  flex-col
                  justify-between
                  p-6
                  ${
                    index !== 0
                      ? "border-t border-border sm:border-l sm:border-t-0"
                      : ""
                  }
                `}
              >
                <div>
                  <p className="text-2xl font-medium">
                    {formatMoney(tier.amount)}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Gift card
                  </p>

                  <p className="mt-6 text-sm">
                    {tier.cost.toLocaleString()} points
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!affordable}
                  onClick={() =>
                    handleRedeemPoints(tier)
                  }
                  className={`
                    ${pillButton}
                    mt-6
                    w-fit
                    ${
                      affordable
                        ? "hover:bg-foreground hover:text-background"
                        : ""
                    }
                  `}
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

      {/* -------------------------------- */}
      {/* Wallet */}
      {/* -------------------------------- */}

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
          <div>
            {wallet.map((card) => (
              <GiftCardRow
                key={card.id}
                card={card}
                onClick={() =>
                  openGiftCard(card)
                }
              />
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

      {/* -------------------------------- */}
      {/* Buy */}
      {/* -------------------------------- */}

      <Section
        title="Give a gift"
        subtitle="Send a gift card or keep one for yourself."
      >
        <div className="rounded-2xl border border-border p-6 sm:p-8">
          {/* Amount */}

          <div>
            <p className="text-sm font-medium">
              Amount
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {GIFT_CARD_PRESETS.map((value) => {
                const selected =
                  Number(amount) === value;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setAmount(value)
                    }
                    className={`
                      ${pillButton}
                      ${
                        selected
                          ? "bg-foreground text-background"
                          : "hover:bg-muted"
                      }
                    `}
                  >
                    {formatMoney(value).replace(
                      ".00",
                      ""
                    )}
                  </button>
                );
              })}

              <input
                type="number"
                min={GIFT_CARD_MIN}
                max={GIFT_CARD_MAX}
                value={
                  GIFT_CARD_PRESETS.includes(
                    Number(amount)
                  )
                    ? ""
                    : amount
                }
                onChange={(event) =>
                  setAmount(
                    event.target.value === ""
                      ? ""
                      : Number(event.target.value)
                  )
                }
                placeholder="Other"
                className="w-24 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground"
              />
            </div>
          </div>

          {/* Recipient */}

          <div className="mt-8">
            <p className="text-sm font-medium">
              Who is it for?
            </p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                aria-pressed={mode === "self"}
                onClick={() => setMode("self")}
                className={`
                  ${pillButton}
                  ${
                    mode === "self"
                      ? "bg-foreground text-background"
                      : "hover:bg-muted"
                  }
                `}
              >
                Me
              </button>

              <button
                type="button"
                aria-pressed={mode === "gift"}
                onClick={() => setMode("gift")}
                className={`
                  ${pillButton}
                  ${
                    mode === "gift"
                      ? "bg-foreground text-background"
                      : "hover:bg-muted"
                  }
                `}
              >
                Someone else
              </button>
            </div>

            {mode === "gift" && (
              <div className="mt-5 grid max-w-xl gap-3">
                <input
                  value={recipientName}
                  onChange={(event) =>
                    setRecipientName(
                      event.target.value
                    )
                  }
                  placeholder="Recipient's name"
                  className={inputClass}
                />

                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(event) =>
                    setRecipientEmail(
                      event.target.value
                    )
                  }
                  placeholder="Recipient's email"
                  className={inputClass}
                />

                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Add a message (optional)"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            )}
          </div>

          {/* Payment */}

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
              onError={() => {
                setStatus({
                  type: "error",
                  text: "Payment failed. Please try again.",
                });
              }}
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

          {!amountValid && (
            <p className="mt-3 text-sm text-muted-foreground">
              Choose an amount between{" "}
              {formatMoney(GIFT_CARD_MIN)} and{" "}
              {formatMoney(GIFT_CARD_MAX)}.
            </p>
          )}
        </div>
      </Section>

      {/* -------------------------------- */}
      {/* Claim code */}
      {/* -------------------------------- */}

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
            onChange={(event) =>
              setCodeInput(event.target.value)
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

      {/* -------------------------------- */}
      {/* Activity */}
      {/* -------------------------------- */}

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
                      : "For you"}{" "}
                    ·{" "}
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