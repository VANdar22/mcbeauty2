import { useCallback, useEffect, useRef, useState } from "react";

const Arrow = ({ dir }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={dir === "next" ? "M5 12h14m-6-6 6 6-6 6" : "M19 12H5m6-6-6 6 6 6"} />
  </svg>
);

/*
  Swipeable row of cards. Native scroll + snap, so touch swipe, trackpad
  and keyboard scrolling all work. Arrows appear on desktop only.
  Children should be the cards; each gets a fixed responsive width here.
*/
export default function ProductCarousel({ children, label = "Products" }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, children]);

  const scrollByPage = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className="group/carousel relative">
      <div
        ref={trackRef}
        onScroll={update}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth scroll-px-4 px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:-mx-8 md:scroll-px-8 md:gap-5 md:px-8 [&::-webkit-scrollbar]:hidden"      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div
                key={child?.key ?? i}
                className="w-[62%] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[23.5%]"
              >
                {child}
              </div>
            ))
          : children}
      </div>

      {canPrev && (
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Previous products"
          className="absolute left-2 top-[35%] hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-md transition-opacity hover:opacity-80 md:grid"
        >
          <Arrow dir="prev" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Next products"
          className="absolute right-2 top-[35%] hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-md transition-opacity hover:opacity-80 md:grid"
        >
          <Arrow dir="next" />
        </button>
      )}
    </div>
  );
}