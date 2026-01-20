import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import {
  AdminPanelSettings as AdminIcon,
  LocalLaundryService as LaundryIcon,
  People as PeopleIcon,
  Assessment as AnalyticsIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  QrCode as QrCodeIcon,
  Nfc as NfcIcon,
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getOrders,
  updateOrderStatus,
  getNotifications,
  getShelves,
  updateShelfStatus,
  generateReport,
} from "../utils/api";
import { toast } from "react-toastify";
import NFCScanner from "../components/NFCScanner";

// Import chart components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const statusColors = {
  Pending: "#ff9800",
  Confirmed: "#2196f3",
  "Picked Up": "#9c27b0",
  Washing: "#00bcd4",
  Ironing: "#ff5722",
  "Ready for Pickup": "#4caf50",
  "Out for Delivery": "#ff9800",
  Delivered: "#4caf50",
  Cancelled: "#f44336",
};

const statusIcons = {
  Pending: <ScheduleIcon />,
  Confirmed: <CheckIcon />,
  "Picked Up": <LocationIcon />,
  Washing: <LaundryIcon />,
  Ironing: <LaundryIcon />,
  "Ready for Pickup": <CheckIcon />,
  "Out for Delivery": <LocationIcon />,
  Delivered: <CheckIcon />,
  Cancelled: <WarningIcon />,
};

export default function AdminPanel() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [nfcScannerOpen, setNfcScannerOpen] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [shelves, setShelves] = useState([]);
  const [shelfDialogOpen, setShelfDialogOpen] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState(null);

  const handleGenerateReport = async () => {
    try {
      const toastId = toast.loading("Generating report...");
      // Calculate start/end based on dateRange state or default
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - (dateRange === '30d' ? 30 : 7)); // Simple logic for now

      const response = await generateReport(start.toISOString(), end.toISOString());
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${new Date().toISOString().slice(0,10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.dismiss(toastId);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Report generation failed:", error);
      toast.error("Failed to generate report");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAnalytics();
    fetchShelves();
  }, [dateRange]);

  const fetchShelves = async () => {
    try {
      const response = await getShelves();
      setShelves(response.data || []);
    } catch (error) {
       console.error("Error fetching shelves:", error);
       // Mock for now if API fails (or while setting up)
       // setShelves([
       //  { code: "A1", isOccupied: false },
       //  { code: "A2", isOccupied: true, currentOrder: { orderNumber: "ORD-123" } }
       // ]);
    }
  };

  const handleShelfClick = (shelf) => {
    setSelectedShelf(shelf);
    setShelfDialogOpen(true);
  };

  const clearShelf = async () => {
     if (!selectedShelf) return;
     try {
       await updateShelfStatus(selectedShelf.code, { isOccupied: false, currentOrder: null });
       toast.success(`Shelf ${selectedShelf.code} cleared`);
       setShelfDialogOpen(false);
       fetchShelves();
     } catch(err) {
       console.error(err);
       toast.error("Failed to update shelf");
     }
  };


  const fetchAnalytics = async () => {
    try {
      // Mock analytics data for now - replace with actual API calls
      const mockAnalyticsData = {
        overview: {
          totalOrders: 156,
          activeOrders: 23,
          completedToday: 8,
          totalRevenue: 45600,
          averageOrderValue: 292,
          customerSatisfaction: 4.7,
        },
        ordersByStatus: [
          { name: 'Pending', value: 12, color: '#ff9800' },
          { name: 'Washing', value: 8, color: '#2196f3' },
          { name: 'Ironing', value: 6, color: '#ff5722' },
          { name: 'Ready', value: 15, color: '#4caf50' },
          { name: 'Delivered', value: 89, color: '#9c27b0' },
        ],
        dailyOrders: [
          { date: '2024-01-08', orders: 12, revenue: 3200 },
          { date: '2024-01-09', orders: 15, revenue: 4100 },
          { date: '2024-01-10', orders: 8, revenue: 2800 },
          { date: '2024-01-11', orders: 18, revenue: 5200 },
          { date: '2024-01-12', orders: 22, revenue: 6100 },
          { date: '2024-01-13', orders: 16, revenue: 4900 },
          { date: '2024-01-14', orders: 19, revenue: 5400 },
        ],
        serviceTypes: [
          { name: 'Wash & Fold', value: 45, color: '#4caf50' },
          { name: 'Dry Clean', value: 28, color: '#2196f3' },
          { name: 'Iron Only', value: 15, color: '#ff9800' },
          { name: 'Premium Wash', value: 12, color: '#9c27b0' },
        ],
        turnaroundTimes: [
          { day: 'Mon', avgHours: 24, target: 24 },
          { day: 'Tue', avgHours: 22, target: 24 },
          { day: 'Wed', avgHours: 26, target: 24 },
          { day: 'Thu', avgHours: 20, target: 24 },
          { day: 'Fri', avgHours: 28, target: 24 },
          { day: 'Sat', avgHours: 18, target: 24 },
          { day: 'Sun', avgHours: 16, target: 24 },
        ],
      };
      setAnalytics(mockAnalyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // For now, use mock data. Replace with actual API call
      // const response = await getOrders(token);
      // setOrders(response.data);
      setOrders(mockOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote("");
    setUpdateDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setUpdating(true);
      // For now, simulate API call. Replace with actual API call
      // await updateOrderStatus(token, selectedOrder._id, { status: newStatus, note: statusNote });

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: newStatus }
            : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);
      setUpdateDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
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

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 0: // All Orders
        return orders;
      case 1: // Pending
        return orders.filter(
          (o) => o.status === "Pending" || o.status === "Confirmed"
        );
      case 2: // In Progress
        return orders.filter(
          (o) =>
            o.status === "Picked Up" ||
            o.status === "Washing" ||
            o.status === "Ironing"
        );
      case 3: // Ready
        return orders.filter(
          (o) =>
            o.status === "Ready for Pickup" || o.status === "Out for Delivery"
        );
      case 4: // Completed
        return orders.filter((o) => o.status === "Delivered");
      default:
        return orders;
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const renderOrderRow = (order) => (
    <TableRow
      key={order._id}
      sx={{ "&:hover": { backgroundColor: "action.hover" } }}
    >
      <TableCell>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {order.orderNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(order.createdAt)}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {order.customerName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {order.customerPhone}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={order.serviceType}
          size="small"
          variant="outlined"
          color="primary"
        />
      </TableCell>
      <TableCell>
        <Chip
          icon={statusIcons[order.status]}
          label={order.status}
          size="small"
          sx={{
            backgroundColor: statusColors[order.status],
            color: "white",
            "& .MuiChip-icon": { color: "white" },
          }}
        />
      </TableCell>
      <TableCell>
        <Typography variant="subtitle2" fontWeight="bold">
          ₹{order.totalAmount}
        </Typography>
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/order/${order._id}`)}
              color="primary"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Update Status">
            <IconButton
              size="small"
              onClick={() => handleStatusUpdate(order)}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={3}>
        <Card
          sx={{
            p: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <TrendingIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
            {orders.length}
          </Typography>
          <Typography variant="body2">Total Orders</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Card
          sx={{
            p: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
          }}
        >
          <CartIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
            ₹{orders.reduce((sum, order) => sum + order.totalAmount, 0)}
          </Typography>
          <Typography variant="body2">Total Revenue</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Card
          sx={{
            p: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            color: "white",
          }}
        >
          <CheckIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
            {orders.filter((o) => o.status === "Delivered").length}
          </Typography>
          <Typography variant="body2">Completed</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Card
          sx={{
            p: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            color: "white",
          }}
        >
          <StarIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
            4.8
          </Typography>
          <Typography variant="body2">Rating</Typography>
        </Card>
      </Grid>
    </Grid>
  );

  const renderStaffManagement = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Staff Members
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: "primary.main" }}>JD</Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="John Doe"
                  secondary="Senior Staff - Washing & Ironing"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: "secondary.main" }}>JS</Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Jane Smith"
                  secondary="Staff - Pickup & Delivery"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Timeline>
              <TimelineItem>
                <TimelineOppositeContent color="text.secondary">
                  10:30 AM
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary" />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="subtitle2">
                    Order LAU12345678 picked up
                  </Typography>
                  <Typography variant="caption">by John Doe</Typography>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineOppositeContent color="text.secondary">
                  09:15 AM
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="secondary" />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="subtitle2">
                    Order LAU87654321 confirmed
                  </Typography>
                  <Typography variant="caption">by system</Typography>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Admin Panel
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage orders, staff, and monitor operations
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<NfcIcon />}
              onClick={handleNfcScannerOpen}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                },
              }}
            >
              NFC Scanner
            </Button>
            <Button
              variant="outlined"
              startIcon={<NotificationsIcon />}
              onClick={() => navigate("/notifications")}
            >
              Notifications
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="admin tabs"
        >
          <Tab label="Dashboard" />
          <Tab label="Orders" />
          <Tab label="Analytics" />
          <Tab label="Staff" />
          <Tab label="Shelves" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 0 && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderAnalytics()}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/create-order")}
                  >
                    Create Order
                  </Button>
                </Grid>
                <Grid>
                  <Button variant="outlined" startIcon={<PeopleIcon />}>
                    Add Staff
                  </Button>
                </Grid>
                <Grid>
                  <Button 
                    variant="outlined" 
                    startIcon={<AssessmentIcon />}
                    onClick={handleGenerateReport}
                  >
                    Generate Report
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : getFilteredOrders().length > 0 ? (
                      getFilteredOrders().map(renderOrderRow)
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body1" color="text.secondary">
                            No orders found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </motion.div>
        )}

        {activeTab === 2 && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderAnalytics()}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Order Status Distribution
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {Object.entries(statusColors).map(([status, color]) => (
                          <Box
                            key={status}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2">{status}</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {orders.filter((o) => o.status === status).length}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Revenue Trends
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Revenue tracking and analytics will be displayed here
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        )}

        {activeTab === 3 && (
          <motion.div
            key="staff"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStaffManagement()}
          </motion.div>
        )}

        {activeTab === 4 && (
          <motion.div
            key="shelves"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderShelfManagement()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Update Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Order: {selectedOrder?.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer: {selectedOrder?.customerName}
            </Typography>
          </Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              {Object.keys(statusColors).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Status Note (Optional)"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={updating}
          >
            {updating ? <CircularProgress size={20} /> : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add order"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
        onClick={() => navigate("/create-order")}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}
