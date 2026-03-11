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
  const [debouncedSearch, setDebouncedSearch] = useState(search);
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

  // Sync URL search param → local state
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== search) {
      setSearch(urlSearch);
      setDebouncedSearch(urlSearch); // Apply URL searches immediately
      setPage(1);
    }
  }, [searchParams]);

  // Debounce manual typing (mobile search bar)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Single unified fetch — triggers on any filter change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 20,
          sortBy,
          sortOrder
        };
        if (debouncedSearch) params.search = debouncedSearch;
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

    fetchProducts();
  }, [debouncedSearch, category, sortBy, sortOrder, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setDebouncedSearch(search); // Apply immediately on submit
    setSearchParams(search ? { search } : {});
  };

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Shop Handcrafted Products | Artisian Connect</title>
      </Helmet>

      <CustomerHeader />

      {/* Hero Banner — gradient with decorative elements */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-400/20 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-float" />

        <div className="relative max-w-7xl mx-auto px-4 py-6 lg:py-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 mb-4 text-xs font-medium text-orange-100">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Handcrafted with love across India
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold mb-3 leading-tight font-heading">
              Discover Handcrafted<br />
              <span className="text-amber-200">Treasures</span>
            </h1>
            <p className="text-orange-100 text-sm lg:text-base max-w-lg leading-relaxed">
              Shop unique, handmade products directly from skilled Indian artisans. Every purchase supports a craftsperson's livelihood.
            </p>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-6 md:hidden">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-11 pr-4 py-3 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl text-sm text-white placeholder-orange-200 focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all"
              />
            </div>
          </form>

          {/* Quick Stats */}
          <div className="flex gap-6 mt-8 text-center">
            <div>
              <p className="text-2xl font-bold">{total || '—'}</p>
              <p className="text-xs text-orange-200">Products</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold">{categories.length - 1}+</p>
              <p className="text-xs text-orange-200">Categories</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-orange-200">Handmade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Chips + Sort — sticky glass bar */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-lg border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Filter Toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors"
            >
              <Icon name="SlidersHorizontal" size={14} />
              Filters
            </button>

            {/* Category Chips (desktop) — pill style */}
            <div className="hidden md:flex items-center gap-2 flex-1 flex-wrap py-1">
              {categories.map((cat) => {
                const isActive = (cat === 'All Categories' && !category) || category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat === 'All Categories' ? '' : cat); setPage(1); }}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md shadow-orange-200/50 scale-105'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-700 hover:shadow-sm'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400 hidden sm:block">Sort:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  setSortBy(sb);
                  setSortOrder(so);
                  setPage(1);
                }}
                className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition-shadow cursor-pointer"
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
            <div className="md:hidden mt-3 pt-3 border-t border-gray-100 animate-fade-in">
              <p className="text-xs font-medium text-gray-500 mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat === 'All Categories' ? '' : cat); setPage(1); setShowFilters(false); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                      (cat === 'All Categories' && !category) || category === cat
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent'
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
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <p className="text-sm text-gray-500">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Icon name="Loader" size={14} className="animate-spin text-orange-400" />
              Loading products...
            </span>
          ) : (
            <>
              Showing <span className="font-semibold text-gray-700">{products.length}</span> of <span className="font-semibold text-gray-700">{total}</span> products
            </>
          )}
          {search && <span className="text-orange-600 font-medium"> for "{search}"</span>}
          {category && <span className="text-orange-600 font-medium"> in {category}</span>}
        </p>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-orange-100/60 overflow-hidden">
                <div className="aspect-[4/5] shimmer" />
                <div className="p-4 space-y-3">
                  <div className="h-4 shimmer rounded-lg w-3/4" />
                  <div className="h-3 shimmer rounded-lg w-1/2" />
                  <div className="h-5 shimmer rounded-lg w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-100 to-amber-50 rounded-3xl flex items-center justify-center mb-6 animate-float">
              <Icon name="Package" size={40} className="text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 font-heading">No products found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">Try adjusting your search or browsing different categories</p>
            {(search || category) && (
              <button
                onClick={() => { setSearch(''); setCategory(''); setSearchParams({}); }}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-4 stagger-grid">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/shop/product/${product.id}`)}
                  className="group bg-white rounded-2xl border border-orange-100/60 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-orange-100/40 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="aspect-[4/5] bg-gradient-to-br from-gray-50 to-orange-50/30 relative overflow-hidden">
                    <Image
                      src={product.imageUrls?.[0] || product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />

                    {/* Hover overlay with quick view */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                          <Icon name="Eye" size={12} />
                          View Details
                        </span>
                      </div>
                    </div>

                    {/* Sold out badge */}
                    {product.stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                          Sold Out
                        </span>
                      </div>
                    )}

                    {/* Category badge */}
                    {product.category && (
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-semibold text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-700 transition-colors leading-snug">
                      {product.name}
                    </h3>

                    {/* Artisan */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center shrink-0">
                        <Icon name="User" size={10} className="text-white" />
                      </div>
                      <span className="text-xs text-gray-500 truncate font-medium">
                        {product.artisan?.firstName} {product.artisan?.lastName}
                      </span>
                      {product.artisan?.isVerified && (
                        <Icon name="BadgeCheck" size={14} className="text-blue-500 shrink-0" />
                      )}
                    </div>

                    {/* Price + Location Row */}
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900 tracking-tight">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      {product.artisan?.location?.state && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5 bg-gray-50 px-2 py-0.5 rounded-full">
                          <Icon name="MapPin" size={9} />
                          {product.artisan.location.state}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination — modern pill style */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl text-sm disabled:opacity-30 hover:bg-orange-50 hover:border-orange-200 transition-all"
                >
                  <Icon name="ChevronLeft" size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '...' ? (
                      <span key={`ellipsis-${idx}`} className="text-gray-300 px-1">···</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          page === item
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200/50 scale-110'
                            : 'border border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-200'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl text-sm disabled:opacity-30 hover:bg-orange-50 hover:border-orange-200 transition-all"
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
