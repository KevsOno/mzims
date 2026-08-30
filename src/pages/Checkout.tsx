import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { formatCurrency } from '../lib/currency';
import api from '../lib/api';
import { supabase } from '../lib/supabase';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { state, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gateway, setGateway] = useState<'paystack' | 'monnify'>('paystack');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (state.items.length === 0) {
      navigate('/cart');
    }
    if (user) {
      // Prefill email from user
      setEmail(user.email || '');
    }
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        // Reverse geocode via API
        try {
          const res = await api.post('/geo/reverse', { lat: latitude, lng: longitude });
          setAddress(res.data.address);
        } catch (e) {
          console.error('Geocoding failed', e);
        }
      },
      (err) => {
        alert('Unable to retrieve location. Please enter your address manually.');
        console.error(err);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.items.length === 0) return;
    setLoading(true);

    try {
      // Create order
      const orderData = {
        customer_id: user?.id || 0, // will be handled by backend for guests
        total: state.total,
        currency: 'NGN',
        gateway,
        items: state.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      // If user is not logged in, we need to create a guest order
      // For simplicity, we'll assume user is logged in for now
      const res = await api.post('/orders', orderData);
      const { authorization_url, reference } = res.data;

      // Redirect to payment gateway
      window.location.href = authorization_url;
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-serif text-[#43408C] mb-6">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label">Delivery Address</label>
              <div className="flex gap-2">
                <input value={address} onChange={(e) => setAddress(e.target.value)} required className="flex-1 input-field" placeholder="Enter address or use GPS" />
                <button type="button" onClick={handleGetLocation} className="bg-[#43408C] text-white px-4 py-2 rounded-md hover:bg-[#332E6E] transition">
                  GPS
                </button>
              </div>
              {lat && lng && (
                <p className="text-xs text-[#4A4A4A] mt-1">📍 {lat.toFixed(6)}, {lng.toFixed(6)}</p>
              )}
            </div>

            <div>
              <label className="label">Payment Gateway</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" value="paystack" checked={gateway === 'paystack'} onChange={() => setGateway('paystack')} />
                  Paystack
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="monnify" checked={gateway === 'monnify'} onChange={() => setGateway('monnify')} />
                  Monnify
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary flex justify-center">
              {loading ? 'Processing...' : `Pay ${formatCurrency(state.total)}`}
            </button>
          </form>
        </div>

        <div className="md:w-80 bg-white p-6 rounded-lg shadow-sm border border-[#E5E0D8] h-fit">
          <h3 className="font-semibold text-lg">Order Summary</h3>
          <div className="mt-4 space-y-2">
            {state.items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatCurrency(item.unit_price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-[#E5E0D8] pt-2 mt-2 font-bold flex justify-between text-lg">
              <span>Total</span>
              <span>{formatCurrency(state.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
