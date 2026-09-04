import React, { useEffect, useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { formatCurrency } from '../lib/currency';
import api from '../lib/api';

interface Product {
  id: number;
  name: str;
  selling_price: number;
  images?: string[];
  scent_family?: string;
}

export const RecommendedProducts: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const endpoint = user 
          ? `/recommendations/user?customer_id=${user.id}&limit=4`
          : `/products?limit=4`;
        const res = await api.get(endpoint);
        setRecommendations(res.data);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (loading) return <div className="py-8 text-center text-gray-500 text-sm">Curating your recommendations...</div>;
  if (recommendations.length === 0) return null;

  return (
    <section className="py-12 bg-[#FAF8F5]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col mb-6">
          <h2 className="text-2xl font-serif text-[#43408C]">
            {user ? 'Curated Specially For You' : 'Trending Scents'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {user ? 'Based on your fragrance profile and past choices' : 'Handpicked popular fragrances'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {recommendations.map((product) => (
            <div key={product.id} className="bg-white rounded-lg p-4 border border-[#E5E0D8] shadow-sm hover:shadow-md transition">
              <img
                src={product.images?.[0] || '/placeholder-perfume.jpg'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-3"
              />
              {product.scent_family && (
                <span className="text-[10px] uppercase tracking-wider text-[#43408C] bg-[#F0EFEF] px-2 py-0.5 rounded">
                  {product.scent_family}
                </span>
              )}
              <h3 className="font-semibold text-sm mt-2 text-gray-800 line-clamp-1">{product.name}</h3>
              <p className="text-sm font-bold text-[#43408C] mt-1">{formatCurrency(product.selling_price)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
