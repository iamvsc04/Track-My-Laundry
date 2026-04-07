const mongoose = require("mongoose");

// Cached connection across hot reloads / serverless invocations.
// eslint-disable-next-line no-underscore-dangle
const cached = global.__mongooseCache || (global.__mongooseCache = { conn: null, promise: null });

const connectDb = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      // Keep options minimal; mongoose v8 ignores deprecated ones.
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDb;

