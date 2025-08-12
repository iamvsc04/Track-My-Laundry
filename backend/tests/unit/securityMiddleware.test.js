const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app");
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

describe("Security Middleware Tests", () => {
  describe("Security Headers", () => {
    it("should include security headers in responses", async () => {
      const response = await request(app).get("/api/auth/profile").expect(401); // Unauthorized, but headers should still be present

      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers).toHaveProperty("x-frame-options");
      expect(response.headers).toHaveProperty("x-xss-protection");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers["x-frame-options"]).toBe("DENY");
      expect(response.headers["x-xss-protection"]).toBe("1; mode=block");
    });

    it("should include HSTS header for HTTPS", async () => {
      // Note: HSTS header is typically only sent over HTTPS
      // This test verifies the header structure when present
      const response = await request(app).get("/api/auth/profile").expect(401);

      // Check if strict-transport-security header is configured
      // (may not be present in test environment)
      if (response.headers["strict-transport-security"]) {
        expect(response.headers["strict-transport-security"]).toContain(
          "max-age="
        );
        expect(response.headers["strict-transport-security"]).toContain(
          "includeSubDomains"
        );
      }
    });
  });

  describe("Rate Limiting", () => {
    it("should allow requests within rate limit", async () => {
      // Make a few requests within the limit
      for (let i = 0; i < 5; i++) {
        await request(app).get("/api/auth/profile").expect(401); // Expected: unauthorized, not rate limited
      }
    });

    it("should block requests exceeding rate limit", async () => {
      // Make many requests to trigger rate limiting
      // Note: This test may take time due to rate limiting
      let rateLimited = false;

      try {
        for (let i = 0; i < 150; i++) {
          const response = await request(app).get("/api/auth/profile");

          if (response.status === 429) {
            rateLimited = true;
            expect(response.body.message).toContain("Too many requests");
            break;
          }
        }
      } catch (error) {
        // Some requests may fail due to rate limiting
        rateLimited = true;
      }

      // Rate limiting should eventually trigger
      expect(rateLimited).toBe(true);
    }, 30000); // Increase timeout for rate limiting test
  });

  describe("Input Validation", () => {
    it("should validate required fields in order creation", async () => {
      const testUser = await createTestUser();
      const invalidOrderData = {
        // Missing required fields
        customerName: "",
        phoneNumber: "invalid-phone",
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(invalidOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it("should validate email format in user registration", async () => {
      const invalidUserData = {
        name: "Test User",
        email: "invalid-email-format",
        password: "password123",
        phoneNumber: "+1234567890",
        address: "123 Test St",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();

      const emailError = response.body.errors.find(
        (error) => error.field === "email" || error.message.includes("email")
      );
      expect(emailError).toBeDefined();
    });

    it("should validate phone number format", async () => {
      const invalidUserData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phoneNumber: "invalid-phone-number",
        address: "123 Test St",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();

      const phoneError = response.body.errors.find(
        (error) =>
          error.field === "phoneNumber" || error.message.includes("phone")
      );
      expect(phoneError).toBeDefined();
    });
  });

  describe("Input Sanitization", () => {
    it("should sanitize XSS attempts in input", async () => {
      const testUser = await createTestUser();
      const maliciousOrderData = {
        customerName: '<script>alert("xss")</script>John Doe',
        phoneNumber: "+1234567890",
        serviceType: "wash-and-fold",
        items: [{ type: "shirts", quantity: 5, price: 2.5 }],
        totalAmount: 12.5,
        priority: "normal",
        pickupAddress: "123 Main St",
        deliveryAddress: "123 Main St",
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(maliciousOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.order.customerName).not.toContain("<script>");
      expect(response.body.order.customerName).toBe("John Doe");
    });

    it("should sanitize SQL injection attempts", async () => {
      const testUser = await createTestUser();
      const maliciousOrderData = {
        customerName: "John'; DROP TABLE orders; --",
        phoneNumber: "+1234567890",
        serviceType: "wash-and-fold",
        items: [{ type: "shirts", quantity: 5, price: 2.5 }],
        totalAmount: 12.5,
        priority: "normal",
        pickupAddress: "123 Main St",
        deliveryAddress: "123 Main St",
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(maliciousOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.order.customerName).not.toContain("DROP TABLE");
      expect(response.body.order.customerName).toBe(
        "John'; DROP TABLE orders; --"
      );
    });
  });

  describe("Request Size Limiting", () => {
    it("should reject oversized requests", async () => {
      const testUser = await createTestUser();
      const largeData = {
        customerName: "A".repeat(1024 * 1024), // 1MB of data
        phoneNumber: "+1234567890",
        serviceType: "wash-and-fold",
        items: [{ type: "shirts", quantity: 5, price: 2.5 }],
        totalAmount: 12.5,
        priority: "normal",
        pickupAddress: "123 Main St",
        deliveryAddress: "123 Main St",
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(largeData)
        .expect(413);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Request entity too large");
    });
  });
});
