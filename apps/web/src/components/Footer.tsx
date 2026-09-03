import React, { useState } from 'react';
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

  // Inline SVG icons
  const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );

  const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );

  const TwitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );

  const PinterestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 0-3.8 19.2c.1-.4.2-1 .2-1.3 0-.5-.3-1.3-.4-1.7-.1-.4-.2-.4-.4-.3-1.8.8-2.4-1.4-2.4-2.2 0-1.7 1.5-3.7 3.2-3.7 1.5 0 2.4 1.1 2.4 2.4 0 1.5-.8 2.7-1.8 3.4-.3.2-.5.4-.4.8.1.4.3 1.3.5 1.7.2.6.3.7.6.7.6 0 1.7-1.1 2.2-1.8.5-.7.8-1.8.8-2.9 0-2.2-1.5-3.9-4.1-3.9-2.2 0-4 1.5-4 3.8 0 .8.3 1.6.8 2.1.1.1.1.2.1.3-.1.3-.3 1.2-.4 1.4-.1.2-.2.3-.4.2-1.5-.7-2.2-2.5-2.2-4 0-3.2 2.7-5.8 6.3-5.8 3.3 0 5.9 2.3 5.9 5.5 0 3.2-1.9 5.6-4.6 5.6-.9 0-1.7-.5-2-1.1l-.5 1.8c-.2.7-.6 1.4-1 1.9A9.9 9.9 0 0 0 22 12a10 10 0 0 0-10-10z" />
    </svg>
  );

  const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );

  const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

  const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  return (
    <footer className="bg-[#1A1A2E] text-white/70 pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="font-serif text-2xl font-bold text-white mb-3">MUZOSCENTS</h3>
            <p className="text-sm text-white/50">Where fragrance meets style.</p>
            <div className="flex gap-4 mt-4">
              <a href="https://instagram.com/muzoscents" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#C9A96A] transition">
                <InstagramIcon />
              </a>
              <a href="https://facebook.com/muzoscents" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#C9A96A] transition">
                <FacebookIcon />
              </a>
              <a href="https://twitter.com/muzoscents" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#C9A96A] transition">
                <TwitterIcon />
              </a>
              <a href="https://pinterest.com/muzoscents" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#C9A96A] transition">
                <PinterestIcon />
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
                <span className="text-[#C9A96A]"><MapPinIcon /></span>
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#C9A96A]"><PhoneIcon /></span>
                <span>+234 800 MUZOSCENT</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#C9A96A]"><MailIcon /></span>
                <span>faithmamuzo@gmail.com</span>
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
                <SendIcon />
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
