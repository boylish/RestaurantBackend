const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// User routes
router.post('/', orderController.createOrder);
router.get('/my-orders',orderController.getMyOrders);
router.get('/:id', orderController.getOrder);

// Admin routes
router.use(restrictTo('admin'));
router.get('/', orderController.getAllOrders);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;