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

  // Contact Info
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Address State
  const [streetAddress, setStreetAddress] = useState(''); // Populated by search/GPS
  const [buildingDetails, setBuildingDetails] = useState(''); // e.g., "House 12B, Flat 3"
  const [landmark, setLandmark] = useState(''); // e.g., "Opposite First Bank"
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Gateway
  const [gateway, setGateway] = useState<'paystack' | 'monnify'>('paystack');

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
  }, [user, state.items.length, navigate]);

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
    if (!streetAddress.trim() || streetAddress.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            streetAddress
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
  }, [streetAddress]);

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
          const res = await api.post('/geo/reverse', { lat: latitude, lng: longitude });
          if (res.data?.address) {
            setStreetAddress(res.data.address);
          }
        } catch (e) {
          try {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const nomData = await nomRes.json();
            if (nomData.display_name) {
              setStreetAddress(nomData.display_name);
            }
          } catch (err) {
            console.error('Reverse geocoding failed', err);
            alert('Location acquired, but address lookup failed. Please enter address manually.');
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
    setStreetAddress(item.display_name);
    setLat(parseFloat(item.lat));
    setLng(parseFloat(item.lon));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Redirect to login if user is unauthenticated
    if (!user) {
      navigate('/login');
      return;
    }

    if (state.items.length === 0) return;
    setLoading(true);

    // Combine into a clean full address for delivery agents
    const fullAddress = `${buildingDetails ? buildingDetails + ', ' : ''}${streetAddress}${
      landmark ? ' (Landmark: ' + landmark + ')' : ''
    }`;

    try {
      const orderData = {
        guest_email: email,
        phone,
        address: fullAddress,
        street_address: streetAddress,
        building_details: buildingDetails,
        landmark,
        latitude: lat,
        longitude: lng,
        total: Number(state.total),
        currency: 'NGN',
        gateway,
        items: state.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
        })),
      };

      const res = await api.post('/orders/', orderData);
      
      const { authorization_url } = res.data;
      if (authorization_url) {
        window.location.href = authorization_url;
      } else {
        alert('Could not obtain checkout URL from payment gateway.');
      }
    } catch (error: any) {
      console.error('Checkout error details:', error.response?.data);
      alert(
        error.response?.data?.detail?.[0]?.msg ||
        error.response?.data?.detail ||
        'Checkout failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-serif text-[#43408C] mb-6">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          {/* Sign-in Requirement Warning Banner */}
          {!user && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm flex items-center justify-between">
              <span>You are not signed in. Please sign in to complete your checkout.</span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="underline font-semibold hover:text-amber-900 ml-4"
              >
                Sign In
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label block text-xs font-medium text-[#4A4A4A] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!user}
                className="input-field w-full p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="label block text-xs font-medium text-[#4A4A4A] mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={!user}
                placeholder="e.g. 08012345678"
                className="input-field w-full p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Address Group */}
            <div className="space-y-4 border-t border-b border-[#E5E0D8] py-4">
              <h2 className="text-sm font-semibold text-[#43408C]">Delivery Location</h2>

              {/* Street / Area Field with Nominatim Autocomplete */}
              <div className="relative" ref={dropdownRef}>
                <label className="label block text-xs font-medium text-[#4A4A4A] mb-1">
                  Street Name / Area
                </label>
                <div className="flex gap-2">
                  <input
                    value={streetAddress}
                    onChange={(e) => {
                      setStreetAddress(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    required
                    disabled={!user}
                    className="flex-1 input-field p-2 border rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Search street, area, or city"
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={loading || !user}
                    className="bg-[#43408C] text-white px-3 py-2 rounded-md hover:bg-[#332E6E] transition text-xs font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📍 Use GPS
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && user && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#E5E0D8] rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isFetchingSuggestions ? (
                      <div className="p-3 text-xs text-gray-500">Searching locations...</div>
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
                      <div className="p-3 text-xs text-gray-500">No matching areas found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Doorstep Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label block text-xs font-medium text-[#4A4A4A] mb-1">
                    House / Flat / Suite No.
                  </label>
                  <input
                    type="text"
                    value={buildingDetails}
                    onChange={(e) => setBuildingDetails(e.target.value)}
                    required
                    disabled={!user}
                    placeholder="e.g. House 12, Flat 3B"
                    className="input-field w-full p-2 border rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="label block text-xs font-medium text-[#4A4A4A] mb-1">
                    Nearest Landmark / Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    disabled={!user}
                    placeholder="e.g. Opposite GTBank"
                    className="input-field w-full p-2 border rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label block text-xs font-medium text-[#4A4A4A] mb-2">Payment Gateway</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    value="paystack"
                    checked={gateway === 'paystack'}
                    disabled={!user}
                    onChange={() => setGateway('paystack')}
                  />
                  Paystack
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    value="monnify"
                    checked={gateway === 'monnify'}
                    disabled={!user}
                    onChange={() => setGateway('monnify')}
                  />
                  Monnify
                </label>
              </div>
            </div>

            {/* Dynamic Action Button */}
            {!user ? (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-[#43408C] text-white font-medium rounded-md hover:bg-[#332E6E] transition"
              >
                Sign In to Place Order
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex justify-center py-3 bg-[#43408C] text-white font-medium rounded-md hover:bg-[#332E6E] transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay ${formatCurrency(state.total)}`}
              </button>
            )}
          </form>
        </div>

        <div className="md:w-80 bg-white p-6 rounded-lg shadow-sm border border-[#E5E0D8] h-fit">
          <h3 className="font-semibold text-lg text-[#43408C]">Order Summary</h3>
          <div className="mt-4 space-y-2">
            {state.items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">{formatCurrency(item.unit_price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-[#E5E0D8] pt-2 mt-2 font-bold flex justify-between text-lg text-[#43408C]">
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
