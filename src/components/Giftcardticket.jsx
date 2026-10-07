import TearTicket from "./TearTicket";
import { formatMoney } from "./Rewardscontext";

// Inline gradient so no image file is needed. Swap for your own artwork if you like,
// e.g. image="/gift-card.jpg".
const CARD_ART =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='420' height='230' viewBox='0 0 420 230'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='#e4ccb8'/><stop offset='1' stop-color='#a37e64'/>" +
      "</linearGradient></defs><rect width='420' height='230' fill='url(#g)'/></svg>"
  );

export default function GiftCardTicket({ card, onTear }) {
  return (
    <div className="max-w-full overflow-x-auto py-2">
      <TearTicket
        image={CARD_ART}
        imageAlt="Gift card"
        stub={
          <div>
            <h3 className="text-sm font-medium">Gift card</h3>
            <p className="text-xs opacity-80">Tear to redeem</p>
            <span className="text-xs tracking-wider">{card.code}</span>
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
        rotate={4}
        tilt
        tiltMax={9}
        tiltReach={260}
        parallax={6}
        perspective={1000}
        background="hsl(var(--foreground))"
        color="hsl(var(--background))"
        border
        borderWidth={1}
        recenter
      >
        <div>
          <p className="text-3xl font-medium">{formatMoney(card.amount)}</p>
          <p className="text-xs opacity-90">Store gift card</p>
        </div>
      </TearTicket>
    </div>
  );
}