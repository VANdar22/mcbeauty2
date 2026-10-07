import React, { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useRewards,
  formatMoney,
} from "../components/Rewardscontext";

import TearTicket from "../components/TearTicket";

const CARD_ART =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="800"
      height="500"
      viewBox="0 0 800 500"
    >
      <defs>
        <linearGradient
          id="background"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stop-color="#111111" />
          <stop offset="1" stop-color="#555555" />
        </linearGradient>
      </defs>

      <rect
        width="800"
        height="500"
        rx="36"
        fill="url(#background)"
      />

      <circle
        cx="690"
        cy="100"
        r="140"
        fill="white"
        opacity="0.05"
      />

      <circle
        cx="100"
        cy="430"
        r="180"
        fill="white"
        opacity="0.04"
      />
    </svg>
  `);

export default function GiftCardReveal() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    cards,
    credit,
    redeemGiftCard,
  } = useRewards();

  const [redeemed, setRedeemed] = useState(false);
  const [startingCredit, setStartingCredit] =
    useState(credit);

  const card = useMemo(
    () =>
      cards.find(
        (item) => String(item.id) === String(id)
      ),
    [cards, id]
  );

  useEffect(() => {
    setStartingCredit(credit);
  }, [credit]);

  /*
   * ----------------------------------------
   * Card not found
   * ----------------------------------------
   */

  if (!card) {
    return (
      <main className="relative min-h-[100svh] w-full">
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <p className="text-2xl font-medium">
              Gift card not found
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              This gift card could not be found.
            </p>

            <button
              type="button"
              onClick={() => navigate("/rewards")}
              className="
                mt-6
                rounded-full
                border
                border-foreground
                px-6
                py-3
                text-sm
                font-medium
                transition
                hover:bg-foreground
                hover:text-background
              "
            >
              Back to rewards
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------------
   * Already redeemed
   * ----------------------------------------
   */

  if (card.used && !redeemed) {
    return (
      <main className="relative min-h-[100svh] w-full">
        <button
          type="button"
          onClick={() => navigate("/rewards")}
          className="
            absolute
            left-6
            top-6
            z-20
            text-sm
            text-muted-foreground
            transition
            hover:text-foreground
            sm:left-8
            sm:top-8
          "
        >
          ← Back
        </button>

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-medium tracking-tight">
              Already redeemed
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This gift card has already been added to
              your store credit.
            </p>

            <button
              type="button"
              onClick={() => navigate("/rewards")}
              className="
                mt-8
                rounded-full
                bg-foreground
                px-7
                py-3
                text-sm
                font-medium
                text-background
                transition
                hover:opacity-80
              "
            >
              Back to rewards
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------------
   * Tear handler
   * ----------------------------------------
   */

  const handleTear = () => {
    setStartingCredit(credit);

    redeemGiftCard(card.id);

    setRedeemed(true);
  };

  /*
   * ----------------------------------------
   * Success screen
   * ----------------------------------------
   */

  if (redeemed) {
    const newCredit =
      startingCredit + Number(card.amount);

    return (
      <main className="relative min-h-[100svh] w-full">
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-xl text-background">
              ✓
            </div>

            <p className="mt-8 text-sm font-medium text-muted-foreground">
              Gift card redeemed
            </p>

            <h1 className="mt-2 text-5xl font-medium tracking-tight">
              {formatMoney(card.amount)}
            </h1>

            <p className="mt-4 text-base text-muted-foreground">
              Added to your store credit.
            </p>

            <div className="mt-10 border-y border-border py-6">
              <p className="text-sm text-muted-foreground">
                Store credit
              </p>

              <p className="mt-1 text-2xl font-medium">
                {formatMoney(newCredit)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/rewards")}
              className="
                mt-8
                w-full
                rounded-full
                bg-foreground
                px-7
                py-3
                text-sm
                font-medium
                text-background
                transition
                hover:opacity-80
              "
            >
              Done
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------------
   * MAIN TEAR SCREEN
   * ----------------------------------------
   */

  return (
    <main className="relative min-h-[100svh] w-full overflow-hidden">
      {/* -------------------------------- */}
      {/* Close button */}
      {/* -------------------------------- */}

      <button
        type="button"
        onClick={() => navigate("/rewards")}
        aria-label="Close"
        className="
          absolute
          right-5
          top-5
          z-50
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-muted
          text-lg
          transition
          hover:bg-foreground
          hover:text-background
          sm:right-8
          sm:top-8
        "
      >
        ×
      </button>

      {/* -------------------------------- */}
      {/* Small header */}
      {/* -------------------------------- */}

      <div
        className="
          absolute
          left-1/2
          top-16
          z-10
          w-full
          -translate-x-1/2
          px-6
          text-center
          sm:top-20
        "
      >
        <p className="text-sm font-medium text-muted-foreground">
          Your gift
        </p>

        <h1 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
          A little something for you.
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Tear the card to add the gift value to your
          store credit.
        </p>
      </div>

      {/* -------------------------------- */}
      {/* TRUE CENTER STAGE */}
      {/* -------------------------------- */}

      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          px-5
          pt-20
          pb-20
        "
      >
        <div
          className="
            flex
            w-full
            items-center
            justify-center
          "
        >
          <div
            className="
              w-full flex justify-center
            "
          >
            <TearTicket
              image={CARD_ART}
              imageAlt="Gift card"
              stub={
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Gift card
                  </p>

                  <p className="mt-1 text-xs opacity-60">
                    Tear to redeem
                  </p>

                  <p className="mt-4 text-xs tracking-[0.18em] opacity-70">
                    {card.code}
                  </p>
                </div>
              }
              orientation="horizontal"
              scrim
              imageRadius={18}
              onTear={handleTear}
              width={420}
              height={240}
              stubSize={135}
              radius={18}
              holes={12}
              holeSize={6}
              notch={3}
              roughness={0}
              tearAngle={30}
              stretch={30}
              resistance={0.45}
              rotate={2}
              tilt
              tiltMax={6}
              tiltReach={260}
              parallax={5}
              perspective={1000}
              background="hsl(var(--foreground))"
              color="hsl(var(--background))"
              border
              borderWidth={1}
              recenter
            >
              <div className="text-center text-background">
                <p className="text-5xl font-medium tracking-tight">
                  {formatMoney(card.amount)}
                </p>

                <p className="mt-2 text-sm opacity-70">
                  Store gift card
                </p>
              </div>
            </TearTicket>
          </div>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Bottom hint */}
      {/* -------------------------------- */}

      <div
        className="
          absolute
          bottom-8
          left-1/2
          z-10
          -translate-x-1/2
          text-center
        "
      >
        <p className="whitespace-nowrap text-sm text-muted-foreground">
          Pull the card apart to redeem
        </p>

        <p className="mt-2 text-lg text-muted-foreground">
          ←
        </p>
      </div>
    </main>
  );
}