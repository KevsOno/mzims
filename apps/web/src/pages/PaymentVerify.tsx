import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../store/CartContext';

const PaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  const reference = searchParams.get('reference') || searchParams.get('trxref');
  
  // Guard against double execution in React 18 Strict Mode
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verifyPayment = async () => {
      try {
        // 1. Call your FastAPI backend to verify the reference with Paystack/Flutterwave
        const response = await api.get(`/orders/verify?reference=${reference}`);
        
        if (response.data.status === 'success' || response.status === 200) {
          // 2. Clear cart only after backend verification succeeds
          await clearCart();
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch (e) {
        console.error('Payment verification error:', e);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [reference]); // Removed clearCart from deps to prevent re-triggering

  if (status === 'loading') {
    return (
      <div className="container py-20 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A96A] border-t-transparent mx-auto"></div>
        <p className="mt-4 text-[var(--color-mid-grey)] font-medium">Verifying your luxury purchase...</p>
      </div>
    );
  }

  return (
    <div className="container py-20 text-center max-w-xl mx-auto">
      {status === 'success' ? (
        <div className="glass-card p-8 animate-fade-up">
          <CheckCircle size={64} className="mx-auto text-[#C9A96A]" />
          <h2 className="text-3xl font-serif text-[var(--color-charcoal)] mt-4">Payment Successful!</h2>
          <p className="text-[var(--color-mid-grey)] mt-2">
            Thank you for your order. Your reference number is <span className="font-mono text-[#43408C]">{reference}</span>.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate(`/track/${reference}`)} 
              className="btn-luxury"
            >
              Track Order
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="px-8 py-4 rounded-full font-medium border border-[#E5E0D8] hover:bg-white transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 animate-fade-up">
          <XCircle size={64} className="mx-auto text-[#B33A3A]" />
          <h2 className="text-3xl font-serif text-[#B33A3A] mt-4">Payment Verification Failed</h2>
          <p className="text-[var(--color-mid-grey)] mt-2">
            We couldn't confirm your transaction. If money was debited, please contact support with reference ID: <span className="font-mono">{reference || 'N/A'}</span>.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/cart')} className="btn-luxury">
              Return to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerify;
