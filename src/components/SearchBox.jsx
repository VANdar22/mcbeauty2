import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchProducts } from "../lib/Catalog";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;
const MAX_SUGGESTIONS = 5;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export default function SearchBox({ variant = "desktop", onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const listId = useId();
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const requestId = useRef(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const mobile = variant === "mobile";
  const trimmed = query.trim();
  const showDropdown = open && trimmed.length >= MIN_CHARS;
  const rowCount = results.length > 0 ? results.length + 1 : 0;

  // Keep the box in sync with the URL: filled on /search, empty elsewhere.
  useEffect(() => {
    setQuery(location.pathname === "/search" ? new URLSearchParams(location.search).get("q") ?? "" : "");
    setOpen(false);
    setActive(-1);
  }, [location.pathname, location.search]);

  // Debounced suggestions.
  useEffect(() => {
    if (!open || trimmed.length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    const id = ++requestId.current;
    setLoading(true);
    const timer = setTimeout(() => {
      searchProducts(trimmed, MAX_SUGGESTIONS)
        .then((r) => id === requestId.current && setResults(r))
        .catch(() => id === requestId.current && setResults([]))
        .finally(() => id === requestId.current && setLoading(false));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmed, open]);

  // Click outside closes the suggestions.
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const go = (text) => {
    const q = text.trim();
    if (!q) return;
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
    onNavigate?.();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (active >= 0 && active < results.length) go(results[active].name);
    else go(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown" && rowCount) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % rowCount);
    } else if (e.key === "ArrowUp" && rowCount) {
      e.preventDefault();
      setActive((a) => (a <= 0 ? rowCount - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  const rowClass = (i) =>
    `flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-2.5 text-left text-sm ${
      active === i ? "bg-muted" : "hover:bg-muted"
    }`;

  return (
    <div ref={wrapRef} className={`relative ${mobile ? "m-4" : "hidden md:block"}`}>
      <form
        role="search"
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 border-b text-muted-foreground focus-within:border-primary ${
          mobile ? "h-10 w-full border-muted-foreground/40" : "h-9 w-64 border-foreground/40 lg:w-80"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none"
        />

        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setActive(-1);
              inputRef.current?.focus();
            }}
            className={`p-1 ${focusRing}`}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </form>

      {showDropdown && (
        <div
          className={`absolute z-50 mt-1 border border-border bg-popover text-popover-foreground shadow-[var(--shadow-lg)] ${
            mobile ? "inset-x-0" : "right-0 w-[22rem]"
          }`}
        >
          {results.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Search suggestions">
              {results.map((p, i) => (
                <li
                  key={p.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={active === i}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(p.name)}
                  className={rowClass(i)}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{p.name}</span>
                    <span className="block truncate text-xs capitalize text-muted-foreground">
                      {p.brand} · {p.category}
                    </span>
                  </span>
                  <span className="shrink-0 text-primary">
                    {p.currency}
                    {p.price}
                  </span>
                </li>
              ))}
              <li
                id={`${listId}-${results.length}`}
                role="option"
                aria-selected={active === results.length}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(query)}
                className={`${rowClass(results.length)} border-t border-border font-medium`}
              >
                See all results for “{trimmed}”
              </li>
            </ul>
          ) : (
            <p role="status" className="px-4 py-3 text-sm text-muted-foreground">
              {loading ? "Searching…" : `No products found for “${trimmed}”`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}