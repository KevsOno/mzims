import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Printer, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../store/CartContext';

// Types matching your FastAPI /payments/verify/{reference} response
interface ReceiptItem {
  product_id: number | string;
  product_name: string;
  image_url?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface ReceiptData {
  status: string;
  order_id: number | string;
  reference: string;
  gateway: string;
  total_amount: number;
  created_at: string;
  items: ReceiptItem[];
}

const PaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reference = searchParams.get('reference') || searchParams.get('trxref');
  
  // Guard against double execution in React 18 Strict Mode
  const verifiedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setErrorMessage("No transaction reference found in URL.");
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verifyPayment = async () => {
      try {
        // Calls GET /api/v1/payments/verify/{reference} via your configured api instance
        const response = await api.get<ReceiptData>(`/payments/verify/${reference}`);
        const data = response.data;

        if (data.status === 'paid' || response.status === 200) {
          await clearCart();
          setReceipt(data);
          setStatus('success');
        } else {
          setStatus('failed');
          setErrorMessage(`Order status is currently '${data.status}'. If you were debited, please contact support.`);
        }
      } catch (e: any) {
        console.error('Payment verification error:', e);
        setStatus('failed');
        setErrorMessage(e.response?.data?.detail || "Failed to confirm payment details.");
      }
    };

    verifyPayment();
  }, [reference]);

  if (status === 'loading') {
    return (
      <div className="container py-20 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A96A] border-t-transparent mx-auto"></div>
        <p className="mt-4 text-[var(--color-mid-grey)] font-medium">Verifying your luxury purchase...</p>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-20 max-w-2xl mx-auto px-4">
      {status === 'success' && receipt ? (
        <div className="glass-card p-6 md:p-10 animate-fade-up rounded-2xl bg-white/80 backdrop-blur-md shadow-xl border border-[#E5E0D8]">
          
          {/* Status Header */}
          <div className="text-center pb-6 border-b border-[#E5E0D8]">
            <CheckCircle size={56} className="mx-auto text-[#C9A96A]" />
            <h2 className="text-2xl md:text-3xl font-serif text-[var(--color-charcoal)] mt-4">Payment Successful!</h2>
            <p className="text-[var(--color-mid-grey)] text-sm mt-1">
              Thank you for shopping with Muzo Scent. Here is your receipt record.
            </p>
          </div>

          {/* Receipt Details Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 my-6 p-4 rounded-xl bg-[#FDFBF7] text-sm border border-[#F2EDE4]">
            <div>
              <span className="text-xs text-[var(--color-mid-grey)] block uppercase tracking-wider">Order ID</span>
              <strong className="text-[var(--color-charcoal)] font-semibold">#{receipt.order_id}</strong>
            </div>
            <div>
              <span className="text-xs text-[var(--color-mid-grey)] block uppercase tracking-wider">Gateway Reference</span>
              <strong className="font-mono text-[#43408C] text-xs md:text-sm break-all">{receipt.reference}</strong>
            </div>
            <div>
              <span className="text-xs text-[var(--color-mid-grey)] block uppercase tracking-wider">Date & Time</span>
              <span className="text-[var(--color-charcoal)] font-medium">
                {new Date(receipt.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-xs text-[var(--color-mid-grey)] block uppercase tracking-wider">Payment Method</span>
              <span className="capitalize text-[var(--color-charcoal)] font-medium">{receipt.gateway}</span>
            </div>
          </div>

          {/* Itemized Products List */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)] uppercase tracking-wider mb-3">
              Purchased Items
            </h3>
            <div className="divide-y divide-[#E5E0D8] border-t border-b border-[#E5E0D8]">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-[var(--color-charcoal)]">{item.product_name}</p>
                    <p className="text-xs text-[var(--color-mid-grey)]">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-[var(--color-charcoal)]">
                    ₦{item.subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-center p-4 rounded-xl bg-[#43408C] text-white mb-8">
            <span className="font-medium text-sm">Total Paid</span>
            <span className="text-xl font-semibold">
              ₦{receipt.total_amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.print()}
              className="px-6 py-3 rounded-full font-medium border border-[#E5E0D8] hover:bg-white transition flex items-center justify-center gap-2 text-sm text-[var(--color-charcoal)]"
            >
              <Printer size={16} /> Print Receipt
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="btn-luxury px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 text-sm"
            >
              Continue Shopping <ArrowRight size={16} />
            </button>
          </div>

        </div>
      ) : (
        /* Failure Screen */
        <div className="glass-card p-8 animate-fade-up text-center rounded-2xl bg-white/80 backdrop-blur-md shadow-xl border border-red-100">
          <XCircle size={56} className="mx-auto text-[#B33A3A]" />
          <h2 className="text-2xl md:text-3xl font-serif text-[#B33A3A] mt-4">Payment Verification Failed</h2>
          <p className="text-[var(--color-mid-grey)] text-sm mt-2">
            {errorMessage || "We couldn't confirm your transaction."}
          </p>
          <p className="text-xs text-[var(--color-mid-grey)] mt-1">
            Reference ID: <span className="font-mono text-xs">{reference || 'N/A'}</span>
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/cart')} className="btn-luxury text-sm py-3 px-6">
              Return to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerify;
