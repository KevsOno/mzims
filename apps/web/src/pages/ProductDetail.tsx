import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../store/CartContext';
import { formatCurrency } from '../lib/currency';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    // 1. Strict guardrail against bad slug values
    if (!slug || slug === 'null' || slug === 'undefined' || slug.trim() === '') {
      setLoading(false);
      return;
    }

    // 2. Prevent race conditions on unmounted components
    let isMounted = true;
    setLoading(true);

    // 3. Encoded URL path
    api.get(`/products/slug/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (isMounted) setProduct(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch product:', err);
        if (isMounted) setProduct(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      quantity,
      unit_price: product.selling_price,
      image: product.images?.[0] || '',
      sku: product.sku,
    });
  };

  if (loading) return <div className="container py-12 text-center">Loading product...</div>;
  if (!product) return <div className="container py-12 text-center">Product not found.</div>;

  return (
    <div className="container py-8">
      <Link to="/products" className="inline-flex items-center gap-1 text-[#43408C] hover:underline mb-6">
        <ArrowLeft size={18} /> Back to Collection
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-[#FAF9F6] rounded-lg flex items-center justify-center p-8 aspect-square">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <div className="text-8xl text-[#C9A96A]">🌸</div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#43408C]">{product.name}</h1>
          <p className="text-sm text-[#4A4A4A] mt-1">{product.scent_family || 'Fragrance'} · {product.gender || 'Unisex'}</p>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-[#C9A96A] text-[#C9A96A]" />
            ))}
            <span className="text-sm text-[#4A4A4A] ml-2">(5.0)</span>
          </div>

          <div className="mt-4 text-2xl font-bold text-[#43408C]">
            {formatCurrency(product.selling_price)}
          </div>

          <p className="mt-4 text-[#4A4A4A]">{product.description || 'A captivating fragrance that embodies elegance and style.'}</p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-[#E5E0D8] rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-[#FAF9F6]"
              >
                -
              </button>
              <span className="w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-[#FAF9F6]"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#43408C] text-white px-6 py-3 rounded-md hover:bg-[#332E6E] transition flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
          </div>

          <div className="mt-6 text-sm text-[#4A4A4A] border-t border-[#E5E0D8] pt-4">
            <p>SKU: {product.sku}</p>
            <p className="mt-1">Availability: {product.current_stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
