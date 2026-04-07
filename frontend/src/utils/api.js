import axios from "axios";

export const APP_BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || window.location.origin;

const normalizeApiBaseUrl = (value) => {
  if (!value) return value;
  const trimmed = String(value).replace(/\/+$/, "");
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
};

const configuredApiUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
const isLocalFrontend = ["localhost", "127.0.0.1"].includes(
  window.location.hostname
);
const API_BASE_URL =
  isLocalFrontend &&
  configuredApiUrl?.startsWith("https://track-my-laundry.vercel.app")
    ? "http://localhost:5000/api"
    : configuredApiUrl || "http://localhost:5000/api";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const login = (credentials) => api.post("/auth/login", credentials);
export const register = (userData) => api.post("/auth/register", userData);
export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (userData) => api.put("/auth/profile", userData);
export const changePassword = (passwordData) =>
  api.put("/auth/change-password", passwordData);
export const createAdmin = (adminData) => api.post("/auth/create-admin", adminData);
export const getAllStaff = () => api.get("/auth/staff"); // We'll need a way to list staff/admins
export const getCustomers = () => api.get("/auth/customers");

// Email verification link helpers (no OTP)
export const sendEmailVerificationLink = (email) =>
  api.post("/auth/send-email-otp", { email });
export const verifyEmailViaLink = (email, token) =>
  api.post("/auth/verify-email-otp", { email, token });

// Resend email verification for existing unverified users
export const resendVerificationEmail = (email) =>
  api.post("/auth/resend-verification-email", { email });

// Order API calls
export const createOrder = (orderData) => api.post("/orders", orderData);
export const getOrders = (params = {}) => api.get("/orders", { params });
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);
export const getOrderByNfcTag = (nfcTag) =>
  api.get(`/orders/by-nfc/${encodeURIComponent(nfcTag)}`);
export const updateOrderStatus = (orderId, statusData) =>
  api.patch(`/orders/${orderId}/status`, statusData);
export const updateOrderPriority = (orderId, priorityData) =>
  api.patch(`/orders/${orderId}/priority`, priorityData);
export const cancelOrder = (orderId, reason) =>
  api.patch(`/orders/${orderId}/cancel`, { reason });
export const getOrderAnalytics = (period = "30") =>
  api.get("/orders/analytics", { params: { period } });
export const scanNfcTag = (nfcData) => api.post("/orders/scan-nfc", nfcData);
export const downloadInvoice = (orderId) =>
  api.get(`/orders/${orderId}/invoice`, { responseType: "blob" });

// Payment API calls
export const createPayment = (paymentData) =>
  api.post("/payments", paymentData);
export const getPaymentHistory = () => api.get("/payments");
export const getPaymentById = (paymentId) => api.get(`/payments/${paymentId}`);
export const processPayment = (paymentId, paymentMethod) =>
  api.post(`/payments/${paymentId}/process`, { paymentMethod });

// Notification API calls
export const getNotifications = (params = {}) =>
  api.get("/notifications", { params });
export const markNotificationAsRead = (notificationId) =>
  api.patch(`/notifications/${notificationId}/read`);
export const markAllNotificationsAsRead = () =>
  api.patch("/notifications/read-all");
export const getUnreadNotificationCount = () =>
  api.get("/notifications/unread-count");

// Lightweight in-memory dedupe for the unread count so multiple components
// don't hammer the endpoint at the same time.
let unreadCountCache = {
  ts: 0,
  promise: null,
};

export const getUnreadNotificationCountCached = (ttlMs = 10000) => {
  const now = Date.now();
  if (unreadCountCache.promise && now - unreadCountCache.ts < ttlMs) {
    return unreadCountCache.promise;
  }

  unreadCountCache.ts = now;
  unreadCountCache.promise = getUnreadNotificationCount().finally(() => {
    // Keep the promise for the TTL window; callers will refresh after TTL.
  });
  return unreadCountCache.promise;
};
export const deleteNotification = (notificationId) =>
  api.delete(`/notifications/${notificationId}`);
export const updateNotificationPreferences = (preferences) =>
  api.put("/auth/notification-preferences", preferences);

// Shelf API calls
export const getShelves = () => api.get("/shelves");
export const getShelfById = (shelfId) => api.get(`/shelves/${shelfId}`);
export const updateShelfStatus = (shelfId, statusData) =>
  api.patch(`/shelves/${shelfId}/status`, statusData);

// Reward API calls
export const getLoyaltyProfile = () => api.get("/rewards/profile");
export const getRewardsHistory = (params = {}) =>
  api.get("/rewards/history", { params });
export const getRedemptionOptions = () => api.get("/rewards/options");
export const redeemPoints = (data) => api.post("/rewards/redeem", data);
export const getRedemptionHistory = (params = {}) =>
  api.get("/rewards/redemption-history", { params });
export const getLeaderboard = (params = {}) =>
  api.get("/rewards/leaderboard", { params });
export const getAchievementProgress = () => api.get("/rewards/achievements");
export const processReferral = (referralCode) =>
  api.post("/rewards/referral", { referralCode });

// Report API calls
export const generateReport = (startDate, endDate) =>
  api.get("/reports/daily", {
    params: { startDate, endDate },
    responseType: "blob",
  });



// Utility functions
export const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTimeAgo = (dateString) => {
  const parsed = new Date(dateString);
  if (!dateString || Number.isNaN(parsed.getTime())) return "-";

  const now = new Date();
  const past = parsed;
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
};

export const getStatusColor = (status) => {
  const statusColors = {
    Pending: "warning",
    Confirmed: "info",
    "Picked Up": "secondary",
    Washing: "primary",
    Ironing: "secondary",
    "Ready for Pickup": "success",
    "Out for Delivery": "info",
    Delivered: "success",
    Cancelled: "error",
  };
  return statusColors[status] || "default";
};

export const getStatusHex = (status, theme) => {
  const color = getStatusColor(status);
  if (color === "default") return theme?.palette?.grey[500] || "#9e9e9e";
  return theme?.palette?.[color]?.main || "#2196f3";
};

export const getPriorityColor = (priority) => {
  const priorityColors = {
    Low: "success",
    Normal: "info",
    High: "warning",
    Urgent: "error",
  };
  return priorityColors[priority] || "default";
};

export default api;
