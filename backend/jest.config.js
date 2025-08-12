module.exports = {
  // Test environment
  testEnvironment: "node",

  // Test file patterns
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],

  // Test coverage
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "models/**/*.js",
    "middlewares/**/*.js",
    "utils/**/*.js",
    "routes/**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Module file extensions
  moduleFileExtensions: ["js", "json"],

  // Transform files
  transform: {},

  // Ignore patterns
  testPathIgnorePatterns: ["/node_modules/", "/coverage/", "/dist/"],

  // Environment variables for tests
  setupFiles: ["<rootDir>/tests/env.js"],
};
