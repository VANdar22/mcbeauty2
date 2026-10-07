import React from "react";
import { formatMoney } from "./Rewardscontext";

export default function GiftCardRow({ card, onClick }) {
  const status = card.used
    ? "Redeemed"
    : card.claimed
      ? "Ready to redeem"
      : "Not yet claimed";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={card.used || !card.claimed}
      className="
        group
        flex
        w-full
        items-center
        justify-between
        border-b
        border-border
        py-5
        text-left
        transition-opacity
        hover:opacity-65
        disabled:cursor-default
        disabled:hover:opacity-100
      "
    >
      <div className="flex min-w-0 items-center gap-4">
        {/* Small visual mark */}
        <div
          className="
            flex
            h-12
            w-16
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-foreground
            text-sm
            font-medium
            text-background
          "
        >
          {formatMoney(card.amount).replace(".00", "")}
        </div>

        <div className="min-w-0">
          <p className="text-base font-medium">
            Gift card
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {status}
          </p>
        </div>
      </div>

      {!card.used && card.claimed && (
        <span
          className="
            ml-4
            text-xl
            text-muted-foreground
            transition-transform
            duration-200
            group-hover:translate-x-1
          "
          aria-hidden="true"
        >
          →
        </span>
      )}
    </button>
  );
}