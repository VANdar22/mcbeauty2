import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const RewardsContext = createContext(null);
const STORAGE_KEY = "rewards:v1";
const EMPTY = { points: 0, credit: 0, cards: [] };

// TODO: load these from your settings / database
export const REWARD_TIERS = [
  { id: "t5", cost: 70, amount: 5 },
  { id: "t10", cost: 1000, amount: 10 },
  { id: "t25", cost: 2000, amount: 25 },
];
export const GIFT_CARD_PRESETS = [10, 25, 50, 100];
export const GIFT_CARD_MIN = 5;
export const GIFT_CARD_MAX = 500;
export const CURRENCY = "$";

export const formatMoney = (n) =>
  `${CURRENCY}${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

// TODO: in production, codes must be generated and validated by your server.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function makeCode() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const s = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `GC-${s.slice(0, 4)}-${s.slice(4)}`;
}
const normalize = (code) => String(code).toUpperCase().replace(/[^A-Z0-9]/g, "");

/*
  Card shape:
  { id, code, amount, source: "points" | "purchase", claimed, used,
    recipientName, recipientEmail, message, createdAt, usedAt }

  claimed = sits in this account's wallet and can be torn (redeemed).
  Cards bought for someone else start unclaimed until their code is entered.
*/
export function RewardsProvider({ children }) {
  const [data, setData] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable: still works for this session */
    }
  }, [data]);

  const earnPoints = useCallback((n) => {
    const pts = Math.floor(Number(n));
    if (!(pts > 0)) return;
    setData((prev) => ({ ...prev, points: prev.points + pts }));
  }, []);

  // Spend points -> get a gift card in the wallet (not yet redeemed).
  const redeemPointsForCard = useCallback(
    (tier) => {
      if (data.points < tier.cost) return null;
      const code = makeCode();
      const card = {
        id: code,
        code,
        amount: tier.amount,
        source: "points",
        claimed: true,
        used: false,
        createdAt: Date.now(),
      };
      setData((prev) =>
        prev.points < tier.cost
          ? prev
          : { ...prev, points: prev.points - tier.cost, cards: [card, ...prev.cards] }
      );
      return card;
    },
    [data.points]
  );

  // TODO: take payment (e.g. SlideCommit + your API) before calling this.
  const purchaseGiftCard = useCallback(({ amount, recipientName, recipientEmail, message }) => {
    const code = makeCode();
    const forSomeoneElse = Boolean(recipientEmail);
    const card = {
      id: code,
      code,
      amount: Number(amount),
      source: "purchase",
      claimed: !forSomeoneElse,
      used: false,
      recipientName: recipientName || "",
      recipientEmail: recipientEmail || "",
      message: message || "",
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, cards: [card, ...prev.cards] }));
    return card;
  }, []);

  // Enter a code to add a gift card to the wallet.
  // TODO: validate against your backend; this only knows cards stored on this device.
  const claimCode = useCallback(
    (code) => {
      const target = normalize(code);
      const card = data.cards.find((c) => normalize(c.code) === target);
      if (!target || !card) return { ok: false, reason: "We couldn't find that code." };
      if (card.used) return { ok: false, reason: "This gift card has already been redeemed." };
      if (card.claimed) return { ok: false, reason: "This gift card is already in your wallet." };
      setData((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === card.id ? { ...c, claimed: true } : c)),
      }));
      return { ok: true, card };
    },
    [data.cards]
  );

  // Called when the ticket is torn: marks it used and adds its value as store credit.
  const redeemGiftCard = useCallback((id) => {
    setData((prev) => {
      const card = prev.cards.find((c) => c.id === id);
      if (!card || card.used || !card.claimed) return prev;
      return {
        ...prev,
        credit: prev.credit + card.amount,
        cards: prev.cards.map((c) => (c.id === id ? { ...c, used: true, usedAt: Date.now() } : c)),
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      points: data.points,
      credit: data.credit,
      cards: data.cards,
      earnPoints,
      redeemPointsForCard,
      purchaseGiftCard,
      claimCode,
      redeemGiftCard,
    }),
    [data, earnPoints, redeemPointsForCard, purchaseGiftCard, claimCode, redeemGiftCard]
  );

  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>;
}

export function useRewards() {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error("useRewards must be used inside <RewardsProvider>");
  return ctx;
}