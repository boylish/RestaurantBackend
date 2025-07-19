// controllers/orderController.js
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const sendEmail = require('../utils/sendEmail');
const { clearCart } = require('./cartController');
const cartController = require('./cartController');

exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, phone, paymentMethod } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one item to your order'
      });
    }

    // Get menu items and their prices
    const menuItems = await MenuItem.find({
      _id: { $in: items.map(item => item.menuItem) }
    });

    // Map items with their prices
    const orderItems = items.map(item => {
      const menuItem = menuItems.find(
        mi => mi._id.toString() === item.menuItem.toString()
      );

      if (!menuItem) {
        throw new Error(`Menu item with ID ${item.menuItem} not found`);
      }

      return {
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price
      };
    });

    // Calculate total price
    const totalPrice = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice,
      deliveryAddress,
      phone,
      paymentMethod
    });
    
    // Send email notification to admin
    const message = `New order received!\n\nOrder ID: ${order._id}\nTotal: $${order.totalPrice.toFixed(
      2
    )}\n\nView order details in the admin panel.`;

    try {
      await sendEmail({
        email: process.env.MAIL_FROM,
        subject: 'New Order Received',
        message
      });
    } catch (emailErr) {
      console.error('Error sending email:', emailErr);
    }
    await cartController.clearCart(req.user._id);

    res.status(201).json({
      success: true,
      data: order
    }); 
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate({
      path: 'items.menuItem',
      select: 'name description price imageUrl'
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate({
      path: 'items.menuItem',
      select: 'name description price imageUrl'
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'items.menuItem',
      select: 'name description price imageUrl'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is admin or the order belongs to the user
    if (
      req.user.role !== 'admin' &&
      order.user.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }
    clearCart()

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'items.menuItem',
      select: 'name description price imageUrl'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};