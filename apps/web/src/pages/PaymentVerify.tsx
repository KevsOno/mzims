import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../store/CartContext';

const PaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');

  useEffect(() => {
    if (!reference && !trxref) {
      setStatus('failed');
      return;
    }

    const verifyPayment = async () => {
      try {
        // We can query our own API to verify order status
        // For now, we'll assume success and clear cart
        // In production, we'd call /orders/verify?reference=...
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Clear cart
        await clearCart();
        setStatus('success');
      } catch (e) {
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [reference, trxref]);

  if (status === 'loading') {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#43408C] border-t-transparent mx-auto"></div>
        <p className="mt-4 text-[#4A4A4A]">Verifying your payment...</p>
      </div>
    );
  }

  return (
    <div className="container py-12 text-center">
      {status === 'success' ? (
        <>
          <CheckCircle size={64} className="mx-auto text-[#2D7D46]" />
          <h2 className="text-2xl font-serif text-[#2D7D46] mt-4">Payment Successful!</h2>
          <p className="text-[#4A4A4A] mt-2">Thank you for your order. You will receive a confirmation email shortly.</p>
          <button onClick={() => navigate('/')} className="mt-6 btn-primary">Continue Shopping</button>
        </>
      ) : (
        <>
          <XCircle size={64} className="mx-auto text-[#B33A3A]" />
          <h2 className="text-2xl font-serif text-[#B33A3A] mt-4">Payment Failed</h2>
          <p className="text-[#4A4A4A] mt-2">Something went wrong. Please try again or contact support.</p>
          <button onClick={() => navigate('/cart')} className="mt-6 btn-primary">Return to Cart</button>
        </>
      )}
    </div>
  );
};

export default PaymentVerify;
