import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, ShoppingBag, ShieldCheck, Truck, Gift } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../store/CartContext';

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  selling_price: number;
  slug: string;
  images?: string[] | null;
  scent_family?: string | null;
  gender?: string | null;
  current_stock: number;
}

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    api.get('/products')
      .then(res => {
        const products: Product[] = res.data || [];
        setFeatured(products);

        // Dynamically extract categories using scent_family, falling back to category
        const extractedCategories = Array.from(
          new Set(
            products
              .map(p => p.scent_family || p.category)
              .filter((cat): cat is string => Boolean(cat) && typeof cat === 'string')
              .map(cat => cat.trim())
          )
        );

        setCategories(['All', ...extractedCategories]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = activeCategory === 'All'
    ? featured
    : featured.filter(p => {
        const group = (p.scent_family || p.category || '').toLowerCase().trim();
        return group === activeCategory.toLowerCase().trim();
      });

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#43408C] via-[#2D2A6E] to-[#1A1A2E]">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#C9A96A]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#6A67A8]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container relative z-10 px-4">
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
                Discover handcrafted niche fragrances and designer scents formulated for a long-lasting impression.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/products" className="btn-luxury flex items-center gap-2 px-7 py-3.5 text-sm">
                  Explore Collection <ArrowRight size={18} />
                </Link>
                <Link to="/request-scent" className="px-6 py-3.5 rounded-full border border-white/30 hover:bg-white/10 text-white font-medium text-sm transition backdrop-blur-sm flex items-center gap-2">
                  <Sparkles size={16} /> Request Scent Match
                </Link>
              </div>
            </div>

            <div className="hidden lg:col-span-5 lg:flex justify-center">
              <div className="relative w-80 h-96 rounded-2xl p-1 bg-gradient-to-b from-[#C9A96A]/40 to-transparent">
                <div className="w-full h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between border border-white/20">
                  <span className="text-xs uppercase tracking-widest text-[#C9A96A] font-semibold">Featured Scent</span>
                  <div className="text-center py-6">
                    <span className="text-6xl">✨</span>
                    <h3 className="text-xl font-serif text-white font-bold mt-4">Discover Your Signature</h3>
                    <p className="text-xs text-white/70 mt-2">Find your perfect perfume profile instantly.</p>
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
        <div className="container px-4 flex flex-wrap justify-around gap-4 text-xs md:text-sm text-[#4A4A4A]">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-[#C9A96A]" />
            <span>Express Delivery Nationwide</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-[#C9A96A]" />
            <span>Complimentary Sample Included</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#C9A96A]" />
            <span>100% Authentic Products</span>
          </div>
        </div>
      </section>

      {/* Dynamic Products Grid */}
      <section className="container py-14 px-4">
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md py-4 mb-8 border-b border-gray-100 shadow-sm transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-[#43408C]">Featured Fragrances</h2>
              <div className="gold-divider mt-1" />
            </div>

            {/* Dynamic Buttons */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-4 py-2 rounded-full transition capitalize ${
                    activeCategory === cat
                      ? 'bg-[#43408C] text-white font-medium shadow-sm'
                      : 'bg-gray-100 text-[#4A4A4A] hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm animate-pulse h-80" />
            ))
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <Link to={`/products/${product.slug || product.id}`} className="block">
                  <div className="relative h-64 bg-gray-50 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl text-[#C9A96A]">🌸</div>
                    )}
                  </div>
                </Link>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#C9A96A] font-semibold">
                      {product.scent_family || product.category}
                    </span>
                    <Link to={`/products/${product.slug || product.id}`}>
                      <h3 className="font-serif text-base font-semibold text-[#1A1A1A] group-hover:text-[#43408C] transition line-clamp-1 mt-0.5">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#43408C]">
                      ₦{Number(product.selling_price).toLocaleString()}
                    </span>

                    <button
                      onClick={() => addToCart(product, 1)}
                      className="inline-flex items-center gap-1 bg-[#FAF9F6] hover:bg-[#43408C] hover:text-white text-[#43408C] border border-[#43408C]/20 text-xs font-semibold px-3 py-2 rounded-lg transition"
                    >
                      <ShoppingBag size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
