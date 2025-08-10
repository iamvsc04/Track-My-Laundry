const Order = require("../models/Order");

// In-memory NFC tag pool (for demo)
let availableNfcTags = ["NFC001", "NFC002", "NFC003", "NFC004", "NFC005"];

// Create a new order (NFC-triggered)
exports.createOrder = async (req, res) => {
  try {
    const { shelfLocation } = req.body;
    const order = new Order({
      user: req.user.id,
      shelfLocation,
      statusLogs: [{ status: "Yet to Wash" }],
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update order status (admin/worker)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, shelfLocation } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = status;
    if (shelfLocation) order.shelfLocation = shelfLocation;
    order.statusLogs.push({ status });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get orders for logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get order by ID (admin or owner)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create order with NFC tag (NFC invocation)
exports.createOrderWithNfc = async (req, res) => {
  try {
    if (availableNfcTags.length === 0) {
      return res.status(400).json({ message: "No NFC tags available" });
    }
    const nfcTag = availableNfcTags.shift(); // Remove from pool
    const { shelfLocation, status } = req.body;
    const order = new Order({
      user: req.user.id,
      nfcTag,
      shelfLocation,
      status,
      statusLogs: [{ status }],
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mark order as completed and free NFC tag
exports.completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = "Completed";
    order.statusLogs.push({ status: "Completed" });
    await order.save();
    // Free the NFC tag
    if (!availableNfcTags.includes(order.nfcTag)) {
      availableNfcTags.push(order.nfcTag);
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
