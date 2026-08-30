import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import api from '../lib/api';

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    api.get('/products?limit=4').then(res => setFeatured(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#43408C] via-[#332E6E] to-[#1A1A2E] text-white">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="300" fill="none" stroke="#C9A96A" strokeWidth="2" />
            <circle cx="400" cy="400" r="200" fill="none" stroke="#C9A96A" strokeWidth="1.5" />
            <circle cx="400" cy="400" r="100" fill="none" stroke="#C9A96A" strokeWidth="1" />
            <path d="M200 200 L600 600 M600 200 L200 600" stroke="#C9A96A" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
        {/* Decorative gold dot */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-[#C9A96A] rounded-full opacity-30" />
        <div className="absolute bottom-20 left-20 w-6 h-6 bg-[#C9A96A] rounded-full opacity-20" />

        <div className="container relative z-10 text-center px-4">
          <div className="inline-block mb-6 px-6 py-2 border border-[#C9A96A]/30 rounded-full text-[#C9A96A] text-sm tracking-widest uppercase">
            New Collection
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight tracking-tight">
            Where fragrance <br className="hidden sm:block" />
            <span className="text-[#C9A96A]">meets style</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
            Discover our curated collection of luxury perfumes, crafted for those who appreciate the art of scent.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="bg-[#C9A96A] hover:bg-[#B8975A] text-white px-8 py-4 rounded-full font-medium transition flex items-center gap-2 justify-center shadow-lg shadow-[#C9A96A]/20">
              Shop Now <ArrowRight size={20} />
            </Link>
            <Link to="/request-scent" className="border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-full font-medium transition flex items-center gap-2 justify-center backdrop-blur-sm">
              <Sparkles size={20} /> Request a Scent
            </Link>
          </div>
          <p className="mt-8 text-sm opacity-60">Free shipping on orders over ₦50,000</p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl md:text-4xl font-serif text-[#43408C]">Featured Fragrances</h2>
          <Link to="/products" className="text-[#C9A96A] hover:text-[#B8975A] font-medium flex items-center gap-1 transition">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((product: any) => (
            <Link to={`/product/${product.slug}`} key={product.id} className="group">
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="aspect-square bg-[#FAF9F6] flex items-center justify-center p-6 relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="text-7xl text-[#C9A96A]">🌸</div>
                  )}
                  <div className="absolute top-3 right-3 bg-[#C9A96A] text-white text-xs px-3 py-1 rounded-full">New</div>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] group-hover:text-[#43408C] transition">{product.name}</h3>
                  <p className="text-sm text-[#4A4A4A]">{product.scent_family || 'Fragrance'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-[#43408C]">₦{Number(product.selling_price).toLocaleString()}</span>
                    <span className="text-xs bg-[#FAF9F6] px-3 py-1 rounded-full text-[#4A4A4A]">In Stock</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Request Scent CTA */}
      <section className="bg-[#FAF9F6] py-16 border-t border-[#E5E0D8]">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-[#43408C]">Can't find your signature scent?</h2>
            <p className="mt-4 text-lg text-[#4A4A4A]">Tell us what you're looking for, and we'll help you discover it.</p>
            <Link to="/request-scent" className="inline-block mt-8 px-8 py-4 border-2 border-[#C9A96A] text-[#C9A96A] rounded-full font-medium hover:bg-[#C9A96A] hover:text-white transition duration-300">
              Request a Scent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
