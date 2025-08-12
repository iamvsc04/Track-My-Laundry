// Test environment configuration
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/trackmylaundry_test";
process.env.JWT_SECRET = "test_jwt_secret_key_for_testing_only";
process.env.JWT_EXPIRE = "1h";
process.env.PORT = 5001;
process.env.EMAIL_USER = "test@example.com";
process.env.EMAIL_PASS = "test_password";
process.env.EMAIL_FROM = "Test <test@example.com>";
process.env.BCRYPT_ROUNDS = 1; // Faster for testing
process.env.RATE_LIMIT_WINDOW = 15;
process.env.RATE_LIMIT_MAX = 1000;
process.env.NFC_ENABLED = "true";
process.env.NFC_TIMEOUT = 5000;
process.env.FRONTEND_URL = "http://localhost:3000";
