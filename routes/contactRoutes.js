const express = require('express');
const contactController = require('../controllers/contactController');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/', contactController.createContactMessage);

// Protected routes (admin only)
router.use(protect, restrictTo('admin'));

router.get('/', contactController.getAllContactMessages);
router.get('/:id', contactController.getContactMessage);
router.patch('/:id/read', contactController.markAsRead);
router.delete('/:id', contactController.deleteContactMessage);

module.exports = router;