import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  matchPath,
  useLocation,
  useParams,
} from "react-router-dom";
import Mainnav from "./components/Mainnav";
import { CartProvider } from "./components/Cartcontext";
import CartDrawer from "./components/Cartdrawer";
import { RewardsProvider } from "./components/Rewardscontext";
import Footer from "./components/Footer";
import ProductDetails from "./pages/ProductDetails";
import Rewards from "./pages/Rewards";
import Home from "./pages/Home";
import About from "./pages/About";
import Cart from "./pages/Cart";
import GiftCardReveal from "./pages/GiftCardReveal";
import Search from "./pages/Search";
import TrackOrder from "./pages/Trackorder";
import Checkout from "./pages/Checkout";
import Notfound from "./pages/Notfound";
import Products from "./pages/Products";

/* Old or shortcut links that should land on a filtered products page. */
const categoryRedirect = (category) => <Navigate to={`/products?category=${category}`} replace />;

function TypeRedirect({ category }) {
  const { type } = useParams();
  return <Navigate to={`/products?category=${category}&type=${type}`} replace />;
}

function BrandRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/products?brand=${slug}`} replace />;
}

/* Every real page. Anything not listed here shows the 404 page (without a footer). */
const ROUTES = [
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/products", element: <Products /> },
  { path: "/product/:id", element: <ProductDetails /> },
  { path: "/cart", element: <Cart /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/rewards", element: <Rewards /> },
  { path: "/rewards/card/:id", element: <GiftCardReveal /> },
  { path: "/search", element: <Search /> },
  { path: "/orders", element: <TrackOrder /> },

  { path: "/shop", element: <Navigate to="/products" replace /> },
  { path: "/new", element: <Navigate to="/products?sort=new" replace /> },
  { path: "/brands", element: <Navigate to="/products" replace /> },
  { path: "/brands/:slug", element: <BrandRedirect /> },
  { path: "/skincare", element: categoryRedirect("skincare") },
  { path: "/skincare/:type", element: <TypeRedirect category="skincare" /> },
  { path: "/haircare", element: categoryRedirect("hair") },
  { path: "/haircare/:type", element: <TypeRedirect category="hair" /> },
  { path: "/perfume", element: categoryRedirect("perfume") },
  { path: "/perfume/:type", element: <TypeRedirect category="perfume" /> },
];

// Full-screen pages: no nav and no footer.
const HIDE_NAV_AND_FOOTER = [/^\/rewards\/card\//];

// Pages that keep the nav but hide the footer.
const HIDE_FOOTER = [/^\/cart/, /^\/checkout/, /^\/rewards/, /^\/order/, /^\/search/, /^\/product\//];

const matches = (list, path) => list.some((re) => re.test(path));
const isKnownRoute = (path) => ROUTES.some((r) => matchPath({ path: r.path, end: true }, path));

function AppShell() {
  const { pathname } = useLocation();
  const notFound = !isKnownRoute(pathname);
  const showNav = !matches(HIDE_NAV_AND_FOOTER, pathname);
  const showFooter = showNav && !notFound && !matches(HIDE_FOOTER, pathname);

  return (
    // overflow-x-clip (not -hidden): hidden would break position: sticky
    <div className="flex min-h-screen w-full flex-col overflow-x-clip bg-background font-sans text-foreground">
      {showNav && (
        <div className="sticky top-0 z-50">
          <Mainnav />
        </div>
      )}

      <main className="flex-1">
        <Routes>
          {ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          <Route path="*" element={<Notfound />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <RewardsProvider>
        <Router>
          <AppShell />
        </Router>
      </RewardsProvider>
    </CartProvider>
  );
}