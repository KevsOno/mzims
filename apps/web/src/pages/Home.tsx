import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Star, ShoppingBag, ShieldCheck, 
  Truck, Gift, RefreshCw, Eye, ChevronLeft, ChevronRight 
} from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';

// Helper Hook for Independent Horizontal Scrolling Controls
const useHorizontalScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return { scrollRef, scroll };
};

// Dynamic Recommendation Component
const RecommendedSection: React.FC<{ addToCart: (product: any, qty: number) => void }> = ({ addToCart }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const endpoint = user?.id 
        ? `/recommendations/user?customer_id=${user.id}&limit=4`
        : `/products?limit=4`;
      const res = await api.get(endpoint);
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  return (
    <section className="relative my-16 py-12 px-6 rounded-3xl bg-gradient-to-br from-[#1A1A2E] via-[#2D2A6E] to-[#14142B] text-white shadow-2xl overflow-hidden border border-[#C9A96A]/20">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A96A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#43408C]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A96A]/20 border border-[#C9A96A]/40 mb-3">
              <Sparkles size={12} className="text-[#C9A96A]" />
              <span className="text-[11px] font-semibold tracking-wider text-[#E8D5A3] uppercase">
                {user ? 'Curated Scent AI' : 'Community Highlights'}
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white">
              {user ? 'Selected For Your Fragrance Profile' : 'Must-Have Signature Scents'}
            </h2>
            <p className="text-xs md:text-sm text-white/70 mt-1 max-w-lg">
              {user 
                ? 'Driven by your scent family preferences, price affinity, and past collections.' 
                : 'Popular scents carefully chosen based on trending community preference.'}
            </p>
          </div>

          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="inline-flex items-center gap-2 text-xs text-[#E8D5A3] hover:text-white transition bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 self-start md:self-auto"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh Picks
          </button>
        </div>

        {/* Dynamic Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
            ))
          ) : recommendations.length === 0 ? (
            <div className="col-span-full text-center py-12 text-white/60 text-sm">
              No recommendations found right now. Explore the full catalog to teach our AI engine!
            </div>
          ) : (
            recommendations.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#C9A96A]/50 p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 rounded-xl overflow-hidden bg-black/20 mb-4">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">✨</div>
                    )}
                    {product.scent_family && (
                      <span className="absolute top-2.5 left-2.5 bg-[#1A1A2E]/80 backdrop-blur-md border border-[#C9A96A]/40 text-[#E8D5A3] text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full">
                        {product.scent_family}
                      </span>
                    )}
                    <Link
                      to={`/products/${product.slug || product.id}`}
                      className="absolute bottom-2.5 right-2.5 p-2 bg-white/20 backdrop-blur-md hover:bg-[#C9A96A] text-white hover:text-[#1A1A2E] rounded-full transition opacity-0 group-hover:opacity-100"
                      title="Quick View"
                    >
                      <Eye size={14} />
                    </Link>
                  </div>

                  <Link to={`/products/${product.slug || product.id}`}>
                    <h3 className="font-serif text-base font-semibold text-white group-hover:text-[#E8D5A3] transition line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-white/60 mt-1 line-clamp-1">
                    {product.description || 'Premium long-lasting formulation'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-white/40 block">Price</span>
                    <span className="text-base font-bold text-[#E8D5A3]">
                      ₦{Number(product.selling_price || product.price || 0).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(product, 1)}
                    className="inline-flex items-center gap-1.5 bg-[#C9A96A] hover:bg-[#E8D5A3] text-[#1A1A2E] font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-md"
                  >
                    <ShoppingBag size={14} /> Add
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const { addToCart } = useCart();

  // Scroll controls hook
  const categoriesScroll = useHorizontalScroll();

  useEffect(() => {
    setLoading(true);
    api.get('/products')
      .then(res => {
        // Safe extraction handling array or wrapped object `{ data: [...] }`
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setFeatured(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Dynamically extract categories safely from API products
  const categories = useMemo(() => {
    if (!Array.isArray(featured)) return ['All'];

    const extracted = Array.from(
      new Set(
        featured
          .flatMap((p) => [p?.category, p?.scent_family])
          .filter((cat): cat is string => Boolean(cat) && typeof cat === 'string' && cat.trim().length > 0)
          .map((cat) => cat.trim())
      )
    );
    return ['All', ...extracted];
  }, [featured]);

  // Filter products matching category or scent family safely
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(featured)) return [];
    if (activeCategory === 'All') return featured;

    const lowerCategory = activeCategory.trim().toLowerCase();
    return featured.filter((p) => {
      const productCategory = (p?.category || '').toString().toLowerCase().trim();
      const scentFamily = (p?.scent_family || '').toString().toLowerCase().trim();
      
      return productCategory === lowerCategory || 
             scentFamily === lowerCategory || 
             productCategory.includes(lowerCategory) || 
             scentFamily.includes(lowerCategory);
    });
  }, [featured, activeCategory]);

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#43408C] via-[#2D2A6E] to-[#1A1A2E]">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#C9A96A]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#6A67A8]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container relative z-10 px-4 mx-auto">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <Sparkles size={14} className="text-[#C9A96A]" />
                <span className="text-xs font-medium tracking-widest uppercase text-white/90">Curated Luxury Perfumes</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-white">
                Where fragrance <br />
                <span className="bg-gradient-to-r from-[#C9A96A] via-[#E8D5A3] to-[#A8894A] bg-clip-text text-transparent">
                  meets signature style
                </span>
              </h1>

              <p className="mt-4 text-base md:text-lg text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover handcrafted niche fragrances and designer scents formulated for long-lasting impression.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/products" className="btn-luxury flex items-center gap-2 px-7 py-3.5 text-sm">
                  Explore Collection <ArrowRight size={18} />
                </Link>
                <Link to="/request-scent" className="px-6 py-3.5 rounded-full border border-white/30 hover:bg-white/10 text-white font-medium text-sm transition backdrop-blur-sm flex items-center gap-2">
                  <Sparkles size={16} /> Request Scent Match
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-2">
                  <span className="w-8 h-8 rounded-full bg-[#C9A96A] flex items-center justify-center text-xs text-white font-bold border-2 border-[#2D2A6E]">4.9</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-[#2D2A6E] flex items-center justify-center text-white text-xs">★</div>
                </div>
                <div className="text-xs text-white/80">
                  <div className="flex items-center gap-1 text-[#C9A96A]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                  <span>Over 1,200+ satisfied scent lovers</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:col-span-5 lg:flex justify-center">
              <div className="relative w-80 h-96 rounded-2xl p-1 bg-gradient-to-b from-[#C9A96A]/40 to-transparent">
                <div className="w-full h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between border border-white/20">
                  <span className="text-xs uppercase tracking-widest text-[#C9A96A] font-semibold">Featured Scent</span>
                  <div className="text-center py-6">
                    <span className="text-6xl">✨</span>
                    <h3 className="text-xl font-serif text-white font-bold mt-4">Discover Your Signature</h3>
                    <p className="text-xs text-white/70 mt-2">Take our 1-minute scent quiz or request a custom formulation.</p>
                  </div>
                  <Link to="/request-scent" className="w-full py-2.5 bg-[#C9A96A] text-[#1A1A2E] text-xs font-bold rounded-lg text-center hover:bg-[#E8D5A3] transition">
                    Find My Match
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <section className="bg-[#FAF9F6] border-b border-gray-100 py-4">
        <div className="container mx-auto px-4 flex flex-wrap justify-around gap-4 text-xs md:text-sm text-[#4A4A4A]">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-[#C9A96A]" />
            <span>Free Express Delivery over ₦50,000</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-[#C9A96A]" />
            <span>Complimentary Sample with Every Order</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#C9A96A]" />
            <span>100% Authentic Fragrances</span>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto py-14 px-4">
        
        {/* Dynamic Category Pill Filters with Scroll Controls */}
        <div className="sticky top-16 md:top-20 z-20 bg-white/95 backdrop-blur-md py-4 mb-8 border-b border-gray-100 shadow-sm transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-[#43408C]">Featured Fragrances</h2>
              <div className="gold-divider mt-1" />
            </div>

            {/* Dynamic Scent/Category Filter Pills Track + Scroll Controls */}
            <div className="flex items-center gap-2 max-w-full overflow-hidden">
              <div 
                ref={categoriesScroll.scrollRef}
                className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scroll-smooth scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs px-4 py-2 rounded-full transition whitespace-nowrap flex-shrink-0 ${
                      activeCategory === cat
                        ? 'bg-[#43408C] text-white font-medium shadow-sm'
                        : 'bg-gray-100 text-[#4A4A4A] hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Scroll Arrow Buttons for Categories */}
              {categories.length > 3 && (
                <div className="flex items-center gap-1 flex-shrink-0 border-l border-gray-200 pl-2">
                  <button
                    onClick={() => categoriesScroll.scroll('left')}
                    className="p-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-[#43408C] hover:text-white text-[#43408C] transition"
                    aria-label="Scroll categories left"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => categoriesScroll.scroll('right')}
                    className="p-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-[#43408C] hover:text-white text-[#43408C] transition"
                    aria-label="Scroll categories right"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm animate-pulse">
                <div className="w-full h-60 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="mt-4 flex items-center justify-between pt-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-8 bg-gray-200 rounded-lg w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500 text-sm">No fragrances found under this category.</p>
              <button
                onClick={() => setActiveCategory('All')}
                className="mt-3 text-xs bg-[#43408C] text-white px-4 py-2 rounded-md hover:bg-[#2D2A6E] transition"
              >
                View All Fragrances
              </button>
            </div>
          ) : (
            filteredProducts.slice(0, 8).map((product: any) => (
              <div
                key={product.id}
                className="group relative rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <Link to={`/products/${product.slug || product.id}`} className="block">
                  <div className="image-wrapper relative h-64 bg-gray-50 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        loading="lazy" 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl text-[#C9A96A]">🌸</div>
                    )}
                    <span className="absolute top-3 left-3 bg-[#43408C] text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">
                      New
                    </span>
                  </div>
                </Link>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#C9A96A] font-semibold">
                      {product.scent_family || product.category || 'Perfume'}
                    </span>
                    <Link to={`/products/${product.slug || product.id}`}>
                      <h3 className="font-serif text-base font-semibold text-[#1A1A1A] group-hover:text-[#43408C] transition line-clamp-1 mt-0.5">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#43408C]">
                      ₦{Number(product.selling_price || product.price || 0).toLocaleString()}
                    </span>

                    <button
                      onClick={() => addToCart(product, 1)}
                      className="inline-flex items-center gap-1 bg-[#FAF9F6] hover:bg-[#43408C] hover:text-white text-[#43408C] border border-[#43408C]/20 text-xs font-semibold px-3 py-2 rounded-lg transition"
                      aria-label="Add to Cart"
                    >
                      <ShoppingBag size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-10 text-center">
          <Link to="/products" className="inline-flex items-center gap-2 text-[#43408C] font-semibold border-b-2 border-[#C9A96A] pb-1 hover:text-[#C9A96A] transition text-sm">
            Explore All Fragrances <ArrowRight size={16} />
          </Link>
        </div>

        {/* Dynamic AI Recommendation Section */}
        <RecommendedSection addToCart={addToCart} />

      </section>

      {/* Scent Recommendation CTA Banner */}
      <section className="py-16 bg-gradient-to-br from-[#1A1A2E] to-[#2D2A6E] text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto">
            <Sparkles size={32} className="mx-auto text-[#C9A96A] mb-4" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Can't find your signature scent?</h2>
            <p className="text-sm md:text-base text-white/70 mt-3">
              Our perfume concierges are available to help match notes to your personal preference.
            </p>
            <Link to="/request-scent" className="inline-block mt-6 px-7 py-3 rounded-full border border-[#C9A96A] hover:bg-[#C9A96A] text-white hover:text-[#1A1A2E] font-medium text-sm transition duration-300">
              Request a Custom Recommendation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
