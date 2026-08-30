import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, Send } from 'lucide-react';
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
              {/* Pinterest – custom SVG */}
              <a href="https://pinterest.com/muzoscent" target="_blank" rel="noopener noreferrer" className="text-[#4A4A4A] hover:text-[#43408C] transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 0-3.8 19.2c.1-.4.2-1 .2-1.3 0-.5-.3-1.3-.4-1.7-.1-.4-.2-.4-.4-.3-1.8.8-2.4-1.4-2.4-2.2 0-1.7 1.5-3.7 3.2-3.7 1.5 0 2.4 1.1 2.4 2.4 0 1.5-.8 2.7-1.8 3.4-.3.2-.5.4-.4.8.1.4.3 1.3.5 1.7.2.6.3.7.6.7.6 0 1.7-1.1 2.2-1.8.5-.7.8-1.8.8-2.9 0-2.2-1.5-3.9-4.1-3.9-2.2 0-4 1.5-4 3.8 0 .8.3 1.6.8 2.1.1.1.1.2.1.3-.1.3-.3 1.2-.4 1.4-.1.2-.2.3-.4.2-1.5-.7-2.2-2.5-2.2-4 0-3.2 2.7-5.8 6.3-5.8 3.3 0 5.9 2.3 5.9 5.5 0 3.2-1.9 5.6-4.6 5.6-.9 0-1.7-.5-2-1.1l-.5 1.8c-.2.7-.6 1.4-1 1.9A9.9 9.9 0 0 0 22 12a10 10 0 0 0-10-10z"/>
                </svg>
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
