const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app");
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
  await User.deleteMany({});
});

describe("Auth Controller Tests", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phoneNumber: "+1234567890",
        address: "123 Main St",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
      expect(response.body.token).toBeDefined();
    });

    it("should return 400 for duplicate email", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phoneNumber: "+1234567890",
        address: "123 Main St",
      };

      // Register first user
      await request(app).post("/api/auth/register").send(userData).expect(201);

      // Try to register with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    it("should return 400 for invalid user data", async () => {
      const invalidUserData = {
        name: "", // Invalid: empty name
        email: "invalid-email", // Invalid: not a valid email
        password: "123", // Invalid: too short password
        phoneNumber: "invalid-phone", // Invalid: not a valid phone number
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user successfully with valid credentials", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phoneNumber: "+1234567890",
        address: "123 Main St",
      };

      // Register user first
      await request(app).post("/api/auth/register").send(userData);

      // Login with registered user
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
    });

    it("should return 401 for invalid credentials", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phoneNumber: "+1234567890",
        address: "123 Main St",
      };

      // Register user first
      await request(app).post("/api/auth/register").send(userData);

      // Try to login with wrong password
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("GET /api/auth/profile", () => {
    it("should return user profile with valid token", async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user._id).toBe(testUser._id.toString());
      expect(response.body.user.email).toBe(testUser.email);
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/auth/profile").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Access denied. No token provided.");
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("PUT /api/auth/profile", () => {
    it("should update user profile successfully", async () => {
      const testUser = await createTestUser();
      const updateData = {
        name: "Updated Name",
        phoneNumber: "+9876543210",
        address: "456 New St",
      };

      const response = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.phoneNumber).toBe(updateData.phoneNumber);
      expect(response.body.user.address).toBe(updateData.address);
    });

    it("should return 400 for invalid update data", async () => {
      const testUser = await createTestUser();
      const invalidUpdateData = {
        email: "invalid-email", // Invalid: not a valid email
        phoneNumber: "invalid-phone", // Invalid: not a valid phone number
      };

      const response = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});
