import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, Pinterest, Send } from 'lucide-react';
import api from '../lib/api';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/newsletter/subscribe', { email });
      setSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error('Subscription failed', error);
    }
  };

  return (
    <footer className="bg-[#FAF9F6] border-t border-[#E5E0D8] py-8 mt-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#43408C] mb-3">MUZOSCENT</h3>
            <p className="text-sm text-[#4A4A4A]">Where fragrance meets style.</p>
            <div className="flex gap-4 mt-4">
              <a href="https://instagram.com/muzoscent" target="_blank" rel="noopener noreferrer" className="text-[#4A4A4A] hover:text-[#43408C] transition">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com/muzoscent" target="_blank" rel="noopener noreferrer" className="text-[#4A4A4A] hover:text-[#43408C] transition">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com/muzoscent" target="_blank" rel="noopener noreferrer" className="text-[#4A4A4A] hover:text-[#43408C] transition">
                <Twitter size={20} />
              </a>
              <a href="https://pinterest.com/muzoscent" target="_blank" rel="noopener noreferrer" className="text-[#4A4A4A] hover:text-[#43408C] transition">
                <Pinterest size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="hover:text-[#43408C] transition">Shop All</a></li>
              <li><a href="/request-scent" className="hover:text-[#43408C] transition">Request a Scent</a></li>
              <li><a href="/about" className="hover:text-[#43408C] transition">About</a></li>
              <li><a href="/contact" className="hover:text-[#43408C] transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Newsletter</h4>
            <p className="text-sm text-[#4A4A4A] mb-3">Subscribe for exclusive offers and new arrivals.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-3 py-2 border border-[#E5E0D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#43408C]"
              />
              <button type="submit" className="bg-[#43408C] text-white px-4 py-2 rounded-md hover:bg-[#332E6E] transition flex items-center gap-1">
                <Send size={16} />
              </button>
            </form>
            {subscribed && <p className="text-sm text-[#2D7D46] mt-2">Thank you for subscribing!</p>}
          </div>
        </div>

        <div className="border-t border-[#E5E0D8] mt-6 pt-6 text-center text-xs text-[#4A4A4A]">
          &copy; {new Date().getFullYear()} Muzoscent. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
