import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, Send, MapPin, Phone, Mail } from 'lucide-react';
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
    <footer className="bg-[#1A1A2E] text-white/70 pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="font-serif text-2xl font-bold text-white mb-3">MUZOSCENT</h3>
            <p className="text-sm text-white/50">Where fragrance meets style.</p>
            <div className="flex gap-4 mt-4">
              <a href="https://instagram.com/muzoscent" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#C9A96A] transition">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com/muzoscent" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#C9A96A] transition">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com/muzoscent" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#C9A96A] transition">
                <Twitter size={20} />
              </a>
              <a href="https://pinterest.com/muzoscent" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#C9A96A] transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 0-3.8 19.2c.1-.4.2-1 .2-1.3 0-.5-.3-1.3-.4-1.7-.1-.4-.2-.4-.4-.3-1.8.8-2.4-1.4-2.4-2.2 0-1.7 1.5-3.7 3.2-3.7 1.5 0 2.4 1.1 2.4 2.4 0 1.5-.8 2.7-1.8 3.4-.3.2-.5.4-.4.8.1.4.3 1.3.5 1.7.2.6.3.7.6.7.6 0 1.7-1.1 2.2-1.8.5-.7.8-1.8.8-2.9 0-2.2-1.5-3.9-4.1-3.9-2.2 0-4 1.5-4 3.8 0 .8.3 1.6.8 2.1.1.1.1.2.1.3-.1.3-.3 1.2-.4 1.4-.1.2-.2.3-.4.2-1.5-.7-2.2-2.5-2.2-4 0-3.2 2.7-5.8 6.3-5.8 3.3 0 5.9 2.3 5.9 5.5 0 3.2-1.9 5.6-4.6 5.6-.9 0-1.7-.5-2-1.1l-.5 1.8c-.2.7-.6 1.4-1 1.9A9.9 9.9 0 0 0 22 12a10 10 0 0 0-10-10z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="hover:text-[#C9A96A] transition">Shop All</a></li>
              <li><a href="/request-scent" className="hover:text-[#C9A96A] transition">Request a Scent</a></li>
              <li><a href="/about" className="hover:text-[#C9A96A] transition">About</a></li>
              <li><a href="/contact" className="hover:text-[#C9A96A] transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#C9A96A] flex-shrink-0 mt-0.5" />
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-[#C9A96A] flex-shrink-0 mt-0.5" />
                <span>+234 800 MUZOSCENT</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[#C9A96A] flex-shrink-0 mt-0.5" />
                <span>hello@muzoscent.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Stay in Touch</h4>
            <p className="text-sm text-white/50 mb-3">Subscribe for exclusive offers and new arrivals.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#C9A96A] text-white placeholder-white/30"
              />
              <button type="submit" className="bg-[#C9A96A] hover:bg-[#A8894A] text-white px-5 py-2 rounded-full transition flex items-center gap-1">
                <Send size={16} />
              </button>
            </form>
            {subscribed && <p className="text-sm text-[#C9A96A] mt-2">✓ Subscribed successfully</p>}
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-6 text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} Muzoscent. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
