const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');



exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.menuItem');
  res.status(200).json({ success: true, cart });
};

exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!menuItemId || !quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input' 
      });
    }

    // Check if menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    let cart = await Cart.findOne({ user: userId }).populate('items.menuItem');

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ menuItem: menuItemId, quantity }]
      });
    } else {
      const existingItem = cart.items.find(item => 
        item.menuItem._id.toString() === menuItemId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ menuItem: menuItemId, quantity });
      }
      await cart.save();
    }

    // Populate the updated cart before sending response
    const updatedCart = await Cart.findById(cart._id).populate('items.menuItem');

    res.status(200).json({ 
      success: true, 
      cart: updatedCart 
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error" 
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { id: menuItemId } = req.params;

    // Remove the item
    let cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { items: { menuItem: menuItemId } } },
      { new: true }
    ).populate("items.menuItem");

    // If cart is now empty, delete the whole cart
    if (cart && cart.items.length === 0) {
      await Cart.findOneAndDelete({ user: req.user._id });
      return res.status(200).json({ success: true, cart: null });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.clearCart = async (userId) => {
  await Cart.findOneAndDelete({ user: userId });
};
exports.updateCartItemQuantity = async (req, res) => {
  const { quantity } = req.body;
  const menuItemId = req.params.id;

  if (!menuItemId || !quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

  const item = cart.items.find(item => item.menuItem.toString() === menuItemId);

  if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

  item.quantity = quantity;

  await cart.save();

  res.json({ success: true, cart });
};
