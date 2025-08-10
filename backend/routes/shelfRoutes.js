const express = require("express");
const router = express.Router();
const shelfController = require("../controllers/shelfController");
const auth = require("../middlewares/authMiddleware");

// All routes protected
router.use(auth);

// Create shelf (admin/worker)
router.post("/", shelfController.createShelf);

// Update shelf (admin/worker)
router.patch("/:code", shelfController.updateShelf);

// Get all shelves
router.get("/", shelfController.getAllShelves);

// Get shelf by code
router.get("/:code", shelfController.getShelfByCode);

module.exports = router;
