import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Avatar,
  IconButton,
  Badge,
  Divider,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Stack,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import {
  Add as AddIcon,
  LocalLaundryService as LaundryIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Nfc as NfcIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  TrendingUp as TrendingIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getOrders,
  getUnreadNotificationCount,
  getOrderAnalytics,
  updateOrderStatus,
  cancelOrder,
  formatCurrency,
  formatDate,
  getTimeAgo,
  getStatusColor,
  getPriorityColor,
} from "../utils/api";
import { toast } from "react-toastify";
import NFCScanner from "../components/NFCScanner";

// Glassmorphic surfaces
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: "rgba(255,255,255,0.12)",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  backdropFilter: "blur(14px) saturate(160%)",
  WebkitBackdropFilter: "blur(14px) saturate(160%)",
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: "rgba(255,255,255,0.16)",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  backdropFilter: "blur(14px) saturate(160%)",
  WebkitBackdropFilter: "blur(14px) saturate(160%)",
}));

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const persistedFilters = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("dashboardFilters") || "null");
    } catch {
      return null;
    }
  }, []);

  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNfcPlacement, setShowNfcPlacement] = useState(false);
  const [nfcScannerOpen, setNfcScannerOpen] = useState(false);

  // New state for enhanced features
  const [analytics, setAnalytics] = useState({});
  const [filters, setFilters] = useState(
    persistedFilters?.filters || {
      status: "all",
      serviceType: "all",
      priority: "all",
    }
  );
  const [sortBy, setSortBy] = useState(persistedFilters?.sortBy || "createdAt");
  const [sortOrder, setSortOrder] = useState(
    persistedFilters?.sortOrder || "desc"
  );
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
  });
  const [statusUpdateDialog, setStatusUpdateDialog] = useState({
    open: false,
    orderId: null,
    currentStatus: "",
    newStatus: "",
    note: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [navValue, setNavValue] = useState(0);

  useEffect(() => {
    localStorage.setItem(
      "dashboardFilters",
      JSON.stringify({ filters, sortBy, sortOrder })
    );
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchOrders();
    fetchUnreadCount();
    fetchAnalytics();
  }, [filters, sortBy, sortOrder, pagination.currentPage]);

  // Auto refresh every 60 seconds
  useEffect(() => {
    const id = setInterval(() => {
      fetchOrders(false);
    }, 60000);
    return () => clearInterval(id);
  }, [filters, sortBy, sortOrder, pagination.currentPage]);

  const fetchOrders = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const params = {
        status: filters.status !== "all" ? filters.status : undefined,
        serviceType:
          filters.serviceType !== "all" ? filters.serviceType : undefined,
        priority: filters.priority !== "all" ? filters.priority : undefined,
        sortBy,
        sortOrder,
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      const response = await getOrders(params);
      setOrders(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await getOrderAnalytics("30");
      setAnalytics(response.data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFilters((prev) => ({
      ...prev,
      status: newValue === 0 ? "all" : getStatusForTab(newValue),
    }));
    setPagination((p) => ({ ...p, currentPage: 1 }));
  };

  const getStatusForTab = (tabIndex) => {
    switch (tabIndex) {
      case 1:
        return "active"; // Pending, Confirmed, Picked Up, Washing, Ironing
      case 2:
        return "in_progress"; // Washing, Ironing
      case 3:
        return "ready"; // Ready for Pickup, Out for Delivery
      case 4:
        return "completed"; // Delivered
      default:
        return "all";
    }
  };

  const handleCreateOrder = () => {
    navigate("/create-order");
  };

  const handleViewOrder = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleNfcPlacement = () => {
    setShowNfcPlacement(true);
    setTimeout(() => setShowNfcPlacement(false), 3000);
  };

  const handleNfcScannerOpen = () => {
    setNfcScannerOpen(true);
  };

  const handleOrderUpdate = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handleStatusChange = (orderId, newStatus, note) => {
    handleOrderUpdate(orderId, newStatus);
    setNfcScannerOpen(false);
  };

  const handleStatusUpdate = async () => {
    try {
      const { orderId, newStatus, note } = statusUpdateDialog;
      await updateOrderStatus(orderId, { status: newStatus, note });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success("Order status updated successfully");
      setStatusUpdateDialog({
        open: false,
        orderId: null,
        currentStatus: "",
        newStatus: "",
        note: "",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId, "Cancelled by user");
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const filteredBySearch = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((o) => {
      const orderNumber = String(o.orderNumber || "").toLowerCase();
      const serviceType = String(o.serviceType || "").toLowerCase();
      const status = String(o.status || "").toLowerCase();
      return (
        orderNumber.includes(term) ||
        serviceType.includes(term) ||
        status.includes(term)
      );
    });
  }, [orders, searchTerm]);

  const getFilteredOrders = () => {
    const source = filteredBySearch;
    if (activeTab === 0) return source; // All orders
    if (activeTab === 1)
      return source.filter((order) =>
        ["Pending", "Confirmed", "Picked Up", "Washing", "Ironing"].includes(
          order.status
        )
      );
    if (activeTab === 2)
      return source.filter((order) => order.status === "Ready for Pickup");
    if (activeTab === 3)
      return source.filter((order) => order.status === "Delivered");
    return source;
  };

  const getStatusProgress = (status) => {
    const statusOrder = [
      "Pending",
      "Confirmed",
      "Picked Up",
      "Washing",
      "Ironing",
      "Ready for Pickup",
      "Out for Delivery",
      "Delivered",
    ];
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const renderOrderCard = (order) => (
    <motion.div
      key={order._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard
        sx={{
          mb: 2,
          cursor: "pointer",
          border: order.isUrgent
            ? "2px solid #f44336"
            : "1px solid rgba(255,255,255,0.25)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: 6,
            transition: "all 0.3s ease",
          },
        }}
        onClick={() => handleViewOrder(order._id)}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobile ? "center" : "flex-start",
              gap: 1,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                #{order.orderNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.serviceType}
              </Typography>
              {order.isUrgent && (
                <Chip
                  label="URGENT"
                  color="error"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Chip
                icon={getStatusIcon(order.status)}
                label={order.status}
                color={getStatusColor(order.status)}
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Chip
                label={order.priority}
                color={getPriorityColor(order.priority)}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Items:{" "}
              {order.items
                .map((item) => `${item.quantity}x ${item.type}`)
                .join(", ")}
            </Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(order.total)}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <LocationIcon
                  sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                />
                <Typography variant="caption" color="text.secondary">
                  Pickup: {formatDate(order.pickup.date)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {order.pickup.timeSlot}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <CheckIcon
                  sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                />
                <Typography variant="caption" color="text.secondary">
                  Delivery: {formatDate(order.delivery.date)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {order.delivery.timeSlot}
              </Typography>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Box sx={{ width: "100%", mb: 1 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(getStatusProgress(order.status))}%
              </Typography>
            </Box>
            <Box
              sx={{
                width: "100%",
                height: 4,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${getStatusProgress(order.status)}%`,
                  height: "100%",
                  backgroundColor: "primary.main",
                  transition: "width 0.5s ease",
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Created: {getTimeAgo(order.createdAt)}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ViewIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewOrder(order._id);
                }}
              >
                View
              </Button>
              {["Pending", "Confirmed"].includes(order.status) && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelOrder(order._id);
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </GlassCard>
    </motion.div>
  );

  const renderEmptyState = () => (
    <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
      <LaundryIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
      <Typography variant="h6" gutterBottom>
        No orders found
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        {activeTab === 0
          ? "You haven't placed any orders yet. Start by creating your first order!"
          : activeTab === 1
          ? "No active orders at the moment."
          : activeTab === 2
          ? "No orders are ready for pickup."
          : "No completed orders yet."}
      </Typography>
      {activeTab === 0 && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOrder}
          size="large"
        >
          Create Your First Order
        </Button>
      )}
    </Box>
  );

  const getStatusIcon = (status) => {
    const statusIcons = {
      Pending: <ScheduleIcon />,
      Confirmed: <CheckIcon />,
      "Picked Up": <LocationIcon />,
      Washing: <LaundryIcon />,
      Ironing: <LaundryIcon />,
      "Ready for Pickup": <CheckIcon />,
      "Out for Delivery": <LocationIcon />,
      Delivered: <CheckIcon />,
      Cancelled: <CancelIcon />,
    };
    return statusIcons[status] || <ScheduleIcon />;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 0% 0%, rgba(102,126,234,0.25), transparent), radial-gradient(1200px 600px at 100% 100%, rgba(118,75,162,0.25), transparent), linear-gradient(180deg, #0f172a, #111827)",
        pb: isMobile ? 9 : 4,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <GlassPaper sx={{ p: isMobile ? 2 : 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  component="h1"
                  sx={{ fontWeight: "bold", color: "#fff" }}
                >
                  Welcome back, {user?.name || "User"}! 👋
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Track your laundry orders and manage your preferences
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  size="small"
                  placeholder="Search orders..."
                  InputProps={{
                    startAdornment: (
                      <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                    ),
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    minWidth: 160,
                    bgcolor: "rgba(255,255,255,0.08)",
                    borderRadius: 2,
                  }}
                />
                <IconButton
                  color="inherit"
                  onClick={() => fetchOrders()}
                  sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
                >
                  <RefreshIcon />
                </IconButton>
                {!isMobile && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateOrder}
                  >
                    Create Order
                  </Button>
                )}
                <IconButton
                  color="inherit"
                  onClick={handleNfcScannerOpen}
                  sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
                >
                  <NfcIcon />
                </IconButton>
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/profile")}
                  sx={{
                    position: "relative",
                    bgcolor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#6b7cff",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/profile")}
                >
                  {user?.name?.charAt(0) || "U"}
                </Avatar>
              </Box>
            </Box>
          </GlassPaper>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <GlassPaper
              sx={{
                p: 2,
                textAlign: "center",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={() => setActiveTab(0)}
            >
              <LaundryIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {analytics.totalOrders || 0}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.8)">
                Total Orders
              </Typography>
            </GlassPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <GlassPaper
              sx={{
                p: 2,
                textAlign: "center",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={() => setActiveTab(1)}
            >
              <ScheduleIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {
                  orders.filter(
                    (o) => o.status === "Washing" || o.status === "Ironing"
                  ).length
                }
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.8)">
                In Progress
              </Typography>
            </GlassPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <GlassPaper
              sx={{
                p: 2,
                textAlign: "center",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={() => setActiveTab(2)}
            >
              <CheckIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {
                  orders.filter(
                    (o) =>
                      o.status === "Ready for Pickup" ||
                      o.status === "Out for Delivery"
                  ).length
                }
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.8)">
                Ready
              </Typography>
            </GlassPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <GlassPaper
              sx={{
                p: 2,
                textAlign: "center",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={() => setActiveTab(3)}
            >
              <TrendingIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {formatCurrency(analytics.totalSpent || 0)}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.8)">
                Total Spent
              </Typography>
            </GlassPaper>
          </Grid>
        </Grid>

        {/* Filters and Sorting */}
        <GlassPaper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Picked Up">Picked Up</MenuItem>
                  <MenuItem value="Washing">Washing</MenuItem>
                  <MenuItem value="Ironing">Ironing</MenuItem>
                  <MenuItem value="Ready for Pickup">Ready for Pickup</MenuItem>
                  <MenuItem value="Out for Delivery">Out for Delivery</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Service Type</InputLabel>
                <Select
                  value={filters.serviceType}
                  label="Service Type"
                  onChange={(e) =>
                    handleFilterChange("serviceType", e.target.value)
                  }
                >
                  <MenuItem value="all">All Services</MenuItem>
                  <MenuItem value="Wash & Fold">Wash & Fold</MenuItem>
                  <MenuItem value="Dry Clean">Dry Clean</MenuItem>
                  <MenuItem value="Iron Only">Iron Only</MenuItem>
                  <MenuItem value="Premium Wash">Premium Wash</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Normal">Normal</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SortIcon />}
                  onClick={() => handleSortChange("createdAt")}
                  size="small"
                >
                  Date{" "}
                  {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SortIcon />}
                  onClick={() => handleSortChange("total")}
                  size="small"
                >
                  Amount{" "}
                  {sortBy === "total" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </GlassPaper>

        {/* NFC Bag Placement Section */}
        <GlassPaper sx={{ p: 2, mb: 3, color: "#fff" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 0.5, fontWeight: "bold" }}
              >
                🧳 NFC Bag Placement
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Place your laundry bag near an NFC reader to automatically track
                your order status
              </Typography>
            </Box>
            <Button
              variant="outlined"
              sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.8)" }}
              onClick={handleNfcPlacement}
            >
              Simulate Placement
            </Button>
          </Box>
        </GlassPaper>

        {/* Orders Section */}
        <GlassPaper sx={{ p: 2 }}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "rgba(255,255,255,0.2)",
              mb: 2,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="order tabs"
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
            >
              <Tab label="All Orders" />
              <Tab label="Active" />
              <Tab label="In Progress" />
              <Tab label="Ready" />
              <Tab label="Completed" />
            </Tabs>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <AnimatePresence mode="wait">
              {getFilteredOrders().length > 0 ? (
                <Box>
                  {getFilteredOrders().map(renderOrderCard)}
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                    >
                      <Pagination
                        count={pagination.totalPages}
                        page={pagination.currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {renderEmptyState()}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </GlassPaper>

        {/* NFC Placement Alert */}
        <AnimatePresence>
          {showNfcPlacement && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity="success"
                sx={{ mt: 2 }}
                onClose={() => setShowNfcPlacement(false)}
              >
                🎉 NFC tag detected! Your order has been linked successfully.
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NFC Scanner Dialog */}
        <Dialog
          open={nfcScannerOpen}
          onClose={() => setNfcScannerOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <NfcIcon color="primary" />
              NFC Scanner
            </Box>
          </DialogTitle>
          <DialogContent>
            <NFCScanner
              onOrderUpdate={handleOrderUpdate}
              onStatusChange={handleStatusChange}
            />
          </DialogContent>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog
          open={statusUpdateDialog.open}
          onClose={() =>
            setStatusUpdateDialog({
              open: false,
              orderId: null,
              currentStatus: "",
              newStatus: "",
              note: "",
            })
          }
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={statusUpdateDialog.newStatus}
                  label="New Status"
                  onChange={(e) =>
                    setStatusUpdateDialog((prev) => ({
                      ...prev,
                      newStatus: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Picked Up">Picked Up</MenuItem>
                  <MenuItem value="Washing">Washing</MenuItem>
                  <MenuItem value="Ironing">Ironing</MenuItem>
                  <MenuItem value="Ready for Pickup">Ready for Pickup</MenuItem>
                  <MenuItem value="Out for Delivery">Out for Delivery</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Note (Optional)"
                multiline
                rows={3}
                value={statusUpdateDialog.note}
                onChange={(e) =>
                  setStatusUpdateDialog((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }))
                }
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  onClick={() =>
                    setStatusUpdateDialog({
                      open: false,
                      orderId: null,
                      currentStatus: "",
                      newStatus: "",
                      note: "",
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleStatusUpdate}
                  disabled={!statusUpdateDialog.newStatus}
                >
                  Update Status
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Floating Action Button (desktop) */}
        {!isMobile && (
          <Fab
            color="primary"
            aria-label="create order"
            sx={{ position: "fixed", bottom: 24, right: 24 }}
            onClick={handleCreateOrder}
          >
            <AddIcon />
          </Fab>
        )}
      </Container>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <Paper
          sx={{ position: "fixed", left: 0, right: 0, bottom: 0 }}
          elevation={8}
        >
          <BottomNavigation
            showLabels
            value={navValue}
            onChange={(e, v) => setNavValue(v)}
          >
            <BottomNavigationAction
              label="Home"
              icon={<DashboardIcon />}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
            <BottomNavigationAction
              label="Create"
              icon={<AddIcon />}
              onClick={handleCreateOrder}
            />
            <BottomNavigationAction
              label="NFC"
              icon={<NfcIcon />}
              onClick={handleNfcScannerOpen}
            />
            <BottomNavigationAction
              label="Profile"
              icon={<PersonIcon />}
              onClick={() => navigate("/profile")}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
