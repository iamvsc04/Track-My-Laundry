const app = require("../app");
const connectDb = require("../config/db");

// Vercel Serverless Function entrypoint
module.exports = async (req, res) => {
  try {
    await connectDb();
    return app(req, res);
  } catch (error) {
    console.error("API handler error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

