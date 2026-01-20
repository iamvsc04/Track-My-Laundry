const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

// Rate limiting middleware
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: "Too many requests from this IP, please try again later.",
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiter
const apiRateLimiter = createRateLimiter(15 * 60 * 1000, 100);

// Strict rate limiter for auth endpoints
const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5);

// CORS configuration
// Support multiple allowed origins via env FRONTEND_URLS (comma-separated) or FRONTEND_URL
const rawOrigins =
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "https://track-my-laundry.vercel.app";

const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  try {
    const url = new URL(origin);
    const port =
      url.port ||
      (url.protocol === "https:"
        ? "443"
        : url.protocol === "http:"
        ? "80"
        : "");
    const hostWithPort =
      port && !["80", "443"].includes(port)
        ? `${url.hostname}:${port}`
        : url.hostname;
    return `${url.protocol}//${hostWithPort}`;
  } catch {
    return origin.replace(/\/$/, "");
  }
};

const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => normalizeOrigin(o.trim()))
  .filter(Boolean);

const isDev = (process.env.NODE_ENV || "development") !== "production";

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const normalized = normalizeOrigin(origin);

    // Allow matches from allowed list
    if (allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }

    // In development, allow any localhost/loopback port
    if (isDev) {
      try {
        const url = new URL(origin);
        if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) {
          return callback(null, true);
        }
      } catch {}
    }

    console.warn(
      `[CORS] Blocked origin: ${origin} (normalized: ${normalized})`
    );
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  // Omit allowedHeaders so cors reflects Access-Control-Request-Headers automatically
};

// Security headers middleware (CSP adapted to allow API access from allowed origins for connect-src)
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      // Allow same-origin and allowed frontends to connect
      connectSrc: ["'self'", ...allowedOrigins],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: "deny" },
});

// Input validation middleware
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  // Remove potential XSS content
  const sanitize = (obj) => {
    if (typeof obj === "string") {
      return obj.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ""
      );
    }
    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        obj[key] = sanitize(obj[key]);
      });
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

// Request size limiter
const requestSizeLimit = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (
    req.headers["content-length"] &&
    parseInt(req.headers["content-length"]) > maxSize
  ) {
    return res.status(413).json({
      success: false,
      message: "Request entity too large. Maximum size is 10MB.",
    });
  }
  next();
};

// Security middleware stack
const securityMiddleware = [
  securityHeaders,
  requestSizeLimit,
  sanitizeInput,
  apiRateLimiter,
];

// Export individual middlewares
module.exports = {
  securityHeaders,
  apiRateLimiter,
  authRateLimiter,
  corsOptions,
  validateInput,
  sanitizeInput,
  requestSizeLimit,
  securityMiddleware,
};
