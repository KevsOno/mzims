import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogOut, Search } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';

const Header: React.FC = () => {
  const { state } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = state.items.reduce((acc, i) => acc + i.quantity, 0);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-card rounded-none border-b border-white/20">
        <div className="container flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A96A] to-[#A8894A] flex items-center justify-center shadow-gold">
              <span className="text-white font-serif text-lg">M</span>
            </div>
            <span className="text-2xl font-serif font-bold text-[#43408C] tracking-tight">Muzoscent</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/products" className="text-sm text-[#1A1A1A] hover:text-[#43408C] transition border-b-2 border-transparent hover:border-[#C9A96A] pb-1">Shop</Link>
            <Link to="/request-scent" className="text-sm text-[#1A1A1A] hover:text-[#43408C] transition border-b-2 border-transparent hover:border-[#C9A96A] pb-1">Request</Link>
            <button className="text-[#4A4A4A] hover:text-[#43408C] transition">
              <Search size={20} />
            </button>
            {user ? (
              <button onClick={handleSignOut} className="text-sm text-[#1A1A1A] hover:text-[#43408C] transition flex items-center gap-1">
                <LogOut size={18} /> Sign Out
              </button>
            ) : (
              <Link to="/login" className="text-sm text-[#1A1A1A] hover:text-[#43408C] transition border-b-2 border-transparent hover:border-[#C9A96A] pb-1">Sign In</Link>
            )}
            <Link to="/cart" className="relative">
              <div className="w-10 h-10 rounded-full bg-[#FAF9F6] flex items-center justify-center hover:bg-[#F5F0E8] transition">
                <ShoppingCart size={20} className="text-[#1A1A1A]" />
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C9A96A] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden glass-card rounded-none border-t border-white/20 p-6 flex flex-col gap-4">
          <Link to="/products" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          <Link to="/request-scent" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Request a Scent</Link>
          {user ? (
            <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="text-sm font-medium text-left flex items-center gap-1">
              <LogOut size={18} /> Sign Out
            </button>
          ) : (
            <Link to="/login" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
          )}
          <Link to="/cart" className="flex items-center gap-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
            <ShoppingCart size={18} /> Cart ({totalItems})
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
