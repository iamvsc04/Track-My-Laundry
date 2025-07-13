const NFC = require('node-nfc');
const Laundry = require('../models/Laundry');
const { sendNotifications } = require('../utils/notifications');

// Initialize NFC reader
const nfc = new NFC();

// Map of NFC tag IDs to laundry status updates
const statusMap = {
  'WASH_START': 'washing',
  'WASH_COMPLETE': 'washed',
  'IRON_START': 'ironing',
  'IRON_COMPLETE': 'ready_for_pickup',
  'PICKUP': 'picked_up'
};

// Handle NFC tag detection
nfc.on('tag', async (tag) => {
  try {
    const tagId = tag.uid;
    const action = tag.data.toString(); // Assuming tag data contains the action

    // Find laundry with matching NFC tag ID
    const laundry = await Laundry.findOne({ nfcTagId: tagId });

    if (!laundry) {
      console.error(`No laundry found for NFC tag: ${tagId}`);
      return;
    }

    // Update laundry status based on NFC action
    const newStatus = statusMap[action];
    if (!newStatus) {
      console.error(`Invalid NFC action: ${action}`);
      return;
    }

    // Update laundry status
    laundry.status = newStatus;
    await laundry.save();

    // Send notifications
    await sendNotifications(laundry.user, {
      title: 'Laundry Status Updated',
      body: `Your laundry status has been updated to: ${newStatus}`
    });

    console.log(`Updated laundry ${laundry.trackingNumber} status to ${newStatus}`);
  } catch (error) {
    console.error('Error processing NFC tag:', error);
  }
});

// Handle NFC reader errors
nfc.on('error', (error) => {
  console.error('NFC reader error:', error);
});

// Start NFC reader
exports.startNFCReader = () => {
  try {
    nfc.start();
    console.log('NFC reader started');
  } catch (error) {
    console.error('Error starting NFC reader:', error);
  }
};

// Stop NFC reader
exports.stopNFCReader = () => {
  try {
    nfc.stop();
    console.log('NFC reader stopped');
  } catch (error) {
    console.error('Error stopping NFC reader:', error);
  }
}; 