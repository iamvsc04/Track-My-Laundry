require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  securityMiddleware,
  corsOptions,
} = require("./middlewares/securityMiddleware");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shelfRoutes = require("./routes/shelfRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(securityMiddleware);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("TrackMyLaundry API is running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shelves", shelfRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/reports", reportRoutes);

app.use(cors(corsOptions));
app.use((err, req, res, next) => {
  console.error("[Error Handler]", err.stack);
  res.status(500).json({
    message: "Something went wrong check your server logs",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
