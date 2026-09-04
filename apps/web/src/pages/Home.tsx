import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import api from '../lib/api';

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.get('/products?limit=4')
      .then(res => setFeatured(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Inline icons for trust badges
  const TruckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18" r="2.5" />
      <circle cx="18.5" cy="18" r="2.5" />
    </svg>
  );

  const GiftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11.5 14.5 15.5 10.5" />
    </svg>
  );

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#43408C] via-[#2D2A6E] to-[#1A1A2E]">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#C9A96A]/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6A67A8]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#C9A96A]/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#C9A96A]/5 rounded-full" />
        </div>

        <div className="container relative z-10 text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 mb-8 px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Sparkles size={16} className="text-[#C9A96A]" />
            <span className="text-xs tracking-widest uppercase text-white/80">New Collection 2026</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-[1.1] text-white">
            Where fragrance <br />
            <span className="bg-gradient-to-r from-[#C9A96A] via-[#E8D5A3] to-[#A8894A] bg-clip-text text-transparent">meets style</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Discover our curated collection of luxury perfumes, crafted for those who appreciate the art of scent.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-luxury flex items-center gap-2">
              Shop Now <ArrowRight size={20} />
            </Link>
            <Link to="/request-scent" className="px-8 py-4 rounded-full border border-white/30 hover:bg-white/10 text-white font-medium transition backdrop-blur-sm flex items-center gap-2 justify-center">
              <Sparkles size={20} /> Request a Scent
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/60">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#C9A96A]"><TruckIcon /></span>
              Free shipping over ₦50,000
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#C9A96A]"><GiftIcon /></span>
              Complimentary samples
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#C9A96A]"><ShieldIcon /></span>
              100% authentic
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-[#43408C]">Featured Fragrances</h2>
            <div className="gold-divider mt-3" />
          </div>
          <Link to="/products" className="text-[#C9A96A] hover:text-[#A8894A] font-medium flex items-center gap-1 transition">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            /* Skeleton Loading State */
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm animate-pulse">
                <div className="w-full h-64 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="mt-4 flex items-center justify-between pt-2">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded-full w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Render Products */
            featured.map((product: any, index: number) => (
              <Link
                to={`/product/${product.slug}`}
                key={product.id}
                className="product-card animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="image-wrapper">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-[#C9A96A]">🌸</div>
                  )}
                  <div className="badge">New</div>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] group-hover:text-[#43408C] transition">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#4A4A4A]">{product.scent_family || 'Fragrance'}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-[#43408C]">₦{Number(product.selling_price).toLocaleString()}</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#FAF9F6] text-[#4A4A4A]">In Stock</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#1A1A2E] to-[#2D2A6E]">
        <div className="container text-center text-white">
          <div className="max-w-2xl mx-auto">
            <Sparkles size={40} className="mx-auto text-[#C9A96A] mb-6" />
            <h2 className="text-4xl md:text-5xl font-serif font-bold">Can't find your signature scent?</h2>
            <div className="gold-divider my-6" />
            <p className="text-lg text-white/70">Tell us what you're looking for, and we'll help you discover it.</p>
            <Link to="/request-scent" className="inline-block mt-8 px-8 py-4 rounded-full border-2 border-[#C9A96A] hover:bg-[#C9A96A] text-white font-medium transition duration-300">
              Request a Scent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
