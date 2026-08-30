import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { formatCurrency } from '../lib/currency';

const Cart: React.FC = () => {
  const { state, removeItem, updateQuantity } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <ShoppingBag size={64} className="mx-auto text-[#E5E0D8]" />
        <h2 className="text-2xl font-serif text-[#43408C] mt-4">Your cart is empty</h2>
        <p className="text-[#4A4A4A] mt-2">Explore our collection and find your perfect scent.</p>
        <Link to="/products" className="inline-block mt-6 btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-serif text-[#43408C] mb-6">Shopping Cart</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          {state.items.map((item) => (
            <div key={item.product_id} className="flex items-center gap-4 py-4 border-b border-[#E5E0D8]">
              <div className="w-20 h-20 bg-[#FAF9F6] rounded flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-3xl text-[#C9A96A]">🌸</span>
                )}
              </div>
              <div className="flex-1">
                <Link to={`/product/${item.slug}`} className="font-semibold hover:text-[#43408C] transition">
                  {item.name}
                </Link>
                <p className="text-sm text-[#4A4A4A]">{formatCurrency(item.unit_price)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  className="p-1 border rounded hover:bg-[#FAF9F6]"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  className="p-1 border rounded hover:bg-[#FAF9F6]"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="font-semibold w-24 text-right">
                {formatCurrency(item.unit_price * item.quantity)}
              </div>
              <button
                onClick={() => removeItem(item.product_id)}
                className="text-[#B33A3A] hover:text-[#8A2A2A] transition"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="md:w-80 bg-white p-6 rounded-lg shadow-sm border border-[#E5E0D8] h-fit">
          <h3 className="font-semibold text-lg">Order Summary</h3>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(state.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#4A4A4A]">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t border-[#E5E0D8] pt-2 mt-2 font-bold flex justify-between text-lg">
              <span>Total</span>
              <span>{formatCurrency(state.total)}</span>
            </div>
          </div>
          <Link to="/checkout" className="block w-full mt-4 btn-primary text-center">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
