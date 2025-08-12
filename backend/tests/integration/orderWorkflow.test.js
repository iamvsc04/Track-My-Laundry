const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app");
const Order = require("../../models/Order");
const User = require("../../models/User");
const { createTestUser } = require("../setup");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Order.deleteMany({});
  await User.deleteMany({});
});

describe("Order Workflow Integration Tests", () => {
  describe("Complete Order Lifecycle", () => {
    it("should handle complete order workflow from creation to completion", async () => {
      // 1. Register and login user
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phoneNumber: "+1234567890",
        address: "123 Main St",
      };

      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      const { token, user } = registerResponse.body;

      // 2. Create an order
      const orderData = {
        customerName: "John Doe",
        phoneNumber: "+1234567890",
        serviceType: "wash-and-fold",
        items: [
          { type: "shirts", quantity: 5, price: 2.5 },
          { type: "pants", quantity: 3, price: 3.0 },
        ],
        totalAmount: 19.5,
        priority: "normal",
        pickupAddress: "123 Main St",
        deliveryAddress: "123 Main St",
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const createOrderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      const order = createOrderResponse.body.order;
      expect(order.status).toBe("pending");

      // 3. Update order status to in-progress
      const updateStatusResponse = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "in-progress" })
        .expect(200);

      expect(updateStatusResponse.body.order.status).toBe("in-progress");
      expect(updateStatusResponse.body.order.statusLog).toHaveLength(2);

      // 4. Update order status to ready-for-pickup
      const readyResponse = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "ready-for-pickup" })
        .expect(200);

      expect(readyResponse.body.order.status).toBe("ready-for-pickup");

      // 5. Update order status to picked-up
      const pickedUpResponse = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "picked-up" })
        .expect(200);

      expect(pickedUpResponse.body.order.status).toBe("picked-up");

      // 6. Update order status to completed
      const completedResponse = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "completed" })
        .expect(200);

      expect(completedResponse.body.order.status).toBe("completed");

      // 7. Verify final order state
      const finalOrderResponse = await request(app)
        .get(`/api/orders/${order._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const finalOrder = finalOrderResponse.body.order;
      expect(finalOrder.status).toBe("completed");
      expect(finalOrder.statusLog).toHaveLength(5); // pending, in-progress, ready-for-pickup, picked-up, completed
      expect(finalOrder.completionDate).toBeDefined();
    });

    it("should handle order cancellation workflow", async () => {
      // 1. Create user and order
      const testUser = await createTestUser();
      const orderData = {
        customerName: "Jane Doe",
        phoneNumber: "+1234567890",
        serviceType: "dry-clean",
        items: [{ type: "suit", quantity: 1, price: 15.0 }],
        totalAmount: 15.0,
        priority: "normal",
        pickupAddress: "456 Oak St",
        deliveryAddress: "456 Oak St",
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const createOrderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(orderData)
        .expect(201);

      const order = createOrderResponse.body.order;
      expect(order.status).toBe("pending");

      // 2. Cancel the order
      const cancelResponse = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .send({ status: "cancelled" })
        .expect(200);

      expect(cancelResponse.body.order.status).toBe("cancelled");
      expect(cancelResponse.body.order.cancellationDate).toBeDefined();

      // 3. Verify order cannot be updated after cancellation
      const invalidUpdateResponse = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .send({ status: "in-progress" })
        .expect(400);

      expect(invalidUpdateResponse.body.success).toBe(false);
      expect(invalidUpdateResponse.body.message).toContain("cancelled");
    });

    it("should handle priority changes during order processing", async () => {
      // 1. Create user and order
      const testUser = await createTestUser();
      const orderData = {
        customerName: "Bob Smith",
        phoneNumber: "+1234567890",
        serviceType: "wash-and-fold",
        items: [{ type: "shirts", quantity: 3, price: 2.5 }],
        totalAmount: 7.5,
        priority: "normal",
        pickupAddress: "789 Pine St",
        deliveryAddress: "789 Pine St",
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const createOrderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(orderData)
        .expect(201);

      const order = createOrderResponse.body.order;
      expect(order.priority).toBe("normal");

      // 2. Change priority to high
      const priorityResponse = await request(app)
        .put(`/api/orders/${order._id}/priority`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .send({ priority: "high" })
        .expect(200);

      expect(priorityResponse.body.order.priority).toBe("high");

      // 3. Verify priority change is logged
      const updatedOrderResponse = await request(app)
        .get(`/api/orders/${order._id}`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .expect(200);

      const updatedOrder = updatedOrderResponse.body.order;
      expect(updatedOrder.priority).toBe("high");
      expect(updatedOrder.priorityLog).toBeDefined();
      expect(updatedOrder.priorityLog.length).toBeGreaterThan(0);
    });

    it("should handle NFC scanning integration", async () => {
      // 1. Create user and order
      const testUser = await createTestUser();
      const orderData = {
        customerName: "Alice Johnson",
        phoneNumber: "+1234567890",
        serviceType: "wash-and-fold",
        items: [{ type: "dresses", quantity: 2, price: 4.0 }],
        totalAmount: 8.0,
        priority: "normal",
        pickupAddress: "321 Elm St",
        deliveryAddress: "321 Elm St",
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const createOrderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(orderData)
        .expect(201);

      const order = createOrderResponse.body.order;

      // 2. Simulate NFC scan for order pickup
      const nfcData = {
        orderId: order._id,
        action: "pickup",
        timestamp: new Date(),
        location: "Main Facility",
      };

      const nfcResponse = await request(app)
        .post(`/api/orders/${order._id}/nfc-scan`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(nfcData)
        .expect(200);

      expect(nfcResponse.body.success).toBe(true);
      expect(nfcResponse.body.order.nfcScans).toBeDefined();
      expect(nfcResponse.body.order.nfcScans.length).toBe(1);
      expect(nfcResponse.body.order.nfcScans[0].action).toBe("pickup");

      // 3. Simulate NFC scan for order delivery
      const deliveryNfcData = {
        orderId: order._id,
        action: "delivery",
        timestamp: new Date(),
        location: "Customer Address",
      };

      const deliveryNfcResponse = await request(app)
        .post(`/api/orders/${order._id}/nfc-scan`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(deliveryNfcData)
        .expect(200);

      expect(deliveryNfcResponse.body.success).toBe(true);
      expect(deliveryNfcResponse.body.order.nfcScans.length).toBe(2);
      expect(deliveryNfcResponse.body.order.nfcScans[1].action).toBe(
        "delivery"
      );
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle concurrent order updates gracefully", async () => {
      const testUser = await createTestUser();
      const orderData = {
        customerName: "Concurrent User",
        phoneNumber: "+1234567890",
        serviceType: "wash-and-fold",
        items: [{ type: "shirts", quantity: 1, price: 2.5 }],
        totalAmount: 2.5,
        priority: "normal",
        pickupAddress: "123 Test St",
        deliveryAddress: "123 Test St",
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const createOrderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(orderData)
        .expect(201);

      const order = createOrderResponse.body.order;

      // Attempt concurrent status updates
      const updatePromises = [
        request(app)
          .put(`/api/orders/${order._id}/status`)
          .set("Authorization", `Bearer ${testUser.token}`)
          .send({ status: "in-progress" }),
        request(app)
          .put(`/api/orders/${order._id}/status`)
          .set("Authorization", `Bearer ${testUser.token}`)
          .send({ status: "ready-for-pickup" }),
      ];

      const results = await Promise.allSettled(updatePromises);

      // At least one should succeed
      const successfulUpdates = results.filter(
        (result) => result.status === "fulfilled" && result.value.status === 200
      );
      expect(successfulUpdates.length).toBeGreaterThan(0);
    });

    it("should handle invalid order transitions", async () => {
      const testUser = await createTestUser();
      const orderData = {
        customerName: "Invalid Transition User",
        phoneNumber: "+1234567890",
        serviceType: "wash-and-fold",
        items: [{ type: "shirts", quantity: 1, price: 2.5 }],
        totalAmount: 2.5,
        priority: "normal",
        pickupAddress: "123 Test St",
        deliveryAddress: "123 Test St",
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const createOrderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(orderData)
        .expect(201);

      const order = createOrderResponse.body.order;

      // Try to skip from pending directly to completed (invalid transition)
      const invalidTransitionResponse = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .send({ status: "completed" })
        .expect(400);

      expect(invalidTransitionResponse.body.success).toBe(false);
      expect(invalidTransitionResponse.body.message).toContain(
        "Invalid status transition"
      );
    });
  });
});
