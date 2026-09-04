import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states initialized from URL params
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');

  // Persistent Filter Options
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allGenders, setAllGenders] = useState<string[]>([]);

  // 1. Fetch initial master product list to extract valid filter options
  useEffect(() => {
    const fetchMasterFilterOptions = async () => {
      try {
        const res = await api.get('/products');
        const rawProducts: any[] = res.data || [];

        const categories = Array.from(
          new Set(
            rawProducts
              .map((p) => p.category)
              .filter((cat): cat is string => Boolean(cat) && typeof cat === 'string')
              .map((cat) => cat.trim())
          )
        );

        const genders = Array.from(
          new Set(
            rawProducts
              .map((p) => p.gender)
              .filter((g): g is string => Boolean(g) && typeof g === 'string')
              .map((g) => g.trim())
          )
        );

        setAllCategories(categories);
        setAllGenders(genders);
      } catch (e) {
        console.error('Failed to load filter options:', e);
      }
    };

    fetchMasterFilterOptions();
  }, []);

  // 2. Fetch filtered products with sanitized parameters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      
      // Trim and ensure string safety before sending
      if (category.trim()) params.category = category.trim();
      if (gender.trim()) params.gender = gender.trim();
      if (search.trim()) params.search = search.trim();

      // Axios handles URL parameter encoding automatically via the params object
      const res = await api.get('/products', { params });
      setProducts(res.data);
    } catch (e) {
      console.error('Error fetching filtered products:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, gender, search]);

  useEffect(() => {
    fetchProducts();

    // Update URL Search Params without breaking special characters (&, spaces)
    const newParams: Record<string, string> = {};
    if (category) newParams.category = category;
    if (gender) newParams.gender = gender;
    if (search) newParams.q = search;

    setSearchParams(newParams, { replace: true });
  }, [fetchProducts]);

  // Handler to clear filters easily
  const handleResetFilters = () => {
    setCategory('');
    setGender('');
    setSearch('');
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-4">
        <h1 className="text-2xl md:text-3xl font-serif text-[#43408C]">Our Collection</h1>
        <input
          type="text"
          placeholder="Search fragrances..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8 px-4">
        {/* Dynamic Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#1A1A1A]">Filter By</h3>
              {(category || gender || search) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#43408C] hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-medium text-[#4A4A4A] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 text-sm border rounded-md"
              >
                <option value="">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Dropdown */}
            {allGenders.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-[#4A4A4A] mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 text-sm border rounded-md"
                >
                  <option value="">All Genders</option>
                  {allGenders.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
              <p className="text-gray-500 text-sm">No products found matching your active filters.</p>
              <button
                onClick={handleResetFilters}
                className="mt-3 text-xs bg-[#43408C] text-white px-4 py-2 rounded-md hover:bg-[#2D2A6E] transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link
                  to={`/products/${product.slug || product.id}`}
                  key={product.id}
                  className="p-3 border border-gray-100 rounded-lg hover:shadow-md transition bg-white flex flex-col justify-between"
                >
                  <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-2">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover rounded" />
                    ) : (
                      <span className="text-3xl">🌸</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-[#1A1A1A] truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <p className="text-[#43408C] font-bold text-sm mt-1">
                      ₦{Number(product.selling_price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
