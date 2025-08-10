const Shelf = require("../models/Shelf");
const Order = require("../models/Order");

// Create a new shelf (admin/worker)
exports.createShelf = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    const { code, stage } = req.body;
    const shelf = new Shelf({ code, stage });
    await shelf.save();
    res.status(201).json(shelf);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update shelf (assign/unassign order, change stage)
exports.updateShelf = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    const { code } = req.params;
    const { stage, isOccupied, currentOrder } = req.body;
    const shelf = await Shelf.findOne({ code });
    if (!shelf) return res.status(404).json({ message: "Shelf not found" });
    if (stage) shelf.stage = stage;
    if (typeof isOccupied === "boolean") shelf.isOccupied = isOccupied;
    if (currentOrder !== undefined) shelf.currentOrder = currentOrder;
    await shelf.save();
    res.json(shelf);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all shelves
exports.getAllShelves = async (req, res) => {
  try {
    const shelves = await Shelf.find().populate("currentOrder");
    res.json(shelves);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get shelf by code
exports.getShelfByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const shelf = await Shelf.findOne({ code }).populate("currentOrder");
    if (!shelf) return res.status(404).json({ message: "Shelf not found" });
    res.json(shelf);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
