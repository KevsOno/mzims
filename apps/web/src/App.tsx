import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentVerify from './pages/PaymentVerify';
import FragranceRequest from './pages/FragranceRequest';
import Login from './pages/Login';               // <-- Import the actual Login
import Register from './pages/Register';          // <-- Import Register
import Welcome from './pages/Welcome';  // add import
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OrderTracking from './pages/OrderTracking';
import { CartProvider } from './store/CartContext';
import { AuthProvider } from './store/AuthContext';

// 404 fallback (no separate file)
const NotFound = () => (
  <div className="container py-16 text-center">
    <h1 className="text-4xl font-bold text-[#43408C] mb-4">404 - Page Not Found</h1>
    <p className="text-[#4A4A4A] mb-6">The page you are looking for doesn't exist or has been moved.</p>
    <Link
      to="/"
      className="bg-[#43408C] text-white px-6 py-3 rounded-md hover:bg-[#332E6E] transition"
    >
      Back to Home
    </Link>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              {/* Plural and singular product detail routes */}
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment/verify" element={<PaymentVerify />} />
              <Route path="/request-scent" element={<FragranceRequest />} />
              <Route path="/track/:reference" element={<OrderTracking />} />
              <Route path="/login" element={<Login />} />   {/* Now uses the real component */}
              <Route path="/register" element={<Register />} />    {/* New route */}
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
