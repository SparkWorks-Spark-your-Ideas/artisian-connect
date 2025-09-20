import { Router } from 'express';
import { db } from '../config/firebase.js';
import { verifyToken, verifyArtisan } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * POST /api/orders/create
 * Create a new order
 */
router.post('/create', 
  verifyToken,
  validate(schemas.orderCreation),
  asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate products and calculate totals
    let totalAmount = 0;
    const orderItems = [];
    const artisanIds = new Set();

    for (const item of items) {
      const productDoc = await db.collection('products').doc(item.productId).get();
      
      if (!productDoc.exists) {
        return res.status(400).json({
          error: 'Product Not Found',
          message: `Product ${item.productId} not found`
        });
      }

      const productData = productDoc.data();
      
      if (!productData.isActive) {
        return res.status(400).json({
          error: 'Product Unavailable',
          message: `Product ${productData.name} is no longer available`
        });
      }

      if (productData.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: 'Insufficient Stock',
          message: `Only ${productData.stockQuantity} units available for ${productData.name}`
        });
      }

      const itemTotal = productData.price * item.quantity;
      totalAmount += itemTotal;
      artisanIds.add(productData.artisanId);

      orderItems.push({
        productId: item.productId,
        productName: productData.name,
        artisanId: productData.artisanId,
        artisanName: productData.artisanName,
        price: productData.price,
        quantity: item.quantity,
        total: itemTotal,
        customizations: item.customizations || {},
        productImage: productData.thumbnailUrl
      });
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order document
    const orderData = {
      orderId,
      customerId: req.user.uid,
      customerName: `${req.user.firstName} ${req.user.lastName}`,
      customerEmail: req.user.email,
      items: orderItems,
      totalAmount,
      currency: 'INR',
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      notes: notes || '',
      artisanIds: Array.from(artisanIds),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      trackingNumber: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create order and update stock quantities in a batch
    const batch = db.batch();
    
    const orderRef = db.collection('orders').doc();
    batch.set(orderRef, orderData);

    // Update product stock quantities
    for (const item of items) {
      const productRef = db.collection('products').doc(item.productId);
      batch.update(productRef, {
        stockQuantity: db.FieldValue.increment(-item.quantity),
        salesCount: db.FieldValue.increment(item.quantity),
        updatedAt: new Date()
      });
    }

    await batch.commit();

    // Send notifications to artisans
    for (const artisanId of artisanIds) {
      const notificationData = {
        userId: artisanId,
        type: 'new_order',
        title: 'New Order Received',
        message: `You have received a new order ${orderId}`,
        data: {
          orderId: orderRef.id,
          orderNumber: orderId,
          customerId: req.user.uid,
          totalAmount
        },
        isRead: false,
        createdAt: new Date()
      };
      
      await db.collection('notifications').add(notificationData);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: orderRef.id,
        orderNumber: orderId,
        order: {
          id: orderRef.id,
          ...orderData
        }
      }
    });
  })
);

/**
 * GET /api/orders/list
 * Get user's orders (customers see their orders, artisans see orders for their products)
 */
router.get('/list', 
  verifyToken,
  validate(schemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = db.collection('orders');

    // Filter based on user type
    if (req.user.userType === 'artisan') {
      query = query.where('artisanIds', 'array-contains', req.user.uid);
    } else {
      query = query.where('customerId', '==', req.user.uid);
    }

    // Filter by status if provided
    if (status) {
      query = query.where('orderStatus', '==', status);
    }

    // Apply sorting and pagination
    query = query
      .orderBy(sortBy, sortOrder)
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));

    const ordersSnapshot = await query.get();
    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // For artisans, filter items to show only their products
    if (req.user.userType === 'artisan') {
      orders.forEach(order => {
        order.items = order.items.filter(item => item.artisanId === req.user.uid);
      });
    }

    // Get total count
    let totalQuery = db.collection('orders');
    if (req.user.userType === 'artisan') {
      totalQuery = totalQuery.where('artisanIds', 'array-contains', req.user.uid);
    } else {
      totalQuery = totalQuery.where('customerId', '==', req.user.uid);
    }
    if (status) {
      totalQuery = totalQuery.where('orderStatus', '==', status);
    }
    
    const totalSnapshot = await totalQuery.get();

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalSnapshot.size,
          totalPages: Math.ceil(totalSnapshot.size / parseInt(limit))
        }
      }
    });
  })
);

/**
 * GET /api/orders/:id
 * Get specific order details
 */
router.get('/:id', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const orderDoc = await db.collection('orders').doc(id).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({
        error: 'Order Not Found',
        message: 'Order does not exist'
      });
    }

    const orderData = orderDoc.data();
    
    // Check if user has access to this order
    const hasAccess = orderData.customerId === req.user.uid || 
                     orderData.artisanIds.includes(req.user.uid);
    
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You do not have access to this order'
      });
    }

    // Get customer information for artisans
    let customerInfo = null;
    if (req.user.userType === 'artisan') {
      const customerDoc = await db.collection('users').doc(orderData.customerId).get();
      const customerData = customerDoc.data();
      customerInfo = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        avatarUrl: customerData.avatarUrl
      };
    }

    // For artisans, filter items to show only their products
    let filteredItems = orderData.items;
    if (req.user.userType === 'artisan') {
      filteredItems = orderData.items.filter(item => item.artisanId === req.user.uid);
    }

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: {
        order: {
          id: orderDoc.id,
          ...orderData,
          items: filteredItems,
          customer: customerInfo
        }
      }
    });
  })
);

/**
 * PATCH /api/orders/:id/status
 * Update order status (artisans only for their items)
 */
router.patch('/:id/status', 
  verifyToken,
  verifyArtisan,
  validate(schemas.orderStatusUpdate),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;
    
    const orderDoc = await db.collection('orders').doc(id).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({
        error: 'Order Not Found',
        message: 'Order does not exist'
      });
    }

    const orderData = orderDoc.data();
    
    // Check if artisan has items in this order
    if (!orderData.artisanIds.includes(req.user.uid)) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You do not have access to this order'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[orderData.orderStatus].includes(status)) {
      return res.status(400).json({
        error: 'Invalid Status Transition',
        message: `Cannot change status from ${orderData.orderStatus} to ${status}`
      });
    }

    const updateData = {
      orderStatus: status,
      updatedAt: new Date()
    };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    if (notes) {
      updateData.statusNotes = notes;
    }

    // Add status-specific updates
    if (status === 'confirmed') {
      updateData.confirmedAt = new Date();
    } else if (status === 'shipped') {
      updateData.shippedAt = new Date();
      if (!trackingNumber) {
        return res.status(400).json({
          error: 'Tracking Number Required',
          message: 'Tracking number is required when marking order as shipped'
        });
      }
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
      
      // Update artisan's sales count and revenue
      const artisanItems = orderData.items.filter(item => item.artisanId === req.user.uid);
      const revenue = artisanItems.reduce((sum, item) => sum + item.total, 0);
      
      await db.collection('users').doc(req.user.uid).update({
        'artisanProfile.totalSales': db.FieldValue.increment(1),
        'artisanProfile.totalRevenue': db.FieldValue.increment(revenue),
        updatedAt: new Date()
      });
    }

    await db.collection('orders').doc(id).update(updateData);

    // Send notification to customer
    const notificationData = {
      userId: orderData.customerId,
      type: 'order_update',
      title: 'Order Status Updated',
      message: `Your order ${orderData.orderId} has been ${status}`,
      data: {
        orderId: id,
        orderNumber: orderData.orderId,
        newStatus: status,
        trackingNumber: trackingNumber || null
      },
      isRead: false,
      createdAt: new Date()
    };
    
    await db.collection('notifications').add(notificationData);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: id,
        newStatus: status,
        trackingNumber: trackingNumber || null,
        updated: updateData
      }
    });
  })
);

/**
 * POST /api/orders/:id/cancel
 * Cancel order (customers can cancel pending/confirmed orders)
 */
router.post('/:id/cancel', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    const orderDoc = await db.collection('orders').doc(id).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({
        error: 'Order Not Found',
        message: 'Order does not exist'
      });
    }

    const orderData = orderDoc.data();
    
    // Check if user can cancel this order
    if (orderData.customerId !== req.user.uid) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only cancel your own orders'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(orderData.orderStatus)) {
      return res.status(400).json({
        error: 'Cannot Cancel',
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Cancel order and restore stock
    const batch = db.batch();
    
    batch.update(db.collection('orders').doc(id), {
      orderStatus: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason || 'Cancelled by customer',
      updatedAt: new Date()
    });

    // Restore product stock quantities
    for (const item of orderData.items) {
      const productRef = db.collection('products').doc(item.productId);
      batch.update(productRef, {
        stockQuantity: db.FieldValue.increment(item.quantity),
        salesCount: db.FieldValue.increment(-item.quantity),
        updatedAt: new Date()
      });
    }

    await batch.commit();

    // Notify artisans
    for (const artisanId of orderData.artisanIds) {
      const notificationData = {
        userId: artisanId,
        type: 'order_cancelled',
        title: 'Order Cancelled',
        message: `Order ${orderData.orderId} has been cancelled by the customer`,
        data: {
          orderId: id,
          orderNumber: orderData.orderId,
          customerId: req.user.uid,
          reason: reason || 'No reason provided'
        },
        isRead: false,
        createdAt: new Date()
      };
      
      await db.collection('notifications').add(notificationData);
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        orderId: id,
        orderNumber: orderData.orderId,
        reason: reason || 'Cancelled by customer'
      }
    });
  })
);

/**
 * GET /api/orders/status-options
 * Get available order status options
 */
router.get('/status-options', verifyToken, asyncHandler(async (req, res) => {
  const statusOptions = [
    { value: 'pending', label: 'Pending', description: 'Order placed, awaiting confirmation' },
    { value: 'confirmed', label: 'Confirmed', description: 'Order confirmed by artisan' },
    { value: 'processing', label: 'Processing', description: 'Order is being prepared' },
    { value: 'shipped', label: 'Shipped', description: 'Order has been shipped' },
    { value: 'delivered', label: 'Delivered', description: 'Order has been delivered' },
    { value: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' }
  ];

  res.json({
    success: true,
    message: 'Status options retrieved successfully',
    data: {
      statusOptions
    }
  });
}));

/**
 * POST /api/orders/:id/review
 * Add review for delivered order
 */
router.post('/:id/review', 
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment, productId } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Invalid Rating',
        message: 'Rating must be between 1 and 5'
      });
    }

    const orderDoc = await db.collection('orders').doc(id).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({
        error: 'Order Not Found',
        message: 'Order does not exist'
      });
    }

    const orderData = orderDoc.data();
    
    // Check if user can review this order
    if (orderData.customerId !== req.user.uid) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only review your own orders'
      });
    }

    // Check if order is delivered
    if (orderData.orderStatus !== 'delivered') {
      return res.status(400).json({
        error: 'Order Not Delivered',
        message: 'You can only review delivered orders'
      });
    }

    // Check if productId is in the order
    const orderItem = orderData.items.find(item => item.productId === productId);
    if (!orderItem) {
      return res.status(400).json({
        error: 'Product Not Found',
        message: 'Product not found in this order'
      });
    }

    // Check if review already exists
    const existingReviewSnapshot = await db.collection('reviews')
      .where('orderId', '==', id)
      .where('productId', '==', productId)
      .where('customerId', '==', req.user.uid)
      .get();

    if (!existingReviewSnapshot.empty) {
      return res.status(400).json({
        error: 'Review Exists',
        message: 'You have already reviewed this product'
      });
    }

    // Create review
    const reviewData = {
      orderId: id,
      productId,
      customerId: req.user.uid,
      customerName: `${req.user.firstName} ${req.user.lastName}`,
      artisanId: orderItem.artisanId,
      rating,
      comment: comment || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const reviewRef = await db.collection('reviews').add(reviewData);

    // Update product rating
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();
    const productData = productDoc.data();
    
    const currentRating = productData.rating || 0;
    const currentReviews = productData.reviewsCount || 0;
    const newReviewsCount = currentReviews + 1;
    const newRating = ((currentRating * currentReviews) + rating) / newReviewsCount;

    await productRef.update({
      rating: newRating,
      reviewsCount: newReviewsCount,
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        reviewId: reviewRef.id,
        review: {
          id: reviewRef.id,
          ...reviewData
        }
      }
    });
  })
);

export default router;