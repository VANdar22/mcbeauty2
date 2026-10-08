import TearTicket from "./TearTicket";
import { formatMoney } from "./Rewardscontext";

/* ------------------------------------------------------------------ */
/* DESIGN KNOBS — change these to restyle the ticket                   */
/* ------------------------------------------------------------------ */

const STORE_NAME = "MC Beauty";

// The artwork on the front of every ticket (your Cloudinary image).
const TICKET_IMAGE =
  "https://res.cloudinary.com/zomqdsfa/image/upload/v1791440785/cosmos_845597857.webp";

const TAGLINE = "Use on skincare, perfume & hair care";

// Ticket + stub colours (theme tokens from your index.css).
const PAPER = "hsl(var(--foreground))";
const INK = "hsl(var(--background))";

/*
  TearTicket gives `children` (front) and `stub` an empty absolutely-positioned box:
  no padding, no layout. The wrappers below add the padding and position the text.
  The front box is 280 x 230, the stub box is 140 x 230.
*/
export default function GiftCardTicket({ card, onTear, rotate = 4, tiltMax = 9 }) {
  const recipient = card.recipientName ? `For ${card.recipientName}` : "For you";
  const issued = card.createdAt
    ? new Date(card.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="w-full max-w-full py-2">
      <TearTicket
        image={TICKET_IMAGE}
        imageAlt={`${STORE_NAME} gift card`}
        /* Tear-off stub: the details */
        stub={
          <div className="flex h-full flex-col justify-between py-4 pl-5 pr-3.5">
            <div>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-80">Gift card</h3>
              <p className="mt-2 text-[13px] font-medium leading-tight">{recipient}</p>
              {card.message && (
                <p className="mt-1.5 line-clamp-3 text-[11px] italic leading-snug opacity-80">“{card.message}”</p>
              )}
            </div>

            <div className="space-y-1">
              {issued && <p className="text-[11px] opacity-70">Issued {issued}</p>}
              <span className="block text-[11px] tracking-[0.12em]">{card.code}</span>
              <p className="text-[11px] opacity-80">Tear to redeem</p>
            </div>
          </div>
        }
        orientation="horizontal"
        scrim
        imageRadius={8}
        onTear={() => onTear(card)}
        width={420}
        height={230}
        stubSize={140}
        radius={16}
        holes={12}
        holeSize={6}
        notch={3}
        roughness={0}
        tearAngle={30}
        stretch={30}
        resistance={0.45}
        rotate={rotate}
        tilt
        tiltMax={tiltMax}
        tiltReach={260}
        parallax={6}
        perspective={1000}
        background={PAPER}
        color={INK}
        border
        borderWidth={1}
        recenter
      >
        {/* Front of the ticket: store name, price, tagline — pinned to the bottom-left */}
        <div className="flex h-full flex-col justify-end px-5 pb-[18px]">
          <p className="text-[11px] uppercase tracking-[0.25em] opacity-80">{STORE_NAME}</p>
          <p className="mt-1.5 text-4xl font-light leading-none tracking-tight">{formatMoney(card.amount)}</p>
          <p className="mt-2 text-xs opacity-90">{TAGLINE}</p>
        </div>
      </TearTicket>
    </div>
  );
}