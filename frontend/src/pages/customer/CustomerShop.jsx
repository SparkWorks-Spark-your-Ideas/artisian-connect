import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import CustomerHeader from './components/CustomerHeader';
import { api } from '../../utils/api';

const CustomerShop = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'All Categories',
    'Textiles & Fabrics',
    'Pottery & Ceramics',
    'Woodwork',
    'Metalwork',
    'Jewelry',
    'Paintings & Art',
    'Leather Goods',
    'Bamboo & Cane',
    'Stone Carving',
    'Embroidery',
    'Other'
  ];

  useEffect(() => {
    fetchProducts();
  }, [category, sortBy, sortOrder, page]);

  // Re-fetch when URL search param changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== search) {
      setSearch(urlSearch);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        sortBy,
        sortOrder
      };
      if (search) params.search = search;
      if (category && category !== 'All Categories') params.category = category;

      const response = await api.products.list(params);
      const data = response.data?.data;
      setProducts(data?.products || []);
      setTotalPages(data?.pagination?.totalPages || 1);
      setTotal(data?.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams(search ? { search } : {});
    fetchProducts();
  };

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Shop Handcrafted Products | ArtisanConnect</title>
      </Helmet>

      <CustomerHeader />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
          <h1 className="text-2xl lg:text-4xl font-bold mb-2">Discover Handcrafted Treasures</h1>
          <p className="text-orange-100 text-sm lg:text-base max-w-xl">
            Shop unique, handmade products directly from skilled Indian artisans. Every purchase supports a craftsperson's livelihood.
          </p>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-4 md:hidden">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-full text-sm text-white placeholder-orange-200 focus:outline-none focus:bg-white/30"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Category Chips + Sort */}
      <div className="bg-white border-b border-orange-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Filter Toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm font-medium text-orange-700"
            >
              <Icon name="SlidersHorizontal" size={14} />
              Filters
            </button>

            {/* Category Chips (desktop) */}
            <div className="hidden md:flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat === 'All Categories' ? '' : cat); setPage(1); }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    (cat === 'All Categories' && !category) || category === cat
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500 hidden sm:block">Sort:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  setSortBy(sb);
                  setSortOrder(so);
                  setPage(1);
                }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-300"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Mobile filter panel */}
          {showFilters && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat === 'All Categories' ? '' : cat); setPage(1); setShowFilters(false); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      (cat === 'All Categories' && !category) || category === cat
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <p className="text-sm text-gray-500">
          {loading ? 'Loading products...' : `Showing ${products.length} of ${total} products`}
          {search && <span className="text-orange-600 font-medium"> for "{search}"</span>}
          {category && <span className="text-orange-600 font-medium"> in {category}</span>}
        </p>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-orange-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="Package" size={32} className="text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No products found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            {(search || category) && (
              <button
                onClick={() => { setSearch(''); setCategory(''); setSearchParams({}); }}
                className="mt-4 text-orange-600 font-medium text-sm hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/shop/product/${product.id}`)}
                  className="bg-white rounded-xl border border-orange-100 overflow-hidden cursor-pointer group hover:shadow-lg hover:border-orange-300 transition-all duration-200"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    <Image
                      src={product.imageUrls?.[0] || product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Sold Out</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-orange-700 transition-colors">
                      {product.name}
                    </h3>

                    {/* Artisan */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                        <Icon name="User" size={10} className="text-orange-600" />
                      </div>
                      <span className="text-xs text-gray-500 truncate">
                        {product.artisan?.firstName} {product.artisan?.lastName}
                      </span>
                      {product.artisan?.isVerified && (
                        <Icon name="BadgeCheck" size={12} className="text-orange-500 shrink-0" />
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.artisan?.location?.state && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Icon name="MapPin" size={10} />
                          {product.artisan.location.state}
                        </span>
                      )}
                    </div>

                    {/* Category tag */}
                    {product.category && (
                      <span className="inline-block mt-2 text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-orange-50"
                >
                  <Icon name="ChevronLeft" size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-orange-500 text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-orange-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="text-gray-400">...</span>}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-orange-50"
                >
                  <Icon name="ChevronRight" size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerShop;
