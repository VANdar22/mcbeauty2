import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoimage from "../assets/MCBlogo.png";
import { useCart } from "./Cartcontext";
import SearchBox from "./SearchBox";
import { SignInButton, UserButton, useUser } from "../lib/clerk";

/* ------------------------------------------------------------------ */
/* 1. DATA LAYER — replace the bodies of these functions with your DB  */
/*    calls (REST endpoint, Supabase, Firebase, etc.).                  */
/*    Product types / brands: [{ id, name, slug }]                      */
/*    Images:                 [{ id, title, href, imageUrl }]           */
/* ------------------------------------------------------------------ */

const PLACEHOLDER_PRODUCT_TYPES = [
  { id: 1, name: "Cleansers", slug: "cleansers" },
  { id: 2, name: "Toners", slug: "toners" },
  { id: 3, name: "Serums", slug: "serums" },
  { id: 4, name: "Moisturizers", slug: "moisturizers" },
  { id: 5, name: "Sunscreen", slug: "sunscreen" },
  { id: 6, name: "Scrubs", slug: "scrubs" },
  { id: 7, name: "Body Wash", slug: "body-wash" },
  { id: 8, name: "Body Oils", slug: "body-oils" },
];

const PLACEHOLDER_BRANDS = [
  { id: 1, name: "CeraVe", slug: "cerave" },
  { id: 2, name: "Cetaphil", slug: "cetaphil" },
  { id: 3, name: "Neutrogena", slug: "neutrogena" },
  { id: 4, name: "The Ordinary", slug: "the-ordinary" },
  { id: 5, name: "Olay", slug: "olay" },
  { id: 6, name: "NIVEA", slug: "nivea" },
  { id: 7, name: "Palmer's", slug: "palmers" },
];

async function fetchProductTypes() {
  // TODO: const res = await fetch("/api/product-types"); return res.json();
  return PLACEHOLDER_PRODUCT_TYPES;
}

async function fetchBrands() {
  // TODO: const res = await fetch("/api/brands?limit=20"); return res.json();
  return PLACEHOLDER_BRANDS;
}

async function fetchShopImages() {
  return [
    {
      id: 1,
      title: "Skincare",
      href: "/skincare",
      imageUrl: "https://res.cloudinary.com/zomqdsfa/image/upload/w_1000,q_auto:best,f_auto/v1791387398/skin2.webp",
    },
    {
      id: 2,
      title: "Haircare",
      href: "/haircare",
      imageUrl: "https://res.cloudinary.com/zomqdsfa/image/upload/w_1000,q_auto:best,f_auto/v1791387396/hair1.webp",
    },
    {
      id: 3,
      title: "Perfume",
      href: "/perfume",
      imageUrl: "https://res.cloudinary.com/zomqdsfa/image/upload/w_1000,q_auto:best,f_auto/v1791387397/perfume1.webp",
    },
  ];
}

function useCatalogMenu() {
  const [state, setState] = useState({
    productTypes: [],
    brands: [],
    shopImages: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchProductTypes(), fetchBrands(), fetchShopImages()])
      .then(([productTypes, brands, shopImages]) => {
        if (!cancelled)
          setState({
            productTypes,
            brands,
            shopImages: shopImages.slice(0, 3),
            loading: false,
            error: false,
          });
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: true }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/* ------------------------------------------------------------------ */
/* 2. NAV CONFIG                                                       */
/*    Each tab with `mega: true` opens its own panel (see TabContent). */
/* ------------------------------------------------------------------ */

const NAV_TABS = [
  { key: "shop", label: "Shop", href: "/shop", mega: true },
  { key: "new", label: "What's New", href: "/new", mega: true },
  { key: "brands", label: "Brands", href: "/brands", mega: true },
];

const UTILITY_LINKS = [
  ["Track an order", "/orders"],
  ["Gift cards", "/rewards"],
];

// Brands panel: show this many brands (order them by popularity in your DB),
// then an "All brands" link. Set GROUP_AZ = true to show every brand grouped A–Z instead.
const BRANDS_SHOWN = 16;
const GROUP_AZ = false;

// Text links for the "What's New" panel. Edit, or load from your database.
const NEW_LINKS = [
  ["New arrivals", "/products?sort=new"],
  ["New this week", "/products?sort=new&range=week"],
  ["Back in stock", "/products?filter=restocked"],
  ["Coming soon", "/products?filter=coming-soon"],
];

const AVAILABLE_LINKS = [
  ["In stock now", "/products?filter=in-stock"],
  ["Ready to ship", "/products?filter=ready-to-ship"],
  ["Best sellers", "/products?sort=best-selling"],
  ["Deals available", "/products?collection=deals"],
];

/* ------------------------------------------------------------------ */
/* 3. SMALL PIECES                                                     */
/* ------------------------------------------------------------------ */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

// Client-side navigation: no full page reload.
function NavLink({ href, className = "", children, ...rest }) {
  return (
    <Link to={href} className={`${focusRing} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

function ImageCard({ item }) {
  return (
    <NavLink href={item.href} className="group block">
      <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted-foreground">Image</div>
        )}
      </div>
      <span className="mt-2 block text-sm font-medium">{item.title}</span>
    </NavLink>
  );
}

// `count` = how many images to show (3 for Shop)
function ImageGrid({ items, count, loading, className = "" }) {
  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      {loading
        ? Array.from({ length: count }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse bg-muted" />
          ))
        : items.map((item) => <ImageCard key={item.id} item={item} />)}
    </div>
  );
}

function ColumnTitle({ title, titleHref }) {
  return (
    <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
      {titleHref ? (
        <NavLink href={titleHref} className="hover:text-foreground">
          {title}
        </NavLink>
      ) : (
        title
      )}
    </h3>
  );
}

const itemLink =
  "inline-block py-0.5 text-sm text-foreground/80 underline-offset-4 hover:text-foreground hover:underline";

// Database-driven list: [{ id, name, slug }]
function MenuColumn({ title, titleHref, items, hrefPrefix, loading, error, twoColumns = false }) {
  return (
    <div>
      <ColumnTitle title={title} titleHref={titleHref} />

      {loading && (
        <ul className="space-y-2.5" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="h-3 w-3/5 animate-pulse rounded bg-muted" />
          ))}
        </ul>
      )}

      {error && (
        <p className="text-sm text-muted-foreground">Couldn’t load this list. Refresh to try again.</p>
      )}

      {!loading && !error && (
        <ul className={twoColumns ? "columns-2 gap-8" : ""}>
          {items.map((item) => (
            <li key={item.id} className="mb-3 break-inside-avoid">
              <NavLink href={`${hrefPrefix}/${item.slug}`} className={itemLink}>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Static list: [[label, href], ...]
function LinkList({ title, titleHref, links }) {
  return (
    <div>
      <ColumnTitle title={title} titleHref={titleHref} />
      <ul>
        {links.map(([label, href]) => (
          <li key={label} className="mb-3">
            <NavLink href={href} className={itemLink}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  "aria-hidden": true,
};

function ViewAllLink({ href, children }) {
  return (
    <NavLink
      href={href}
      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
    >
      {children}
      <svg {...svgProps} strokeWidth={2} className="h-3.5 w-3.5">
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    </NavLink>
  );
}

// Brands: plain text directory, no image.
function BrandsDirectory({ brands, loading, error, mobile }) {
  const cols = mobile ? "columns-2 gap-6" : "columns-3 gap-10 lg:columns-4";

  let body;
  if (loading) {
    body = (
      <ul className="space-y-3" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="h-3 w-3/5 animate-pulse rounded bg-muted" />
        ))}
      </ul>
    );
  } else if (error) {
    body = <p className="text-sm text-muted-foreground">Couldn’t load brands. Refresh to try again.</p>;
  } else if (GROUP_AZ) {
    const groups = [...brands]
      .sort((a, b) => a.name.localeCompare(b.name))
      .reduce((acc, b) => {
        const letter = b.name[0].toUpperCase();
        (acc[letter] ||= []).push(b);
        return acc;
      }, {});
    body = (
      <div className={cols}>
        {Object.entries(groups).map(([letter, list]) => (
          <div key={letter} className="mb-5 break-inside-avoid">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{letter}</p>
            <ul>
              {list.map((b) => (
                <li key={b.id} className="mb-2">
                  <NavLink href={`/brands/${b.slug}`} className={itemLink}>
                    {b.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  } else {
    body = (
      <ul className={cols}>
        {brands.slice(0, BRANDS_SHOWN).map((b) => (
          <li key={b.id} className="mb-3 break-inside-avoid">
            <NavLink href={`/brands/${b.slug}`} className={itemLink}>
              {b.name}
            </NavLink>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <ColumnTitle title="Shop by brand" />
      {body}
      <ViewAllLink href="/brands">All brands</ViewAllLink>
    </div>
  );
}

/*
  What each tab shows (used by the desktop panel and the mobile drawer):
    shop   → 3 images (Skincare, Haircare, Perfume) + product types + "View all products"
    new    → text only: "What's new" + "Available now"
    brands → text only: brands directory + "All brands"
*/
function TabContent({ tabKey, mobile = false, data }) {
  const { productTypes, brands, shopImages, loading, error } = data;

  if (tabKey === "shop") {
    return (
      <div className={mobile ? "space-y-6" : "grid grid-cols-[auto_1fr] gap-12"}>
        <ImageGrid
          items={shopImages}
          count={3}
          loading={loading}
          className={mobile ? "gap-3" : "w-64 lg:w-[22rem]"}
        />
        <div>
          <MenuColumn
            title="Shop by product type"
            items={productTypes}
            hrefPrefix="/skincare"
            loading={loading}
            error={error}
            twoColumns={!mobile && productTypes.length > 6}
          />
          <ViewAllLink href="/products">View all products</ViewAllLink>
        </div>
      </div>
    );
  }

  if (tabKey === "new") {
    return (
      <div className={mobile ? "space-y-6" : "grid max-w-xl gap-12 md:grid-cols-2"}>
        <LinkList title="What's new" titleHref="/new" links={NEW_LINKS} />
        <LinkList title="Available now" titleHref="/products?filter=in-stock" links={AVAILABLE_LINKS} />
      </div>
    );
  }

  if (tabKey === "brands") {
    return <BrandsDirectory brands={brands} loading={loading} error={error} mobile={mobile} />;
  }

  return null;
}

const Icon = {
  search: (
    <svg {...svgProps} strokeWidth={2} className="h-4 w-4 shrink-0">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  user: (
    <svg {...svgProps} className="h-6 w-6">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 18c1.2-2.2 3.2-3.2 5.5-3.2s4.3 1 5.5 3.2" />
    </svg>
  ),
  bag: (
    <svg {...svgProps} className="h-6 w-6">
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  menu: (
    <svg {...svgProps} strokeWidth={2} className="h-6 w-6">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  close: (
    <svg {...svgProps} strokeWidth={2} className="h-6 w-6">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ),
  chevron: (open) => (
    <svg
      {...svgProps}
      strokeWidth={2}
      className={`h-4 w-4 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
};

function AccountButton() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <span className="inline-flex h-8 w-8" aria-hidden="true" />;

  if (isSignedIn) {
    return (
      <span className="inline-flex p-1">
        <UserButton />
      </span>
    );
  }

  return (
    <SignInButton mode="modal">
      <button type="button" aria-label="Sign in" className={`inline-flex p-1 ${focusRing}`}>
        {Icon.user}
      </button>
    </SignInButton>
  );
}

function MobileAccount() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3 px-4 py-3.5 text-sm">
        <UserButton />
        <span>{user?.firstName || "My account"}</span>
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <button type="button" className={`flex w-full items-center gap-3 px-4 py-3.5 text-sm ${focusRing}`}>
        {Icon.user} Sign in
      </button>
    </SignInButton>
  );
}

/* ------------------------------------------------------------------ */
/* 4. MAIN COMPONENT                                                   */
/* ------------------------------------------------------------------ */

export default function Mainnav({
  logo = logoimage,
  promoText = "Free shipping on all orders above $50", // TODO: from settings
}) {
  const { cartCount } = useCart();
  const data = useCatalogMenu();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(null); // desktop: which panel is open (null = closed)
  const [shownTab, setShownTab] = useState("shop"); // keeps content visible while the panel fades out
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer
  const [mobileSection, setMobileSection] = useState(null); // mobile accordion (all closed by default)
  const closeTimer = useRef(null);
  const headerRef = useRef(null);

  const openTab = (key) => {
    clearTimeout(closeTimer.current);
    setActiveTab(key);
    setShownTab(key);
  };
  // Small delay so the pointer can travel from the tab to the panel.
  const closeMenu = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveTab(null), 120);
  };
  const closeAll = () => {
    clearTimeout(closeTimer.current);
    setActiveTab(null);
    setMobileOpen(false);
  };

  // Close menus whenever the route changes.
  useEffect(() => {
    closeAll();
  }, [location.pathname, location.search]);

  // Escape closes everything; clicking outside closes (needed for touch).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeAll();
    };
    const onPointer = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) closeAll();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const open = activeTab !== null;
  const tabBase = `relative flex h-full items-center border-b text-sm font-medium ${focusRing}`;

  return (
    <header ref={headerRef} className="relative z-50 border-b border-border bg-background font-sans text-foreground">
      {/* Utility strip: promo left, links right (desktop) */}
      <div className="border-b border-border">
        <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-center px-4 text-xs md:justify-between md:px-8">
          <p>{promoText}</p>
          <nav aria-label="Utility" className="hidden items-center gap-6 md:flex">
            {UTILITY_LINKS.map(([label, href]) => (
              <NavLink key={label} href={href} className="hover:underline">
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Main row: logo + tabs on the left, search + icons on the right */}
      <div className="relative">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-3 md:gap-10 md:px-8">
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((o) => !o)}
            className={`-ml-1 p-1 md:hidden ${focusRing}`}
          >
            {mobileOpen ? Icon.close : Icon.menu}
          </button>

          <NavLink href="/" className="flex items-center max-md:flex-1 max-md:justify-center">
            <img src={logo} alt="MC Beauty" className="h-12 w-auto object-contain md:h-14" />
          </NavLink>

          {/* Desktop tabs */}
          <nav aria-label="Main" className="hidden h-full items-stretch gap-8 md:flex">
            {NAV_TABS.map((tab) =>
              tab.mega ? (
                <div
                  key={tab.key}
                  className="flex h-full"
                  onMouseEnter={() => openTab(tab.key)}
                  onMouseLeave={closeMenu}
                >
                  <button
                    type="button"
                    aria-expanded={activeTab === tab.key}
                    aria-controls="nav-mega"
                    onClick={() => (activeTab === tab.key ? setActiveTab(null) : openTab(tab.key))}
                    className={`${tabBase} ${
                      activeTab === tab.key ? "border-secondary" : "border-transparent hover:border-secondary"
                    }`}
                  >
                    {tab.label}
                  </button>
                </div>
              ) : (
                <NavLink
                  key={tab.key}
                  href={tab.href}
                  onMouseEnter={() => setActiveTab(null)}
                  className={`${tabBase} border-transparent hover:border-secondary`}
                >
                  {tab.label}
                </NavLink>
              )
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 md:ml-auto md:gap-5">
            <SearchBox />
            <AccountButton />
            <NavLink href="/cart" aria-label={`Cart, ${cartCount} items`} className="relative inline-flex p-1">
              {Icon.bag}
              {cartCount > 0 && (
                <span className="absolute -right-0.5 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-secondary px-1 text-[0.65rem] text-gray-800">
                  {cartCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>

        {/* Desktop mega panel — content switches with the hovered tab */}
        <div
          id="nav-mega"
          onMouseEnter={() => openTab(shownTab)}
          onMouseLeave={closeMenu}
          onClick={(e) => e.target.closest("a") && closeAll()}
          className={`absolute left-0 right-0 top-full hidden border-y border-border bg-popover text-popover-foreground shadow-[0_14px_24px_-18px_rgb(0_0_0/0.18)] transition-all duration-150 motion-reduce:transition-none md:block ${
            open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-5xl px-8 pb-12 pt-9">
            <TabContent tabKey={shownTab} data={data} />
          </div>
        </div>
      </div>

      {/* ---------------- Mobile: drawer ---------------- */}
      <div
        id="mobile-menu"
        hidden={!mobileOpen}
        onClick={(e) => e.target.closest("a") && closeAll()}
        className="absolute inset-x-0 top-full max-h-[80vh] overflow-y-auto border-b border-border bg-popover text-popover-foreground shadow-[0_14px_24px_-18px_rgb(0_0_0/0.18)] md:hidden"
      >
        <SearchBox variant="mobile" onNavigate={closeAll} />

        {/* One accordion section per tab; only one open at a time */}
        {NAV_TABS.filter((t) => t.mega).map((tab) => {
          const isOpen = mobileSection === tab.key;
          return (
            <div key={tab.key} className="border-t border-border">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`mobile-${tab.key}`}
                onClick={() => setMobileSection(isOpen ? null : tab.key)}
                className={`flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium ${focusRing}`}
              >
                {tab.label}
                {Icon.chevron(isOpen)}
              </button>

              <div id={`mobile-${tab.key}`} hidden={!isOpen} className="bg-muted/50 px-4 pb-6 pt-2">
                <TabContent tabKey={tab.key} mobile data={data} />
              </div>
            </div>
          );
        })}

        {NAV_TABS.filter((t) => !t.mega).map((tab) => (
          <NavLink
            key={tab.key}
            href={tab.href}
            className="block border-t border-border px-4 py-3.5 text-sm font-medium"
          >
            {tab.label}
          </NavLink>
        ))}

        <NavLink href="/products" className="block border-t border-border px-4 py-3.5 text-sm font-medium">
          All products
        </NavLink>

        <div className="border-t border-border">
          <MobileAccount />
          <NavLink href="/cart" className="flex items-center gap-3 px-4 py-3.5 text-sm">
            {Icon.bag} Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </NavLink>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border px-4 py-4 text-xs text-muted-foreground">
          {UTILITY_LINKS.map(([label, href]) => (
            <NavLink key={label} href={href}>
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}