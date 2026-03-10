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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerHeader />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="h-24 bg-gray-100 rounded" />
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
        <div className="text-center py-20">
          <Icon name="Package" size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Product not found</h2>
          <button onClick={() => navigate('/shop')} className="text-orange-600 font-medium text-sm hover:underline">
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
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle" size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-6">
            Your order for <strong>{product.name}</strong> has been placed successfully. 
            The artisan will be notified and will process your order shortly.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/shop/orders')}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
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

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/shop')} className="hover:text-orange-600">Shop</button>
          <Icon name="ChevronRight" size={14} />
          {product.category && (
            <>
              <button
                onClick={() => navigate(`/shop?category=${encodeURIComponent(product.category)}`)}
                className="hover:text-orange-600"
              >
                {product.category}
              </button>
              <Icon name="ChevronRight" size={14} />
            </>
          )}
          <span className="text-gray-800 font-medium truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square bg-white rounded-xl border border-orange-100 overflow-hidden mb-3">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Icon name="ImageOff" size={48} className="text-gray-300" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden transition-colors ${
                      selectedImage === idx ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <Image src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

            {/* Category & craft type */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.category && (
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
              )}
              {product.craftType && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  {product.craftType}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-2 text-lg text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              {product.stockQuantity > 0 ? (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <Icon name="CheckCircle" size={14} />
                  In Stock ({product.stockQuantity} available)
                </span>
              ) : (
                <span className="text-sm text-red-500 font-medium flex items-center gap-1">
                  <Icon name="XCircle" size={14} />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || 'No description available'}
              </p>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.materials && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 uppercase font-medium mb-1">Materials</p>
                  <p className="text-sm text-gray-800">{Array.isArray(product.materials) ? product.materials.join(', ') : product.materials}</p>
                </div>
              )}
              {product.dimensions && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 uppercase font-medium mb-1">Dimensions</p>
                  <p className="text-sm text-gray-800">
                    {typeof product.dimensions === 'object'
                      ? [product.dimensions.length && `L: ${product.dimensions.length}`, product.dimensions.width && `W: ${product.dimensions.width}`, product.dimensions.height && `H: ${product.dimensions.height}`].filter(Boolean).join(' × ') || 'N/A'
                      : product.dimensions}
                  </p>
                </div>
              )}
              {(product.weight || (typeof product.dimensions === 'object' && product.dimensions.weight)) && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 uppercase font-medium mb-1">Weight</p>
                  <p className="text-sm text-gray-800">
                    {typeof product.weight === 'object' ? JSON.stringify(product.weight) : (product.weight || product.dimensions?.weight || 'N/A')}
                  </p>
                </div>
              )}
              {product.createdAt && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 uppercase font-medium mb-1">Listed On</p>
                  <p className="text-sm text-gray-800">{parseDate(product.createdAt)}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Buy Section */}
            {product.stockQuantity > 0 && (
              <div className="bg-white border border-orange-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-medium text-gray-700">Qty:</label>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-medium border-x border-gray-200">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-lg font-bold text-gray-900 ml-auto">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>

                {!showOrderForm ? (
                  <button
                    onClick={() => setShowOrderForm(true)}
                    className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="ShoppingBag" size={18} />
                    Buy Now
                  </button>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-3 pt-3 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">Delivery Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        required
                        placeholder="Full Name *"
                        value={orderForm.name}
                        onChange={e => setOrderForm(f => ({ ...f, name: e.target.value }))}
                        className="col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-300"
                      />
                      <input
                        required
                        placeholder="Phone Number *"
                        pattern="[+]?[1-9][\d]{0,15}"
                        value={orderForm.phone}
                        onChange={e => setOrderForm(f => ({ ...f, phone: e.target.value }))}
                        className="col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-300"
                      />
                      <input
                        required
                        placeholder="Street Address *"
                        value={orderForm.street}
                        onChange={e => setOrderForm(f => ({ ...f, street: e.target.value }))}
                        className="col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-300"
                      />
                      <input
                        required
                        placeholder="City *"
                        value={orderForm.city}
                        onChange={e => setOrderForm(f => ({ ...f, city: e.target.value }))}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-300"
                      />
                      <input
                        required
                        placeholder="State *"
                        value={orderForm.state}
                        onChange={e => setOrderForm(f => ({ ...f, state: e.target.value }))}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-300"
                      />
                      <input
                        required
                        placeholder="PIN Code *"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={orderForm.pincode}
                        onChange={e => setOrderForm(f => ({ ...f, pincode: e.target.value }))}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-300"
                      />
                      <select
                        value={orderForm.paymentMethod}
                        onChange={e => setOrderForm(f => ({ ...f, paymentMethod: e.target.value }))}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-300"
                      >
                        <option value="cod">Cash on Delivery</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowOrderForm(false)}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={orderPlacing}
                        className="flex-1 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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

            {/* Artisan Card */}
            <div className="bg-white border border-orange-200 rounded-xl overflow-hidden">
              <div
                onClick={() => setShowArtisanDetails(!showArtisanDetails)}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-orange-50/50 transition-colors"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {artisan?.avatarUrl || artisan?.profilePhoto ? (
                    <Image
                      src={artisan.avatarUrl || artisan.profilePhoto}
                      alt={artisan.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={20} className="text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-gray-900">
                      {artisan?.firstName} {artisan?.lastName}
                    </h4>
                    {artisan?.isVerified && (
                      <Icon name="BadgeCheck" size={16} className="text-orange-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {artisan?.location?.city && `${artisan.location.city}, `}
                    {artisan?.location?.state || 'India'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
                  View Artisan
                  <Icon name={showArtisanDetails ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </div>
              </div>

              {/* Expanded Artisan Profile */}
              {showArtisanDetails && (
                <div className="border-t border-orange-100 p-4 bg-orange-50/30 space-y-4">
                  {/* Bio */}
                  {artisan?.bio && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">About the Artisan</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{artisan.bio}</p>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2">
                    {artisan?.artisanProfile?.totalSales !== undefined && (
                      <div className="bg-white rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-orange-600">{artisan.artisanProfile.totalSales || 0}</p>
                        <p className="text-[10px] text-gray-500">Sales</p>
                      </div>
                    )}
                    {artisan?.artisanProfile?.rating !== undefined && (
                      <div className="bg-white rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-orange-600 flex items-center justify-center gap-0.5">
                          {artisan.artisanProfile.rating || 0}
                          <Icon name="Star" size={14} className="text-yellow-400" />
                        </p>
                        <p className="text-[10px] text-gray-500">Rating</p>
                      </div>
                    )}
                    {artisan?.yearsOfExperience && (
                      <div className="bg-white rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-orange-600">{artisan.yearsOfExperience}</p>
                        <p className="text-[10px] text-gray-500">Years Exp.</p>
                      </div>
                    )}
                  </div>

                  {/* Craft Specializations */}
                  {Array.isArray(artisan?.craftSpecializations) && artisan.craftSpecializations.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1.5">Specializations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {artisan.craftSpecializations.map((craft, i) => (
                          <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-medium">
                            {typeof craft === 'string' ? craft : String(craft)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Traditional Techniques */}
                  {Array.isArray(artisan?.craftTechniques) && artisan.craftTechniques.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1.5">Techniques</p>
                      <div className="flex flex-wrap gap-1.5">
                        {artisan.craftTechniques.map((tech, i) => (
                          <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                            {typeof tech === 'string' ? tech : String(tech)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio */}
                  {Array.isArray(artisan?.portfolioImages) && artisan.portfolioImages.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1.5">Portfolio</p>
                      <div className="grid grid-cols-4 gap-2">
                        {artisan.portfolioImages.slice(0, 4).map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-white border border-gray-200">
                            <Image src={typeof img === 'string' ? img : ''} alt="Portfolio" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Awards */}
                  {Array.isArray(artisan?.awardsRecognition) && artisan.awardsRecognition.filter(a => typeof a === 'string' && a.trim()).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1.5">Awards & Recognition</p>
                      <div className="space-y-1">
                        {artisan.awardsRecognition.filter(a => typeof a === 'string' && a.trim()).map((award, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <Icon name="Award" size={14} className="text-amber-500 shrink-0" />
                            {award}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  {artisan?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg p-3">
                      <Icon name="Phone" size={16} className="text-orange-500 shrink-0" />
                      <a href={`tel:${artisan.phone}`} className="text-orange-600 font-medium hover:underline">{artisan.phone}</a>
                    </div>
                  )}

                  {/* Location */}
                  {artisan?.location && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-white rounded-lg p-3">
                      <Icon name="MapPin" size={16} className="text-orange-500 shrink-0 mt-0.5" />
                      <span>
                        {[artisan.location.address, artisan.location.city, artisan.location.state, artisan.location.pincode]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reviews */}
            {product.reviews?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Customer Reviews ({product.reviews.length})
                </h3>
                <div className="space-y-3">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                          <Icon name="User" size={12} className="text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {review.customer?.firstName} {review.customer?.lastName}
                        </span>
                        {review.rating && (
                          <div className="flex items-center gap-0.5 ml-auto">
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
                      <p className="text-sm text-gray-600">{review.content || review.comment}</p>
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
