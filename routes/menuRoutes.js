const express = require('express');
const menuController = require('../controllers/menuController');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', menuController.getAllMenuItems);
router.get('/category/:category', menuController.getItemsByCategory
);
router.get('/:id', menuController.getMenuItem);

// Protected routes (admin only)
router.use(protect, restrictTo('admin'));

router.post('/', menuController.createMenuItem);
router.patch('/:id', menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;