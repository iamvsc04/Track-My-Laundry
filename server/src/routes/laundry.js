const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  createLaundry,
  getLaundry,
  updateLaundryStatus,
  getLaundryHistory,
  getLaundryByTrackingNumber
} = require('../controllers/laundry');
const { protect, authorize } = require('../middleware/auth');

// Validation middleware
const laundryValidation = [
  check('items', 'At least one item is required').isArray({ min: 1 }),
  check('items.*.type', 'Item type is required').not().isEmpty(),
  check('items.*.quantity', 'Item quantity is required').isInt({ min: 1 }),
  check('estimatedPickupDate', 'Estimated pickup date is required').isISO8601(),
  check('price', 'Price is required').isFloat({ min: 0 })
];

// Routes
router.post('/', protect, laundryValidation, createLaundry);
router.get('/:id', protect, getLaundry);
router.get('/tracking/:trackingNumber', getLaundryByTrackingNumber);
router.put('/:id/status', protect, authorize('admin'), updateLaundryStatus);
router.get('/history', protect, getLaundryHistory);

module.exports = router; 