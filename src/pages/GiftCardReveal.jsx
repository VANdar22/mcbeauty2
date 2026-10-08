import React, { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useRewards, formatMoney } from "../components/Rewardscontext";
import GiftCardTicket from "../components/GiftCardTicket";

const solidButton =
  "rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition hover:opacity-80";

const outlineButton =
  "rounded-full border border-foreground px-6 py-3 text-sm font-medium transition hover:bg-foreground hover:text-background";

export default function GiftCardReveal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { cards, credit, redeemGiftCard } = useRewards();

  const [redeemed, setRedeemed] = useState(false);

  // Credit as it was at the moment of tearing (so the success screen shows the right total).
  const startingCredit = useRef(credit);

  const card = useMemo(() => cards.find((item) => String(item.id) === String(id)), [cards, id]);

  const goBack = () => navigate("/rewards");

  /* Card not found */
  if (!card) {
    return (
      <main className="relative min-h-[100svh] w-full">
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <p className="text-2xl font-medium">Gift card not found</p>
            <p className="mt-2 text-sm text-muted-foreground">This gift card could not be found.</p>
            <button type="button" onClick={goBack} className={`${outlineButton} mt-6`}>
              Back to rewards
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* Already redeemed */
  if (card.used && !redeemed) {
    return (
      <main className="relative min-h-[100svh] w-full">
        <button
          type="button"
          onClick={goBack}
          className="absolute left-6 top-6 z-20 text-sm text-muted-foreground transition hover:text-foreground sm:left-8 sm:top-8"
        >
          ← Back
        </button>

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl">✓</div>
            <h1 className="mt-6 text-3xl font-medium tracking-tight">Already redeemed</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This gift card has already been added to your store credit.
            </p>
            <button type="button" onClick={goBack} className={`${solidButton} mt-8`}>
              Back to rewards
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleTear = () => {
    startingCredit.current = credit;
    redeemGiftCard(card.id);
    setRedeemed(true);
  };

  /* Success */
  if (redeemed) {
    const newCredit = startingCredit.current + Number(card.amount);

    return (
      <main className="relative min-h-[100svh] w-full">
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-xl text-background">
              ✓
            </div>

            <p className="mt-8 text-sm font-medium text-muted-foreground">Gift card redeemed</p>
            <h1 className="mt-2 text-5xl font-medium tracking-tight">{formatMoney(card.amount)}</h1>
            <p className="mt-4 text-base text-muted-foreground">Added to your store credit.</p>

            <div className="mt-10 border-y border-border py-6">
              <p className="text-sm text-muted-foreground">Store credit</p>
              <p className="mt-1 text-2xl font-medium">{formatMoney(newCredit)}</p>
            </div>

            <button type="button" onClick={goBack} className={`${solidButton} mt-8 w-full`}>
              Done
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* Tear screen */
  return (
    <main className="relative min-h-[100svh] w-full overflow-hidden">
      <button
        type="button"
        onClick={goBack}
        aria-label="Close"
        className="absolute right-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg transition hover:bg-foreground hover:text-background sm:right-8 sm:top-8"
      >
        ×
      </button>

      <div className="absolute left-1/2 top-16 z-10 w-full -translate-x-1/2 px-6 text-center sm:top-20">
        <p className="text-sm font-medium text-muted-foreground">Your gift</p>
        <h1 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">A little something for you.</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Tear the card to add the gift value to your store credit.
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-5 pb-20 pt-20">
        <div className="flex w-full justify-center">
          <GiftCardTicket card={card} onTear={handleTear} rotate={2} tiltMax={6} />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center">
        <p className="whitespace-nowrap text-sm text-muted-foreground">Pull the card apart to redeem</p>
        <p className="mt-2 text-lg text-muted-foreground">←</p>
      </div>
    </main>
  );
}