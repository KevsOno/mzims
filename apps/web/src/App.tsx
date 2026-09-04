import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentVerify from './pages/PaymentVerify';
import FragranceRequest from './pages/FragranceRequest';
import Login from './pages/Login';          // <-- import your actual Login
import OrderTracking from './pages/OrderTracking';
import { CartProvider } from './store/CartContext';
import { AuthProvider } from './store/AuthContext';

// Temporary Login placeholder – replace with your actual Login component import
const Login = () => (
  <div className="container py-16 text-center">
    <h1 className="text-3xl font-serif text-[#43408C]">Login</h1>
    <p className="text-[#4A4A4A] mt-4">This is a placeholder login page.</p>
    <p className="text-sm mt-2">Replace with your actual login form.</p>
    <Link 
      to="/" 
      className="inline-block mt-6 bg-[#43408C] text-white px-6 py-3 rounded-md hover:bg-[#332E6E] transition"
    >
      Back Home
    </Link>
  </div>
);

// Inline 404 fallback (no separate file needed)
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
              <Route path="/login" element={<Login />} />   {/* Now uses real Login */}
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
