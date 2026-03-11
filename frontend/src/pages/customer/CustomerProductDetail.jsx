import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import CustomerHeader from './components/CustomerHeader';
import { api } from '../../utils/api';

const CustomerProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showArtisanDetails, setShowArtisanDetails] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [shareToast, setShareToast] = useState('');
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const [orderForm, setOrderForm] = useState({
    name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
    phone: userProfile.phone || '',
    street: userProfile.location?.address || '',
    city: userProfile.location?.city || '',
    state: userProfile.location?.state || '',
    pincode: userProfile.location?.pincode || '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.products.get(id);
      const data = response.data?.data?.product;
      setProduct(data);
      setArtisan(data?.artisan);

      // Check if user has favorited this product
      if (data?.favorites && userProfile.uid) {
        setIsFavorited(data.favorites.includes(userProfile.uid));
      }

      // Load full artisan profile
      if (data?.artisan?.uid) {
        try {
          const artisanResponse = await api.user.getPublicProfile(data.artisan.uid);
          const artisanData = artisanResponse.data?.data?.user || artisanResponse.data?.data;
          if (artisanData) {
            setArtisan(prev => ({ ...prev, ...artisanData }));
          }
        } catch (err) {
          console.warn('Could not load full artisan profile:', err.message);
        }
      }
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setFavoriteLoading(true);
      const response = await api.products.favorite(id);
      setIsFavorited(response.data?.data?.isFavorited);
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out "${product.name}" on ArtisanConnect — ${formatPrice(product.price)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text, url });
        return;
      }
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setShareToast('Link copied!');
    setTimeout(() => setShareToast(''), 2000);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      setOrderPlacing(true);
      await api.orders.create({
        items: [{ productId: product.id || id, quantity }],
        shippingAddress: {
          name: orderForm.name,
          street: orderForm.street,
          city: orderForm.city,
          state: orderForm.state,
          pincode: orderForm.pincode,
          country: 'India',
          phone: orderForm.phone
        },
        paymentMethod: orderForm.paymentMethod
      });
      setOrderSuccess(true);
    } catch (err) {
      console.error('Order failed:', err);
      const msg = err.response?.data?.details?.[0]?.message || err.response?.data?.message || 'Failed to place order. Please check all fields and try again.';
      alert(msg);
    } finally {
      setOrderPlacing(false);
    }
  };

  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

  const parseDate = (ts) => {
    if (!ts) return 'Unknown';
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return isNaN(d) ? 'Unknown' : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const images = product?.imageUrls || product?.images || [];
  const prevImage = () => setSelectedImage(i => (i > 0 ? i - 1 : images.length - 1));
  const nextImage = () => setSelectedImage(i => (i < images.length - 1 ? i + 1 : 0));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerHeader />
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square shimmer rounded-2xl" />
            <div className="space-y-5 py-4">
              <div className="h-8 shimmer rounded-xl w-3/4" />
              <div className="h-4 shimmer rounded-lg w-1/2" />
              <div className="h-12 shimmer rounded-xl w-1/3" />
              <div className="h-32 shimmer rounded-xl" />
              <div className="h-14 shimmer rounded-2xl w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerHeader />
        <div className="text-center py-24 animate-fade-in">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-100 to-amber-50 rounded-3xl flex items-center justify-center mb-6 animate-float">
            <Icon name="Package" size={40} className="text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 font-heading">Product not found</h2>
          <p className="text-gray-500 mb-6 text-sm">This product may have been removed or doesn't exist.</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // Order success screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerHeader />
        <div className="max-w-md mx-auto text-center py-20 px-4 animate-scale-in">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle" size={48} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">Order Placed!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your order for <strong className="text-gray-900">{product.name}</strong> has been placed successfully. 
            The artisan will be notified and will process your order shortly.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/shop/orders')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product.name} | ArtisanConnect Shop</title>
      </Helmet>

      <CustomerHeader />

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-xl shadow-lg animate-fade-in">
          {shareToast}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <button onClick={() => navigate('/shop')} className="hover:text-orange-600 transition-colors">Shop</button>
          <Icon name="ChevronRight" size={14} />
          {product.category && (
            <>
              <button
                onClick={() => navigate(`/shop?category=${encodeURIComponent(product.category)}`)}
                className="hover:text-orange-600 transition-colors"
              >
                {product.category}
              </button>
              <Icon name="ChevronRight" size={14} />
            </>
          )}
          <span className="text-gray-700 font-medium truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Image Gallery — with smooth transitions */}
          <div className="space-y-3">
            <div className="aspect-square bg-white rounded-2xl border border-orange-100/60 overflow-hidden shadow-warm-md relative group">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50/30">
                  <Icon name="ImageOff" size={48} className="text-gray-300 mb-2" />
                  <span className="text-xs text-gray-400">No image available</span>
                </div>
              )}
              {/* Image counter badge */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
              {/* Gallery navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                  >
                    <Icon name="ChevronLeft" size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                  >
                    <Icon name="ChevronRight" size={18} className="text-gray-700" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-18 h-18 shrink-0 rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                      selectedImage === idx
                        ? 'border-orange-500 shadow-md shadow-orange-200/50 scale-105'
                        : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-orange-300'
                    }`}
                  >
                    <Image src={img} alt="" className="w-16 h-16 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:py-2">
            {/* Category & craft type chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.category && (
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200/60 px-3 py-1 rounded-full">
                  {product.category}
                </span>
              )}
              {product.craftType && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
                  {product.craftType}
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 font-heading leading-tight">{product.name}</h1>

            {/* Rating + Favorite + Share row */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {/* Aggregate rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-full">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} name="Star" size={12} className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-700">{product.rating.toFixed(1)}</span>
                  {product.reviewsCount > 0 && (
                    <span className="text-xs text-gray-500">({product.reviewsCount})</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className={`p-2.5 rounded-xl border transition-all duration-200 ${
                    isFavorited
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200 hover:bg-red-50'
                  }`}
                  title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Icon name="Heart" size={18} className={isFavorited ? 'fill-red-500' : ''} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 transition-all duration-200"
                  title="Share product"
                >
                  <Icon name="Share2" size={18} />
                </button>
              </div>
            </div>

            {/* Price — large and prominent */}
            <div className="mb-5 flex items-baseline gap-3">
              <span className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock Status — badge style */}
            <div className="mb-5">
              {product.stockQuantity > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium bg-green-50 border border-green-200/60 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  In Stock ({product.stockQuantity} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-red-600 font-medium bg-red-50 border border-red-200/60 px-3 py-1.5 rounded-full">
                  <Icon name="XCircle" size={14} />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || 'No description available'}
              </p>
            </div>

            {/* Product Details Grid — glassmorphism cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.materials && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl p-3.5 border border-orange-100/60">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon name="Layers" size={12} className="text-orange-500" />
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Materials</p>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{Array.isArray(product.materials) ? product.materials.join(', ') : product.materials}</p>
                </div>
              )}
              {product.dimensions && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl p-3.5 border border-orange-100/60">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon name="Ruler" size={12} className="text-orange-500" />
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Dimensions</p>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">
                    {typeof product.dimensions === 'object'
                      ? [product.dimensions.length && `L: ${product.dimensions.length}`, product.dimensions.width && `W: ${product.dimensions.width}`, product.dimensions.height && `H: ${product.dimensions.height}`].filter(Boolean).join(' × ') || 'N/A'
                      : product.dimensions}
                  </p>
                </div>
              )}
              {(product.weight || (typeof product.dimensions === 'object' && product.dimensions.weight)) && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl p-3.5 border border-orange-100/60">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon name="Scale" size={12} className="text-orange-500" />
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Weight</p>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">
                    {typeof product.weight === 'object' ? JSON.stringify(product.weight) : (product.weight || product.dimensions?.weight || 'N/A')}
                  </p>
                </div>
              )}
              {product.createdAt && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl p-3.5 border border-orange-100/60">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon name="Calendar" size={12} className="text-orange-500" />
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Listed On</p>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{parseDate(product.createdAt)}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Buy Section — elevated card */}
            {product.stockQuantity > 0 && (
              <div className="bg-white border border-orange-200/60 rounded-2xl p-5 mb-6 shadow-warm-md">
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-semibold text-gray-700">Qty:</label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-orange-50 transition-colors"
                    >
                      <Icon name="Minus" size={14} />
                    </button>
                    <span className="px-5 py-2 text-sm font-bold border-x border-gray-200 bg-gray-50 min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-orange-50 transition-colors"
                    >
                      <Icon name="Plus" size={14} />
                    </button>
                  </div>
                  <span className="text-xl font-bold text-gray-900 ml-auto">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>

                {!showOrderForm ? (
                  <button
                    onClick={() => setShowOrderForm(true)}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-200/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-base"
                  >
                    <Icon name="ShoppingBag" size={20} />
                    Buy Now
                  </button>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-3 pt-4 border-t border-gray-100 animate-fade-in">
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Icon name="Truck" size={16} className="text-orange-500" />
                      Delivery Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        required
                        placeholder="Full Name *"
                        value={orderForm.name}
                        onChange={e => setOrderForm(f => ({ ...f, name: e.target.value }))}
                        className="col-span-2 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
                      />
                      <input
                        required
                        placeholder="Phone Number *"
                        pattern="[+]?[1-9][0-9]{0,15}"
                        value={orderForm.phone}
                        onChange={e => setOrderForm(f => ({ ...f, phone: e.target.value }))}
                        className="col-span-2 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
                      />
                      <input
                        required
                        placeholder="Street Address *"
                        value={orderForm.street}
                        onChange={e => setOrderForm(f => ({ ...f, street: e.target.value }))}
                        className="col-span-2 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
                      />
                      <input
                        required
                        placeholder="City *"
                        value={orderForm.city}
                        onChange={e => setOrderForm(f => ({ ...f, city: e.target.value }))}
                        className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
                      />
                      <input
                        required
                        placeholder="State *"
                        value={orderForm.state}
                        onChange={e => setOrderForm(f => ({ ...f, state: e.target.value }))}
                        className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
                      />
                      <input
                        required
                        placeholder="PIN Code *"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={orderForm.pincode}
                        onChange={e => setOrderForm(f => ({ ...f, pincode: e.target.value }))}
                        className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all"
                      />
                      <select
                        value={orderForm.paymentMethod}
                        onChange={e => setOrderForm(f => ({ ...f, paymentMethod: e.target.value }))}
                        className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all bg-white cursor-pointer"
                      >
                        <option value="cod">Cash on Delivery</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowOrderForm(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={orderPlacing}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                      >
                        {orderPlacing ? (
                          <>
                            <Icon name="Loader" size={16} className="animate-spin" />
                            Placing...
                          </>
                        ) : (
                          <>
                            <Icon name="CheckCircle" size={16} />
                            Place Order — {formatPrice(product.price * quantity)}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Artisan Card — modern expandable card */}
            <div className="bg-white border border-orange-200/60 rounded-2xl overflow-hidden shadow-warm">
              <div
                onClick={() => setShowArtisanDetails(!showArtisanDetails)}
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-orange-50/50 transition-all duration-200"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-orange-200/40">
                  {artisan?.avatarUrl || artisan?.profilePhoto ? (
                    <Image
                      src={artisan.avatarUrl || artisan.profilePhoto}
                      alt={artisan.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={24} className="text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-gray-900 text-base">
                      {artisan?.firstName} {artisan?.lastName}
                    </h4>
                    {artisan?.isVerified && (
                      <Icon name="BadgeCheck" size={18} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {artisan?.location?.city && `${artisan.location.city}, `}
                    {artisan?.location?.state || 'India'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-orange-600 font-semibold bg-orange-50 px-3 py-1.5 rounded-full">
                  {showArtisanDetails ? 'Hide' : 'View'}
                  <Icon name={showArtisanDetails ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </div>
              </div>

              {/* Expanded Artisan Profile */}
              {showArtisanDetails && (
                <div className="border-t border-orange-100/60 p-5 bg-gradient-to-b from-orange-50/30 to-white space-y-5 animate-fade-in">
                  {/* Bio */}
                  {artisan?.bio && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About the Artisan</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{artisan.bio}</p>
                    </div>
                  )}

                  {/* Stats Row — gradient cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {artisan?.artisanProfile?.totalSales !== undefined && (
                      <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-3 text-center border border-orange-100/60">
                        <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{artisan.artisanProfile.totalSales || 0}</p>
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Sales</p>
                      </div>
                    )}
                    {artisan?.artisanProfile?.rating !== undefined && (
                      <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-3 text-center border border-orange-100/60">
                        <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center justify-center gap-1">
                          {artisan.artisanProfile.rating || 0}
                          <Icon name="Star" size={16} className="text-yellow-400" />
                        </p>
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Rating</p>
                      </div>
                    )}
                    {artisan?.yearsOfExperience && (
                      <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-3 text-center border border-orange-100/60">
                        <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{artisan.yearsOfExperience}</p>
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Years Exp.</p>
                      </div>
                    )}
                  </div>

                  {/* Craft Specializations */}
                  {Array.isArray(artisan?.craftSpecializations) && artisan.craftSpecializations.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-2">
                        {artisan.craftSpecializations.map((craft, i) => (
                          <span key={i} className="text-xs bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-3 py-1.5 rounded-full font-semibold border border-orange-200/40">
                            {typeof craft === 'string' ? craft : String(craft)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Traditional Techniques */}
                  {Array.isArray(artisan?.craftTechniques) && artisan.craftTechniques.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Techniques</p>
                      <div className="flex flex-wrap gap-2">
                        {artisan.craftTechniques.map((tech, i) => (
                          <span key={i} className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-medium border border-amber-200/40">
                            {typeof tech === 'string' ? tech : String(tech)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio — rounded with hover effect */}
                  {Array.isArray(artisan?.portfolioImages) && artisan.portfolioImages.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Portfolio</p>
                      <div className="grid grid-cols-4 gap-2">
                        {artisan.portfolioImages.slice(0, 4).map((img, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white border border-gray-200/60 group/port">
                            <Image src={typeof img === 'string' ? img : ''} alt="Portfolio" className="w-full h-full object-cover group-hover/port:scale-110 transition-transform duration-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Awards */}
                  {Array.isArray(artisan?.awardsRecognition) && artisan.awardsRecognition.filter(a => typeof a === 'string' && a.trim()).length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Awards & Recognition</p>
                      <div className="space-y-2">
                        {artisan.awardsRecognition.filter(a => typeof a === 'string' && a.trim()).map((award, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 bg-gradient-to-r from-amber-50 to-white p-2.5 rounded-xl border border-amber-100/60">
                            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                              <Icon name="Award" size={14} className="text-amber-500" />
                            </div>
                            {award}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact & Location */}
                  <div className="space-y-2">
                    {artisan?.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 bg-white rounded-xl p-3.5 border border-gray-100">
                        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                          <Icon name="Phone" size={16} className="text-orange-500" />
                        </div>
                        <a href={`tel:${artisan.phone}`} className="text-orange-600 font-semibold hover:underline">{artisan.phone}</a>
                      </div>
                    )}
                    {artisan?.location && (
                      <div className="flex items-start gap-3 text-sm text-gray-600 bg-white rounded-xl p-3.5 border border-gray-100">
                        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                          <Icon name="MapPin" size={16} className="text-orange-500" />
                        </div>
                        <span className="leading-relaxed">
                          {[artisan.location.address, artisan.location.city, artisan.location.state, artisan.location.pincode]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews — modern cards */}
            {product.reviews?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Customer Reviews ({product.reviews.length})
                </h3>
                <div className="space-y-3">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-100/80 rounded-2xl p-5 hover:shadow-warm transition-shadow duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center">
                          <Icon name="User" size={14} className="text-gray-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          {review.customerName || `${review.customer?.firstName || ''} ${review.customer?.lastName || ''}`.trim() || 'Anonymous'}
                        </span>
                        {review.rating && (
                          <div className="flex items-center gap-0.5 ml-auto bg-amber-50 px-2.5 py-1 rounded-full">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Icon
                                key={i}
                                name="Star"
                                size={12}
                                className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment || review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductDetail;
