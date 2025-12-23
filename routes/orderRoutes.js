const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  deleteOrder
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, createOrder)
  .get(protect, getMyOrders);

router.get('/all', protect, admin, getAllOrders);
router.get('/stats', protect, admin, getOrderStats);

router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, admin, deleteOrder);

router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
