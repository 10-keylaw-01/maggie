import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import Track from './pages/Track';
import Login from './pages/Login';
import Account from './pages/Account';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import Orders from './admin/Orders';
import Settings from './admin/Settings';
import { ProductsPage, CategoriesPage, PromotionsPage, ServicesPage, FaqsPage, TeamPage, CustomersPage, MessagesPage } from './admin/pages';
import './index.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}

const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-40 text-center px-4">
    <h1 className="text-6xl font-bold text-white/20 mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>404</h1>
    <p className="text-white/60 mb-6">Page not found.</p>
    <Link to="/" className="btn-primary">Go home</Link>
  </div>
);

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/track" element={<Track />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/account" element={<Account />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="promotions" element={<PromotionsPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="faqs" element={<FaqsPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
