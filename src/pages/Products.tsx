import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import api from '../lib/api';

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states
  const [scentFamily, setScentFamily] = useState(searchParams.get('scent') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (scentFamily) params.scent_family = scentFamily;
      if (gender) params.gender = gender;
      if (minPrice) params.min_price = parseFloat(minPrice);
      if (maxPrice) params.max_price = parseFloat(maxPrice);
      if (search) params.search = search;
      const res = await api.get('/products', { params });
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [scentFamily, gender, minPrice, maxPrice, search]);

  useEffect(() => {
    fetchProducts();
    // Update URL query params
    const newParams: any = {};
    if (scentFamily) newParams.scent = scentFamily;
    if (gender) newParams.gender = gender;
    if (minPrice) newParams.min = minPrice;
    if (maxPrice) newParams.max = maxPrice;
    if (search) newParams.q = search;
    setSearchParams(newParams, { replace: true });
  }, [fetchProducts]);

  const clearFilters = () => {
    setScentFamily('');
    setGender('');
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-serif text-[#43408C]">Our Collection</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search fragrances..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 md:w-64 px-4 py-2 border border-[#E5E0D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#43408C]"
          />
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden flex items-center gap-1 bg-[#43408C] text-white px-4 py-2 rounded-md"
          >
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-[#E5E0D8]">
            <h3 className="font-semibold mb-4">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A]">Scent Family</label>
                <select value={scentFamily} onChange={(e) => setScentFamily(e.target.value)} className="w-full mt-1 input-field">
                  <option value="">All</option>
                  <option value="Floral">Floral</option>
                  <option value="Woody">Woody</option>
                  <option value="Oriental">Oriental</option>
                  <option value="Fresh">Fresh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A]">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full mt-1 input-field">
                  <option value="">All</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A]">Price Range</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-1/2 input-field" />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-1/2 input-field" />
                </div>
              </div>
              <button onClick={clearFilters} className="text-sm text-[#43408C] hover:underline">Clear all</button>
            </div>
          </div>
        </aside>

        {/* Mobile Filters (slide-in) */}
        {filtersOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setFiltersOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button onClick={() => setFiltersOpen(false)}><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A]">Scent Family</label>
                  <select value={scentFamily} onChange={(e) => setScentFamily(e.target.value)} className="w-full mt-1 input-field">
                    <option value="">All</option>
                    <option value="Floral">Floral</option>
                    <option value="Woody">Woody</option>
                    <option value="Oriental">Oriental</option>
                    <option value="Fresh">Fresh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A]">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full mt-1 input-field">
                    <option value="">All</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A]">Price Range</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-1/2 input-field" />
                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-1/2 input-field" />
                  </div>
                </div>
                <button onClick={clearFilters} className="text-sm text-[#43408C] hover:underline">Clear all</button>
              </div>
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-[#E5E0D8] aspect-square rounded-lg"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-[#4A4A4A] py-12">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link to={`/product/${product.slug}`} key={product.id} className="card group">
                  <div className="aspect-square bg-[#FAF9F6] flex items-center justify-center p-4">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition" />
                    ) : (
                      <div className="text-[#C9A96A] text-4xl">🌸</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-[#4A4A4A]">{product.scent_family || 'Fragrance'}</p>
                    <p className="text-[#43408C] font-bold mt-1">₦{Number(product.selling_price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
