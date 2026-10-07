import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Mainnav from "./components/Mainnav";
import { CartProvider } from "./components/Cartcontext";
import CartDrawer from "./components/Cartdrawer";
import ProductDetails from "./pages/ProductDetails";
import Rewards from "./pages/Rewards";
import Home from "./pages/Home";
import About from "./pages/About";
import Cart from "./pages/Cart";
import GiftCardReveal from "./pages/GiftCardReveal";
import { RewardsProvider } from "./components/Rewardscontext";

const menuItems = [
  { label: "Home", ariaLabel: "Go to home page", link: "/" },
  { label: "About", ariaLabel: "Learn about us", link: "/about" },
];

const socialItems = [
  { label: "Twitter", link: "https://twitter.com" },
  { label: "Instagram", link: "https://instagram.com" },
  { label: "Pinterest", link: "https://pinterest.com" },
];

function App() {
  return (
    <CartProvider>
      <RewardsProvider>
        <Router>
          <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-background text-foreground font-sans">
            {/* Fixed Navigation */}
            <Mainnav />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route
                  path="/rewards/card/:id"
                  element={<GiftCardReveal />}
                />{" "}
              </Routes>
            </main>
            <CartDrawer />
          </div>
        </Router>
      </RewardsProvider>
    </CartProvider>
  );
}

export default App;
