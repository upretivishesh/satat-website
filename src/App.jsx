import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CarbonCalculator from "./components/CarbonCalculator";
import ImpactTracker from "./components/ImpactTracker";
import Swaps from "./pages/Swaps";
import DIY from "./pages/DIY";
import Academy from "./pages/Academy";
import About from "./pages/About";

// Shop app (merged as nested routes per MERGE_AND_DEPLOY_GUIDE.md)
import ShopLayout from "./shop-src/components/Layout";
import ShopHome from "./shop-src/pages/Shop";
import ProductDetail from "./shop-src/pages/ProductDetail";
import Cart from "./shop-src/pages/Cart";
import Checkout from "./shop-src/pages/Checkout";
import OrderConfirmed from "./shop-src/pages/OrderConfirmed";
import { CartProvider } from "./shop-src/context/CartContext";

function Overview({ onSearch }) {
  return (
    <div className="page-enter">
      <Hero onSearch={onSearch} />
      <ImpactTracker />
      <CarbonCalculator />
    </div>
  );
}

function PageWrap({ children }) {
  return <div className="page-enter">{children}</div>;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = (() => {
    const path = location.pathname;
    if (path.startsWith("/swaps")) return "swaps";
    if (path.startsWith("/diy")) return "diy";
    if (path.startsWith("/academy")) return "academy";
    if (path.startsWith("/about")) return "about";
    return "overview";
  })();

  const handleTabChange = (tab) => {
    navigate(tab === "overview" ? "/" : `/${tab}`);
  };

  const handleSearch = (query) => {
    navigate(`/swaps?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentTab={currentTab} onTabChange={handleTabChange} />

      <main className="flex-1">
        <Routes key={location.pathname}>
          <Route path="/" element={<Overview onSearch={handleSearch} />} />
          <Route path="/swaps" element={<PageWrap><Swaps /></PageWrap>} />
          <Route path="/diy" element={<PageWrap><DIY /></PageWrap>} />
          <Route path="/academy" element={<PageWrap><Academy /></PageWrap>} />
          <Route path="/about" element={<PageWrap><About /></PageWrap>} />

          <Route
            path="/shop"
            element={
              <CartProvider>
                <PageWrap><ShopLayout /></PageWrap>
              </CartProvider>
            }
          >
            <Route index element={<ShopHome />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-confirmed" element={<OrderConfirmed />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
