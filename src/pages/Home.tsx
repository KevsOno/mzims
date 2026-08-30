import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../lib/api';

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    api.get('/products?limit=4').then(res => setFeatured(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[#43408C] text-white py-20 md:py-32">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">Where fragrance meets style</h1>
          <p className="mt-4 text-lg md:text-xl opacity-90 max-w-2xl mx-auto">Discover our curated collection of luxury perfumes, crafted for those who appreciate the art of scent.</p>
          <Link to="/products" className="inline-block mt-8 bg-[#C9A96A] hover:bg-[#B8975A] text-white px-8 py-3 rounded-md font-medium transition flex items-center gap-2 mx-auto w-fit">
            Shop Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-12">
        <h2 className="text-2xl md:text-3xl font-serif text-[#43408C] mb-6">Featured Fragrances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product: any) => (
            <Link to={`/product/${product.slug}`} key={product.id} className="card group">
              <div className="aspect-square bg-[#FAF9F6] flex items-center justify-center p-4">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition" />
                ) : (
                  <div className="text-[#C9A96A] text-6xl">🌸</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#1A1A1A]">{product.name}</h3>
                <p className="text-sm text-[#4A4A4A]">{product.scent_family || 'Fragrance'}</p>
                <p className="text-[#43408C] font-bold mt-2">₦{Number(product.selling_price).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Request Scent CTA */}
      <section className="bg-[#FAF9F6] py-12 border-t border-[#E5E0D8]">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-[#43408C]">Can't find your signature scent?</h2>
          <p className="mt-2 text-[#4A4A4A]">Tell us what you're looking for, and we'll help you discover it.</p>
          <Link to="/request-scent" className="inline-block mt-4 btn-outline-gold">Request a Scent</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
