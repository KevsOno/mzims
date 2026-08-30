import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogOut } from 'lucide-react';
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
    <header className="bg-white/80 backdrop-blur-md border-b border-[#E5E0D8] sticky top-0 z-50">
      <div className="container flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl font-serif font-bold text-[#43408C] tracking-tight">MUZOSCENT</span>
          <span className="hidden md:inline text-xs text-[#C9A96A] font-serif italic">— Where fragrance meets style</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/products" className="text-sm font-medium text-[#1A1A1A] hover:text-[#43408C] transition border-b-2 border-transparent hover:border-[#C9A96A] pb-0.5">Shop</Link>
          <Link to="/request-scent" className="text-sm font-medium text-[#1A1A1A] hover:text-[#43408C] transition border-b-2 border-transparent hover:border-[#C9A96A] pb-0.5">Request a Scent</Link>
          {user ? (
            <button onClick={handleSignOut} className="text-sm font-medium text-[#1A1A1A] hover:text-[#43408C] transition flex items-center gap-1">
              <LogOut size={18} /> Sign Out
            </button>
          ) : (
            <Link to="/login" className="text-sm font-medium text-[#1A1A1A] hover:text-[#43408C] transition border-b-2 border-transparent hover:border-[#C9A96A] pb-0.5">Sign In</Link>
          )}
          <Link to="/cart" className="relative">
            <ShoppingCart size={24} className="text-[#1A1A1A] hover:text-[#43408C] transition" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C9A96A] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E0D8] py-6 px-4 flex flex-col gap-4">
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
