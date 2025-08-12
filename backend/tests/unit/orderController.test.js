const request = require("supertest");
const app = require("../../app");
const Order = require("../../models/Order");
const User = require("../../models/User");
const { createTestUser, createTestOrder } = require("../setup");

describe("Order Controller Tests", () => {
  describe("POST /api/orders", () => {
    it("should create a new order successfully", async () => {
      const testUser = await createTestUser();
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

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.order).toBeDefined();
      expect(response.body.order.customerName).toBe(orderData.customerName);
      expect(response.body.order.status).toBe("pending");
    });

    it("should return 400 for invalid order data", async () => {
      const testUser = await createTestUser();
      const invalidOrderData = {
        customerName: "", // Invalid: empty name
        phoneNumber: "invalid-phone", // Invalid: not a valid phone number
        serviceType: "invalid-service", // Invalid: not a valid service type
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(invalidOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /api/orders", () => {
    it("should retrieve user orders successfully", async () => {
      const testUser = await createTestUser();
      const testOrder = await createTestOrder(testUser._id);

      const response = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orders).toBeDefined();
      expect(response.body.orders).toHaveLength(1);
      expect(response.body.orders[0]._id).toBe(testOrder._id.toString());
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/orders").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Access denied. No token provided.");
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should retrieve specific order successfully", async () => {
      const testUser = await createTestUser();
      const testOrder = await createTestOrder(testUser._id);

      const response = await request(app)
        .get(`/api/orders/${testOrder._id}`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order).toBeDefined();
      expect(response.body.order._id).toBe(testOrder._id.toString());
    });

    it("should return 404 for non-existent order", async () => {
      const testUser = await createTestUser();
      const fakeOrderId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/orders/${fakeOrderId}`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });
  });

  describe("PUT /api/orders/:id/status", () => {
    it("should update order status successfully", async () => {
      const testUser = await createTestUser();
      const testOrder = await createTestOrder(testUser._id);

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .send({ status: "in-progress" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.status).toBe("in-progress");
      expect(response.body.order.statusLog).toHaveLength(2); // Initial + new status
    });

    it("should return 400 for invalid status", async () => {
      const testUser = await createTestUser();
      const testOrder = await createTestOrder(testUser._id);

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set("Authorization", `Bearer ${testUser.token}`)
        .send({ status: "invalid-status" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid status");
    });
  });
});
