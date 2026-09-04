import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Home, ShoppingBag, MessageSquare, User, LogIn, LogOut } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';

const Header: React.FC = () => {
  const { state } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const totalItems = state.items.reduce((acc, i) => acc + i.quantity, 0);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out failed', error);
    }
  };

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50">
        <div className="glass-card rounded-none border-b border-white/20">
          <div className="container flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3" aria-label="Home">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A96A] to-[#A8894A] flex items-center justify-center shadow-gold">
                <span className="text-white font-serif text-lg">M</span>
              </div>
              <span className="text-2xl font-serif font-bold text-[#43408C] tracking-tight">Muzoscent</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/products" className="text-sm text-[#1A1A1A] hover:text-[#43408C] transition border-b-2 border-transparent hover:border-[#C9A96A] pb-1">
                Shop
              </Link>
              <Link to="/request-scent" className="text-sm text-[#1A1A1A] hover:text-[#43408C] transition border-b-2 border-transparent hover:border-[#C9A96A] pb-1">
                Request
              </Link>
              {/* Search icon now links to /products */}
              <Link to="/products" aria-label="Search products">
                <Search size={20} className="text-[#4A4A4A] hover:text-[#43408C] transition" />
              </Link>
              {user ? (
                <button onClick={handleSignOut} className="text-sm text-[#1A1A1A] hover:text-[#43408C] transition flex items-center gap-1" aria-label="Sign out">
                  <LogOut size={18} /> Sign Out
                </button>
              ) : (
                <Link to="/login" className="text-sm text-[#1A1A1A] hover:text-[#43408C] transition border-b-2 border-transparent hover:border-[#C9A96A] pb-1">
                  Sign In
                </Link>
              )}
              <Link to="/cart" className="relative" aria-label="View cart">
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

            {/* Mobile header – only logo and search */}
            <div className="md:hidden flex items-center gap-4">
              <Link to="/products" aria-label="Search products">
                <Search size={24} className="text-[#4A4A4A]" />
              </Link>
              <Link to="/cart" className="relative" aria-label="View cart">
                <ShoppingCart size={24} className="text-[#4A4A4A]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C9A96A] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar – visible only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-[#E5E0D8] px-2 py-1 flex justify-around items-center">
        <Link to="/" className="flex flex-col items-center text-xs text-[#4A4A4A] hover:text-[#43408C] transition" aria-label="Home">
          <Home size={24} />
          <span>Home</span>
        </Link>
        <Link to="/products" className="flex flex-col items-center text-xs text-[#4A4A4A] hover:text-[#43408C] transition" aria-label="Shop">
          <ShoppingBag size={24} />
          <span>Shop</span>
        </Link>
        <Link to="/request-scent" className="flex flex-col items-center text-xs text-[#4A4A4A] hover:text-[#43408C] transition" aria-label="Request Scent">
          <MessageSquare size={24} />
          <span>Request</span>
        </Link>
        <Link to="/cart" className="relative flex flex-col items-center text-xs text-[#4A4A4A] hover:text-[#43408C] transition" aria-label="Cart">
          <div className="relative">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#C9A96A] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span>Cart</span>
        </Link>
        {user ? (
          <button onClick={handleSignOut} className="flex flex-col items-center text-xs text-[#4A4A4A] hover:text-[#43408C] transition" aria-label="Sign out">
            <LogOut size={24} />
            <span>Logout</span>
          </button>
        ) : (
          <Link to="/login" className="flex flex-col items-center text-xs text-[#4A4A4A] hover:text-[#43408C] transition" aria-label="Sign in">
            <LogIn size={24} />
            <span>Login</span>
          </Link>
        )}
      </nav>

      {/* Add bottom padding to main content so it's not hidden behind the nav bar */}
      <div className="pb-20 md:pb-0" />
    </>
  );
};

export default Header;
