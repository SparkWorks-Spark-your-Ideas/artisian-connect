import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import CustomerHeader from './components/CustomerHeader';
import { api } from '../../utils/api';

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' };
      if (statusFilter) params.status = statusFilter;
      const response = await api.orders.list(params);
      const data = response.data?.data;
      setOrders(data?.orders || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancellingId(orderId);
      await api.orders.cancel(orderId, 'Cancelled by customer');
      showToast('Order cancelled successfully');
      loadOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleSubmitReview = async (orderId, productId) => {
    try {
      setSubmittingReview(true);
      await api.orders.review(orderId, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        productId
      });
      showToast('Review submitted! Thank you.');
      setReviewingOrder(null);
      setReviewForm({ rating: 5, comment: '' });
      loadOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

  const parseDate = (ts) => {
    if (!ts) return '';
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusConfig = {
    pending: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: 'Clock', label: 'Pending' },
    confirmed: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: 'CheckCircle', label: 'Confirmed' },
    processing: { color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: 'Settings', label: 'Processing' },
    shipped: { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: 'Truck', label: 'Shipped' },
    delivered: { color: 'text-green-600 bg-green-50 border-green-200', icon: 'PackageCheck', label: 'Delivered' },
    cancelled: { color: 'text-red-600 bg-red-50 border-red-200', icon: 'XCircle', label: 'Cancelled' },
  };

  const getStatus = (order) => {
    const s = (order.orderStatus || order.status || 'pending').toLowerCase();
    return statusConfig[s] || statusConfig.pending;
  };

  const statusFilters = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>My Orders | Artisian Connect</title>
      </Helmet>

      <CustomerHeader />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-heading">My Orders</h1>
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                statusFilter === f.value
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md shadow-orange-200/40'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-200 hover:bg-orange-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
                    <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
                    <div className="h-5 bg-gray-200 rounded-lg w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-100 to-amber-50 rounded-3xl flex items-center justify-center mb-6 animate-float">
              <Icon name="ShoppingBag" size={36} className="text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1 font-heading">
              {statusFilter ? `No ${statusFilter} orders` : 'No orders yet'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {statusFilter ? 'Try a different filter' : 'Start shopping to see your orders here'}
            </p>
            <button
              onClick={() => statusFilter ? setStatusFilter('') : navigate('/shop')}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300"
            >
              {statusFilter ? 'View All Orders' : 'Browse Products'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = getStatus(order);
              const item = order.items?.[0];
              const totalQty = order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1;
              const isExpanded = expandedOrder === order.id;
              const orderStatusVal = (order.orderStatus || order.status || 'pending').toLowerCase();
              const canCancel = ['pending', 'confirmed'].includes(orderStatusVal);
              const canReview = orderStatusVal === 'delivered';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden hover:border-orange-200/60 transition-all duration-200 shadow-sm"
                >
                  {/* Main Row */}
                  <div
                    className="flex items-start gap-4 p-5 cursor-pointer"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl overflow-hidden shrink-0">
                      {item?.productImage ? (
                        <Image src={item.productImage} alt={item?.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="Package" size={24} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {item?.productName || `Order #${(order.orderId || order.id)?.slice(-8)}`}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.items?.length > 1 ? `${order.items.length} items` : `Qty: ${totalQty}`} · {parseDate(order.createdAt)}
                          </p>
                        </div>
                        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color} flex items-center gap-1`}>
                          <Icon name={status.icon} size={12} />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </p>
                        <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white p-5 space-y-4 animate-fade-in">
                      {/* Order ID */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Icon name="Hash" size={12} />
                        <span>Order ID: <span className="font-mono font-semibold text-gray-700">{order.orderId || order.id}</span></span>
                      </div>

                      {/* All Items */}
                      {order.items?.length > 0 && (
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                              <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                                {item.productImage ? (
                                  <Image src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Icon name="Package" size={16} className="text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900">{formatPrice(item.total)}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="flex items-start gap-3 text-sm bg-white rounded-xl p-3.5 border border-gray-100">
                          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                            <Icon name="MapPin" size={14} className="text-orange-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs mb-0.5">Shipping Address</p>
                            <p className="text-gray-600 text-xs leading-relaxed">
                              {[order.shippingAddress.name, order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.pincode].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tracking */}
                      {order.trackingNumber && (
                        <div className="flex items-center gap-3 text-sm bg-white rounded-xl p-3.5 border border-gray-100">
                          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                            <Icon name="Truck" size={14} className="text-purple-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs mb-0.5">Tracking Number</p>
                            <p className="text-gray-700 text-xs font-mono">{order.trackingNumber}</p>
                          </div>
                        </div>
                      )}

                      {/* Estimated Delivery */}
                      {order.estimatedDelivery && orderStatusVal !== 'delivered' && orderStatusVal !== 'cancelled' && (
                        <div className="flex items-center gap-3 text-sm bg-white rounded-xl p-3.5 border border-gray-100">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                            <Icon name="Calendar" size={14} className="text-blue-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs mb-0.5">Estimated Delivery</p>
                            <p className="text-gray-600 text-xs">{parseDate(order.estimatedDelivery)}</p>
                          </div>
                        </div>
                      )}

                      {/* Status Timeline */}
                      <div className="flex items-center gap-2 text-xs pt-2">
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, idx, arr) => {
                          const stepOrder = arr.indexOf(orderStatusVal);
                          const isActive = idx <= stepOrder && orderStatusVal !== 'cancelled';
                          const isCurrent = step === orderStatusVal;
                          return (
                            <React.Fragment key={step}>
                              <div className={`flex items-center gap-1 ${isActive ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>
                                <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-orange-500 ring-2 ring-orange-200' : isActive ? 'bg-orange-400' : 'bg-gray-300'}`} />
                                <span className="hidden sm:inline capitalize">{step}</span>
                              </div>
                              {idx < arr.length - 1 && (
                                <div className={`flex-1 h-0.5 rounded ${idx < stepOrder && orderStatusVal !== 'cancelled' ? 'bg-orange-400' : 'bg-gray-200'}`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        {canCancel && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancel(order.id); }}
                            disabled={cancellingId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {cancellingId === order.id ? (
                              <Icon name="Loader" size={14} className="animate-spin" />
                            ) : (
                              <Icon name="XCircle" size={14} />
                            )}
                            Cancel Order
                          </button>
                        )}
                        {canReview && order.items?.map((item) => (
                          <button
                            key={item.productId}
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewingOrder({ orderId: order.id, productId: item.productId, productName: item.productName });
                              setReviewForm({ rating: 5, comment: '' });
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
                          >
                            <Icon name="Star" size={14} />
                            Review {order.items.length > 1 ? item.productName : ''}
                          </button>
                        ))}
                        {item?.productId && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/shop/product/${item.productId}`); }}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors ml-auto"
                          >
                            <Icon name="Eye" size={14} />
                            View Product
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
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
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200/50'
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
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setReviewingOrder(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-heading">Leave a Review</h3>
            <p className="text-sm text-gray-500 mb-5">for {reviewingOrder.productName}</p>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Icon
                    name="Star"
                    size={28}
                    className={star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-gray-600">{reviewForm.rating}/5</span>
            </div>

            {/* Comment */}
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience with this product..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all resize-none"
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setReviewingOrder(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitReview(reviewingOrder.orderId, reviewingOrder.productId)}
                disabled={submittingReview}
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {submittingReview ? (
                  <><Icon name="Loader" size={14} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Icon name="Send" size={14} /> Submit Review</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
