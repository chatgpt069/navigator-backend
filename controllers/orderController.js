const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Helper function to validate stock availability before order
const validateStock = async (items) => {
  const stockErrors = [];
  
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      stockErrors.push({ 
        productId: item.product, 
        name: item.name || 'Unknown Product',
        error: 'Product not found' 
      });
      continue;
    }
    
    let availableStock = 0;
    
    // Check size-specific stock
    if (item.size && product.stockBySize && product.stockBySize.has(item.size)) {
      availableStock = product.stockBySize.get(item.size) || 0;
    } else {
      availableStock = product.stock || 0;
    }
    
    if (availableStock < item.quantity) {
      stockErrors.push({
        productId: item.product,
        name: product.name,
        size: item.size,
        requested: item.quantity,
        available: availableStock,
        error: availableStock === 0 
          ? `"${product.name}" (Size: ${item.size}) is out of stock`
          : `Only ${availableStock} unit(s) of "${product.name}" (Size: ${item.size}) available`
      });
    }
  }
  
  return stockErrors;
};

// Helper function to decrease stock when order is placed
const decreaseStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (product) {
      // Decrease size-specific stock
      if (item.size && product.stockBySize && product.stockBySize.has(item.size)) {
        const currentStock = product.stockBySize.get(item.size) || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        product.stockBySize.set(item.size, newStock);
      }
      // Decrease total stock
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }
  }
};

// Helper function to restore stock when order is cancelled
const restoreStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (product) {
      // Restore size-specific stock
      if (item.size && product.stockBySize) {
        const currentStock = product.stockBySize.get(item.size) || 0;
        product.stockBySize.set(item.size, currentStock + item.quantity);
      }
      // Restore total stock
      product.stock = product.stock + item.quantity;
      await product.save();
    }
  }
};

// @desc    Create guest order (no login required)
// @route   POST /api/orders/guest
// @access  Public
const createGuestOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, items, itemsTotal, shippingPrice, taxPrice, totalAmount, guestEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!guestEmail) {
      return res.status(400).json({ message: 'Email is required for guest checkout' });
    }

    // Validate stock availability before creating order
    const stockErrors = await validateStock(items);
    if (stockErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Some items are no longer available in requested quantity',
        stockErrors 
      });
    }

    const order = new Order({
      isGuest: true,
      guestEmail,
      items,
      shippingAddress,
      paymentMethod,
      itemsTotal,
      shippingPrice,
      taxPrice,
      totalAmount,
      // Mock payment - automatically mark as paid for card/upi
      isPaid: paymentMethod !== 'cod',
      paidAt: paymentMethod !== 'cod' ? Date.now() : null,
      paymentResult: paymentMethod !== 'cod' ? {
        id: `MOCK_${Date.now()}`,
        status: 'completed',
        updateTime: new Date().toISOString()
      } : null,
      status: 'confirmed'
    });

    const createdOrder = await order.save();
    
    // Decrease stock after successful order
    await decreaseStock(items);
    
    // Send order confirmation email (non-blocking)
    sendEmail(guestEmail, 'orderConfirmation', {
      name: shippingAddress.fullName || 'Customer',
      order: createdOrder
    }).catch(err => {
      console.error('Failed to send order confirmation email:', err);
    });
    
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get guest order by ID
// @route   GET /api/orders/guest/:id
// @access  Public
const getGuestOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');

    if (order && order.isGuest) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, items, itemsTotal, shippingPrice, taxPrice, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Validate stock availability before creating order
    const stockErrors = await validateStock(items);
    if (stockErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Some items are no longer available in requested quantity',
        stockErrors 
      });
    }

    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsTotal,
      shippingPrice,
      taxPrice,
      totalAmount,
      // Mock payment - automatically mark as paid for card/upi
      isPaid: paymentMethod !== 'cod',
      paidAt: paymentMethod !== 'cod' ? Date.now() : null,
      paymentResult: paymentMethod !== 'cod' ? {
        id: `MOCK_${Date.now()}`,
        status: 'completed',
        updateTime: new Date().toISOString()
      } : null,
      status: 'confirmed'
    });

    const createdOrder = await order.save();

    // Decrease stock after successful order
    await decreaseStock(items);

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], totalAmount: 0 }
    );

    // Send order confirmation email (non-blocking)
    const user = await User.findById(req.user._id);
    if (user && user.email) {
      sendEmail(user.email, 'orderConfirmation', {
        name: user.name,
        order: createdOrder
      }).catch(err => {
        console.error('Failed to send order confirmation email:', err);
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product');

    if (order) {
      // Check if user owns the order or is admin
      if (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
        res.json(order);
      } else {
        res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      const previousStatus = order.status;
      order.status = status;
      
      if (status === 'delivered') {
        order.deliveredAt = Date.now();
      }

      // If COD and delivered, mark as paid
      if (status === 'delivered' && order.paymentMethod === 'cod') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }

      // If cancelled, restore stock
      if (status === 'cancelled' && previousStatus !== 'cancelled') {
        await restoreStock(order.items);
      }

      const updatedOrder = await order.save();

      // Send status update emails (non-blocking)
      const recipientEmail = order.isGuest ? order.guestEmail : (order.user && order.user.email);
      const recipientName = order.isGuest ? order.shippingAddress.fullName : (order.user && order.user.name);
      
      if (recipientEmail) {
        if (status === 'shipped') {
          sendEmail(recipientEmail, 'orderShipped', {
            name: recipientName || 'Customer',
            order: updatedOrder
          }).catch(err => {
            console.error('Failed to send shipped email:', err);
          });
        } else if (status === 'delivered') {
          sendEmail(recipientEmail, 'orderDelivered', {
            name: recipientName || 'Customer',
            order: updatedOrder
          }).catch(err => {
            console.error('Failed to send delivered email:', err);
          });
        }
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get order stats (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    
    const revenueResult = await Order.aggregate([
      { $match: { isPaid: true, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      await Order.deleteOne({ _id: req.params.id });
      res.json({ message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOrder,
  createGuestOrder,
  getMyOrders,
  getOrderById,
  getGuestOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  deleteOrder
};
