import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';

const Products: React.FC = () => {
  const [masterProducts, setMasterProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states initialized from URL params
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');

  // 1. Fetch initial master product list once
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products');
        setMasterProducts(res.data || []);
      } catch (e) {
        console.error('Failed to load products:', e);
        setMasterProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 2. Extract valid categories using both category and scent_family
  const allCategories = useMemo(() => {
    return Array.from(
      new Set(
        masterProducts
          .map((p) => p.category || p.scent_family)
          .filter((cat): cat is string => Boolean(cat) && typeof cat === 'string')
          .map((cat) => cat.trim())
      )
    );
  }, [masterProducts]);

  // Extract valid genders
  const allGenders = useMemo(() => {
    return Array.from(
      new Set(
        masterProducts
          .map((p) => p.gender)
          .filter((g): g is string => Boolean(g) && typeof g === 'string')
          .map((g) => g.trim())
      )
    );
  }, [masterProducts]);

  // 3. Client-side filtered products to guarantee consistent note/category matching
  const filteredProducts = useMemo(() => {
    return masterProducts.filter((product) => {
      // Category / Scent Family Filter
      if (category.trim()) {
        const targetCategory = category.toLowerCase().trim();
        const prodCategory = (product.category || '').toLowerCase();
        const prodScentFamily = (product.scent_family || '').toLowerCase();
        
        const matchesCategory = prodCategory.includes(targetCategory) || prodScentFamily.includes(targetCategory);
        if (!matchesCategory) return false;
      }

      // Gender Filter
      if (gender.trim()) {
        const targetGender = gender.toLowerCase().trim();
        const prodGender = (product.gender || '').toLowerCase();
        if (!prodGender.includes(targetGender)) return false;
      }

      // Search Query Filter
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const nameMatch = (product.name || '').toLowerCase().includes(query);
        const descMatch = (product.description || '').toLowerCase().includes(query);
        const scentMatch = (product.scent_family || '').toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !scentMatch) return false;
      }

      return true;
    });
  }, [masterProducts, category, gender, search]);

  // Sync URL search parameters
  useEffect(() => {
    const newParams: Record<string, string> = {};
    if (category) newParams.category = category;
    if (gender) newParams.gender = gender;
    if (search) newParams.q = search;

    setSearchParams(newParams, { replace: true });
  }, [category, gender, search, setSearchParams]);

  // Handler to clear filters
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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
              <p className="text-gray-500 text-sm">No products found matching your active filters.</p>
              <button
                onClick={handleResetFilters}
                className="mt-3 text-xs bg-[#43408C] text-[#ffffff] px-4 py-2 rounded-md hover:bg-[#2D2A6E] transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
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
                    <p className="text-xs text-gray-500">{product.scent_family || product.category}</p>
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
