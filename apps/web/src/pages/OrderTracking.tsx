import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';

const OrderTracking: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reference) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`https://muzoscent.onrender.com/api/v1/orders/track/${reference}`);
        if (!response.ok) throw new Error('Order not found');
        const data = await response.json();
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError('Unable to retrieve order. Please check your tracking reference.');
        setLoading(false);
      }
    };

    fetchOrder();

    // Subscribe to real-time changes on this order
    const subscription = supabase
      .channel(`order-${reference}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `gateway_reference=eq.${reference}`,
        },
        (payload) => {
          setOrder((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [reference]);

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#43408C] border-t-transparent mx-auto" />
        <p className="mt-4 text-[#4A4A4A]">Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-12 text-center">
        <XCircle size={48} className="text-[#B33A3A] mx-auto" />
        <h2 className="text-xl font-serif text-[#B33A3A] mt-4">{error || 'Order not found'}</h2>
        <Link to="/" className="mt-4 inline-block btn-primary">Return Home</Link>
      </div>
    );
  }

  // Status steps
  const statuses = ['pending', 'paid', 'fulfilled'];
  const currentIndex = statuses.indexOf(order.status);
  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="text-[#C9A96A]" />,
    paid: <Package className="text-[#43408C]" />,
    fulfilled: <Truck className="text-[#2D7D46]" />,
  };

  return (
    <div className="container py-12 max-w-2xl mx-auto">
      <h1 className="text-3xl font-serif text-[#43408C] mb-2">Order Tracking</h1>
      <p className="text-[#4A4A4A] mb-8">Reference: <span className="font-mono">{order.gateway_reference}</span></p>

      {/* Status Timeline */}
      <div className="relative flex justify-between items-center mb-8">
        {statuses.map((status, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={status} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-[#43408C] text-white' : 'bg-[#E5E0D8] text-[#4A4A4A]'
                } ${isCurrent ? 'ring-4 ring-[#C9A96A]/30' : ''}`}
              >
                {isActive ? statusIcons[status] : <Clock size={18} />}
              </div>
              <span className="text-xs mt-2 capitalize font-medium text-[#4A4A4A]">{status}</span>
              {idx < statuses.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    idx < currentIndex ? 'bg-[#43408C]' : 'bg-[#E5E0D8]'
                  }`}
                  style={{ transform: 'translateX(0%)', left: '60%', right: '0%' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E0D8] p-6">
        <h3 className="font-semibold text-lg">Order Summary</h3>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-[#4A4A4A]">Total</span>
            <span className="font-bold">₦{order.total?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#4A4A4A]">Status</span>
            <span className="capitalize font-medium text-[#43408C]">{order.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#4A4A4A]">Date</span>
            <span>{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="mt-6 border-t border-[#E5E0D8] pt-4">
          <h4 className="font-medium mb-2">Items</h4>
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span>{item.products?.name || `Product #${item.product_id}`} × {item.quantity}</span>
              <span>₦{item.unit_price?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/" className="text-[#43408C] hover:underline">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderTracking;
