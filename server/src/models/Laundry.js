const mongoose = require('mongoose');

const laundrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nfcTagId: {
    type: String,
    required: true,
    unique: true
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['yet_to_wash', 'washing', 'washed', 'ironing', 'ready_for_pickup', 'picked_up'],
    default: 'yet_to_wash'
  },
  shelfLocation: {
    type: String,
    match: [/^[WIR]_[A-Z][0-9]$/, 'Invalid shelf location format']
  },
  items: [{
    type: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    specialInstructions: String
  }],
  dropOffDate: {
    type: Date,
    default: Date.now
  },
  estimatedPickupDate: {
    type: Date,
    required: true
  },
  actualPickupDate: {
    type: Date
  },
  price: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['yet_to_wash', 'washing', 'washed', 'ironing', 'ready_for_pickup', 'picked_up']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate tracking number before saving
laundrySchema.pre('save', async function(next) {
  if (!this.trackingNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.trackingNumber = `LA${year}${month}${random}`;
  }
  next();
});

// Add status to history when status changes
laundrySchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Laundry', laundrySchema); 