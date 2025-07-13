const { validationResult } = require('express-validator');
const Laundry = require('../models/Laundry');
const { sendNotification } = require('../utils/notifications');

// @desc    Create new laundry
// @route   POST /api/laundry
// @access  Private
exports.createLaundry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const laundry = await Laundry.create({
      ...req.body,
      user: req.user.id
    });

    // Send notification to user
    await sendNotification(req.user.fcmToken, {
      title: 'Laundry Drop-off Confirmed',
      body: `Your laundry has been received. Tracking number: ${laundry.trackingNumber}`
    });

    res.status(201).json({
      success: true,
      data: laundry
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single laundry
// @route   GET /api/laundry/:id
// @access  Private
exports.getLaundry = async (req, res) => {
  try {
    const laundry = await Laundry.findById(req.params.id);

    if (!laundry) {
      return res.status(404).json({
        success: false,
        message: 'Laundry not found'
      });
    }

    // Make sure user is laundry owner or admin
    if (laundry.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this laundry'
      });
    }

    res.status(200).json({
      success: true,
      data: laundry
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update laundry status
// @route   PUT /api/laundry/:id/status
// @access  Private/Admin
exports.updateLaundryStatus = async (req, res) => {
  try {
    const laundry = await Laundry.findById(req.params.id);

    if (!laundry) {
      return res.status(404).json({
        success: false,
        message: 'Laundry not found'
      });
    }

    const { status, shelfLocation } = req.body;

    // Update status and shelf location
    laundry.status = status;
    if (shelfLocation) {
      laundry.shelfLocation = shelfLocation;
    }

    await laundry.save();

    // Send notification to user
    await sendNotification(laundry.user.fcmToken, {
      title: 'Laundry Status Updated',
      body: `Your laundry status has been updated to: ${status}`
    });

    res.status(200).json({
      success: true,
      data: laundry
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get laundry history
// @route   GET /api/laundry/history
// @access  Private
exports.getLaundryHistory = async (req, res) => {
  try {
    const laundry = await Laundry.find({ user: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: laundry.length,
      data: laundry
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get laundry by tracking number
// @route   GET /api/laundry/tracking/:trackingNumber
// @access  Public
exports.getLaundryByTrackingNumber = async (req, res) => {
  try {
    const laundry = await Laundry.findOne({
      trackingNumber: req.params.trackingNumber
    });

    if (!laundry) {
      return res.status(404).json({
        success: false,
        message: 'Laundry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: laundry
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 