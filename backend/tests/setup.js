const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let mongoServer;

// Global test setup
beforeAll(async () => {
  // Use in-memory MongoDB for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to test database
  await mongoose.connect(mongoUri);

  console.log("Connected to test database");
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  await mongoose.disconnect();

  // Stop in-memory MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
  }

  console.log("Disconnected from test database");
});

// Clean up database between tests
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Test utilities
const createTestUser = async (userData = {}) => {
  const User = require("../models/User");

  const defaultUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    phoneNumber: "+1234567890",
    address: "123 Test St",
    role: "customer",
    ...userData,
  };

  const hashedPassword = await bcrypt.hash(defaultUser.password, 1);
  const user = new User({
    ...defaultUser,
    password: hashedPassword,
  });

  const savedUser = await user.save();

  // Generate token for the user
  const token = jwt.sign(
    { id: savedUser._id, email: savedUser.email, role: savedUser.role },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
  );

  return { ...savedUser.toObject(), token };
};

const createTestOrder = async (userId, orderData = {}) => {
  const Order = require("../models/Order");

  const defaultOrder = {
    user: userId,
    customerName: "Test Customer",
    phoneNumber: "+1234567890",
    serviceType: "wash-and-fold",
    items: [
      {
        type: "shirts",
        quantity: 2,
        price: 2.5,
      },
    ],
    totalAmount: 5.0,
    priority: "normal",
    pickupAddress: "123 Test St",
    deliveryAddress: "123 Test St",
    pickupDate: new Date(),
    deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: "pending",
    ...orderData,
  };

  const order = new Order(defaultOrder);
  return await order.save();
};

// Export utilities for use in tests
module.exports = {
  createTestUser,
  createTestOrder,
};
