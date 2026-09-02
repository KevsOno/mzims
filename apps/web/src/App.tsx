import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentVerify from './pages/PaymentVerify';
import FragranceRequest from './pages/FragranceRequest';
import { CartProvider } from './store/CartContext';
import { AuthProvider } from './store/AuthContext';
import OrderTracking from './pages/OrderTracking';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment/verify" element={<PaymentVerify />} />
              <Route path="/request-scent" element={<FragranceRequest />} />
              <Route path="/track/:reference" element={<OrderTracking />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
