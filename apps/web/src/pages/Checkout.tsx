import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { formatCurrency } from '../lib/currency';
import api from '../lib/api';

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gateway, setGateway] = useState<'paystack' | 'monnify'>('paystack');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.items.length === 0) {
      navigate('/cart');
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced address search via OpenStreetMap (Nominatim)
  useEffect(() => {
    if (!address.trim() || address.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
          )}&addressdetails=1&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to fetch address suggestions:', err);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [address]);

  // Handle GPS location click
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);

        try {
          // Attempt backend reverse-geocoding endpoint first
          const res = await api.post('/geo/reverse', { lat: latitude, lng: longitude });
          if (res.data?.address) {
            setAddress(res.data.address);
          }
        } catch (e) {
          // Fallback to Nominatim if backend route fails
          try {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const nomData = await nomRes.json();
            if (nomData.display_name) {
              setAddress(nomData.display_name);
            }
          } catch (err) {
            console.error('Reverse geocoding failed', err);
            alert('Location acquired, but address lookup failed. Please type address manually.');
          }
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        alert('Unable to retrieve location. Please enter your address manually.');
        console.error(err);
      }
    );
  };

  const handleSelectSuggestion = (item: Suggestion) => {
    setAddress(item.display_name);
    setLat(parseFloat(item.lat));
    setLng(parseFloat(item.lon));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.items.length === 0) return;
    setLoading(true);

    try {
      const orderData = {
        customer_id: user?.id || 0,
        email,
        phone,
        address,
        latitude: lat,
        longitude: lng,
        total: state.total,
        currency: 'NGN',
        gateway,
        items: state.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      const res = await api.post('/orders', orderData);
      const { authorization_url } = res.data;
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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="relative" ref={dropdownRef}>
              <label className="label">Delivery Address</label>
              <div className="flex gap-2">
                <input
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  required
                  className="flex-1 input-field"
                  placeholder="Start typing address or use GPS"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={loading}
                  className="bg-[#43408C] text-white px-4 py-2 rounded-md hover:bg-[#332E6E] transition text-sm font-medium disabled:opacity-50"
                >
                  📍 Use GPS
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#E5E0D8] rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isFetchingSuggestions ? (
                    <div className="p-3 text-xs text-gray-500">Searching addresses...</div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <button
                        key={item.place_id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-xs text-gray-700 block transition"
                      >
                        {item.display_name}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-gray-500">No suggestions found</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="label">Payment Gateway</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    value="paystack"
                    checked={gateway === 'paystack'}
                    onChange={() => setGateway('paystack')}
                  />
                  Paystack
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    value="monnify"
                    checked={gateway === 'monnify'}
                    onChange={() => setGateway('monnify')}
                  />
                  Monnify
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex justify-center py-3 bg-[#43408C] text-white rounded-md hover:bg-[#332E6E] transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ${formatCurrency(state.total)}`}
            </button>
          </form>
        </div>

        <div className="md:w-80 bg-white p-6 rounded-lg shadow-sm border border-[#E5E0D8] h-fit">
          <h3 className="font-semibold text-lg">Order Summary</h3>
          <div className="mt-4 space-y-2">
            {state.items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
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
