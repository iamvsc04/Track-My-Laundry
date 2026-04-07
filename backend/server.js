require("dotenv").config();
const app = require("./app");
const connectDb = require("./config/db");

const start = async () => {
  await connectDb();

  // Seed master admin (only for long-running server mode)
  try {
    const { seedMasterAdmin } = require("./controllers/authController");
    await seedMasterAdmin();
  } catch (error) {
    console.warn("Master admin seed skipped/failed:", error?.message || error);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});

