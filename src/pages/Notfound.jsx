import { Link } from "react-router-dom";

// The "Climate Crisis" font is loaded by the @import line at the top of index.css.

// Change the wording here. (The original design says, in Ukrainian,
// "ми не змогли знайти сторінку, яку ви шукаєте…")
const CAPTION = "we couldn't find the page you're looking for…";

export default function NotFound() {
  return (
    <main className="grid min-h-[70svh] place-items-center px-6 py-24">
      <div className="flex flex-col items-center text-center">
        <h1
          className="text-[clamp(5rem,24vw,12rem)] font-normal text-primary/35"
          style={{ fontFamily: '"Climate Crisis", sans-serif' }}
        >
          404
          <span className="sr-only">: page not found</span>
        </h1>

        <p className="mt-6 text-xs font-medium tracking-wide text-foreground">{CAPTION}</p>

        <Link
          to="/"
          className="mt-8 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          back to home
        </Link>
      </div>
    </main>
  );
}