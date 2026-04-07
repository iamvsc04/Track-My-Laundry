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
  getShelves,
  updateShelfStatus,
  generateReport,
  getOrderAnalytics,
  scanNfcTag,
  createAdmin,
  getAllStaff,
  APP_BASE_URL,
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
} from "../utils/api";
import { toast } from "react-toastify";
import NFCScanner from "../components/NFCScanner";
import NotificationCenter from "../components/Notifications/NotificationCenter";
import { Add as AddIcon } from "@mui/icons-material";
import { styled, useTheme } from "@mui/material/styles";
import MainLayout from "../components/Layout/MainLayout";

const StyledCard = styled(motion.create(Card))(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
  overflow: "visible",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[4],
  }
}));

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
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [nfcWriteData, setNfcWriteData] = useState(null);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [shelfDialogOpen, setShelfDialogOpen] = useState(false);
  const [staff, setStaff] = useState([]);
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "admin",
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

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
    fetchStaff();
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
      setLoading(true);
      const response = await getOrderAnalytics(dateRange === '30d' ? '30' : '7');
      if (response.data && response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders({ limit: 100 });
      if (response.data && response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await getAllStaff();
      if (response.data && response.data.success) {
        setStaff(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setCreatingAdmin(true);
      const response = await createAdmin(newAdmin);
      if (response.data) {
        toast.success("Admin created successfully");
        setCreateAdminDialogOpen(false);
        setNewAdmin({ name: "", email: "", mobile: "", password: "", role: "admin" });
        fetchStaff();
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error(error.response?.data?.message || "Failed to create admin");
    } finally {
      setCreatingAdmin(false);
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
      await updateOrderStatus(selectedOrder._id, { 
        status: newStatus, 
        note: statusNote,
        updatedBy: user.id 
      });

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
      fetchOrders();
      fetchAnalytics(); // Refresh analytics after update
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handleNfcScannerOpen = () => {
    setSelectedOrder(null); // Clear selection for general scan (status update)
    setNfcWriteData(null);
    setNfcScannerOpen(true);
  };

  const handleNfcAssignOpen = (order) => {
    setSelectedOrder(order); // Select order for assignment mode
    setNfcWriteData(null);
    setNfcScannerOpen(true);
  };

  const handleNfcDemoWriteOpen = () => {
    const tag = `DEMO_NFC_${Date.now()}`;
    setSelectedOrder(null);
    setNfcWriteData({
      nfcTag: tag,
      url: `${APP_BASE_URL}/nfc-demo?tag=${encodeURIComponent(tag)}`,
      action: "create_demo_order",
    });
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

  const getNfcTagFromScan = (nfcData) => {
    if (!nfcData) return "";
    if (typeof nfcData.content === "object" && nfcData.content?.nfcTag) {
      return nfcData.content.nfcTag;
    }
    if (typeof nfcData.content === "string") {
      try {
        const url = new URL(nfcData.content);
        return url.searchParams.get("nfcTag") || nfcData.content;
      } catch {
        // Plain tag value, not a URL.
      }
      return nfcData.content;
    }
    return nfcData.serialNumber || "";
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

  const formatCompletion = (order) => {
    if (order.status === "Delivered") {
      return order.actualCompletion
        ? `Completed ${formatDate(order.actualCompletion)}`
        : "Completed";
    }
    return order.estimatedCompletion
      ? `Est. ${formatDate(order.estimatedCompletion)}`
      : "Not scheduled";
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
            {order.user?.name || order.customerName || "Customer"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {order.user?.mobile || order.user?.phone || order.customerPhone || "N/A"}
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
          color={getStatusColor(order.status)}
          sx={{ fontWeight: "bold" }}
        />
      </TableCell>
      <TableCell>
        <Typography variant="subtitle2" fontWeight="bold">
          {formatCurrency(order.total || order.totalAmount || 0)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {formatCompletion(order)}
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
          <Tooltip title="Assign NFC Sticker">
            <IconButton
              size="small"
              onClick={() => handleNfcAssignOpen(order)}
              color="info"
            >
              <NfcIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderAnalytics = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <StyledCard
          sx={{
            p: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <TrendingIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
            {analytics.totalOrders || 0}
          </Typography>
          <Typography variant="body2">Total Orders ({dateRange})</Typography>
        </StyledCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <StyledCard
          sx={{
            p: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
          }}
        >
          <CartIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
            {formatCurrency(analytics.totalSpent || 0)}
          </Typography>
          <Typography variant="body2">Total Revenue ({dateRange})</Typography>
        </StyledCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <StyledCard
          sx={{
            p: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            color: "white",
          }}
        >
          <CheckIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
            {analytics.analytics?.find(a => a._id === 'Delivered')?.count || 0}
          </Typography>
          <Typography variant="body2">Completed Orders ({dateRange})</Typography>
        </StyledCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <StyledCard
          sx={{
            p: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            color: "white",
          }}
        >
          <StarIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
            {analytics.avgRating || "N/A"}
          </Typography>
          <Typography variant="body2">Avg Rating</Typography>
        </StyledCard>
      </Grid>
    </Grid>
  );

  const getAnalyticsRows = () =>
    (analytics.analytics || []).map((item) => ({
      status: item._id || "Unknown",
      count: item.count || 0,
      totalAmount: item.totalAmount || 0,
    }));

  const renderStaffManagement = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Admin & Staff Management</Typography>
          {user?.role === 'super-admin' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateAdminDialogOpen(true)}
              sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
            >
              Add New Admin
            </Button>
          )}
        </Box>
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Staff Member</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staff.length > 0 ? staff.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: member.role === 'super-admin' ? 'secondary.main' : 'primary.main' }}>
                            {member.name.charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle2">{member.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.mobile || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={member.role}
                          size="small"
                          color={member.role === 'super-admin' ? 'secondary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.emailVerified ? "Verified" : "Unverified"}
                          size="small"
                          color={member.emailVerified ? "success" : "warning"}
                        />
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" sx={{ py: 3 }}>No staff members found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderShelfManagement = () => (
    <Grid container spacing={3}>
      {shelves && shelves.length > 0 ? shelves.map((shelf) => (
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={shelf._id}>
          <Paper
            onClick={() => handleShelfClick(shelf)}
            sx={{
              p: 2,
              textAlign: 'center',
              cursor: 'pointer',
              border: `2px solid ${shelf.isOccupied ? theme.palette.secondary.main : theme.palette.success.main}`,
              bgcolor: shelf.isOccupied ? `${theme.palette.secondary.main}05` : `${theme.palette.success.main}05`,
              '&:hover': {
                bgcolor: shelf.isOccupied ? `${theme.palette.secondary.main}10` : `${theme.palette.success.main}10`,
              }
            }}
          >
            <Typography variant="h6" fontWeight="bold">{shelf.code}</Typography>
            <Typography variant="caption" color={shelf.isOccupied ? "secondary" : "success"}>
              {shelf.isOccupied ? `Order: ${shelf.currentOrder?.orderNumber || "Occupied"}` : "Available"}
            </Typography>
          </Paper>
        </Grid>
      )) : (
        <Grid size={{ xs: 12 }}>
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">No shelves configured</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>Shelves can be added in the database.</Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );

  return (
    <MainLayout>
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
              variant="h3"
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
              NFC Scan
            </Button>
            <Button
              variant="outlined"
              startIcon={<NfcIcon />}
              onClick={handleNfcDemoWriteOpen}
            >
              Write Demo Tag
            </Button>
            <Select
              size="small"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="7d">7 Days</MenuItem>
              <MenuItem value="30d">30 Days</MenuItem>
            </Select>
            <Button
              variant="outlined"
              startIcon={<NotificationsIcon />}
              onClick={() => setNotificationCenterOpen(true)}
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
                  <Button 
                    variant="outlined" 
                    startIcon={<PeopleIcon />}
                    onClick={() => setActiveTab(3)}
                  >
                    Manage Staff
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
                      <TableCell>Completion</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : getFilteredOrders().length > 0 ? (
                      getFilteredOrders().map(renderOrderRow)
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
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
                        Revenue by Status
                      </Typography>
                      <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {getAnalyticsRows().length > 0 ? (
                          getAnalyticsRows().map((item) => (
                            <Box
                              key={item.status}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: "action.hover",
                              }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={700} noWrap>
                                  {item.status}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.count} order{item.count === 1 ? "" : "s"}
                                </Typography>
                              </Box>
                              <Typography variant="body2" fontWeight={800} color="primary" noWrap>
                                {formatCurrency(item.totalAmount)}
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No revenue data available for this period.
                          </Typography>
                        )}
                      </Stack>
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
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Order: {selectedOrder?.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer: {selectedOrder?.user?.name || selectedOrder?.customerName || "Customer"}
            </Typography>
          </Box>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              {[
                "Pending",
                "Confirmed",
                "Picked Up",
                "Washing",
                "Ironing",
                "Ready for Pickup",
                "Out for Delivery",
                "Delivered",
                "Cancelled",
              ].map((status) => (
                <MenuItem key={status} value={status}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: `${getStatusColor(status)}.main`,
                      }}
                    />
                    {status}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Status Note"
            placeholder="Add a reason or update for the customer..."
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={updating || !newStatus}
            sx={{ px: 4 }}
          >
            {updating ? <CircularProgress size={24} /> : "Record Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <NFCScanner
        open={nfcScannerOpen}
        onClose={() => setNfcScannerOpen(false)}
        onScanSuccess={async (nfcData) => {
          try {
            if (nfcData.type === "write_success") {
              if (nfcWriteData?.action === "create_demo_order") {
                toast.success("Demo NFC sticker is ready. Tap it with a phone to create a sample order.");
                setNfcWriteData(null);
                return;
              }

              // Successfully assigned tag to order
              const tagId = getNfcTagFromScan(nfcData);
              await scanNfcTag({
                nfcTag: tagId,
                operation: "assign",
                orderId: selectedOrder?._id
              });
              fetchOrders();
            } else {
              // Scanned for status update
              const tagId = getNfcTagFromScan(nfcData);
              await scanNfcTag({
                nfcTag: tagId,
                operation: "status_update",
                location: "Admin Facility"
              });
              fetchOrders();
            }
          } catch (err) {
            console.error(err);
            toast.error("NFC operation failed on server");
          }
        }}
        orderId={selectedOrder?.orderNumber}
        mode={selectedOrder || nfcWriteData ? "write" : "read"}
        writeData={
          nfcWriteData ||
          (selectedOrder
            ? {
                nfcTag: selectedOrder.nfcTag,
                orderId: selectedOrder._id,
                orderNumber: selectedOrder.orderNumber,
                action: "track_order",
              }
            : undefined)
        }
      />

      <NotificationCenter
        open={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />

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

      {/* Create Admin Dialog */}
      <Dialog
        open={createAdminDialogOpen}
        onClose={() => setCreateAdminDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Add New Admin Account</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email Address"
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Mobile Number"
              value={newAdmin.mobile}
              onChange={(e) => setNewAdmin({ ...newAdmin, mobile: e.target.value })}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newAdmin.role}
                label="Role"
                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super-admin">Super Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateAdminDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAdmin}
            variant="contained"
            disabled={creatingAdmin}
            sx={{ px: 4, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            {creatingAdmin ? <CircularProgress size={24} color="inherit" /> : "Create Admin"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shelf Toggle Dialog */}
      <Dialog
        open={shelfDialogOpen}
        onClose={() => setShelfDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Shelf {selectedShelf?.code}</DialogTitle>
        <DialogContent>
          {selectedShelf?.isOccupied ? (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1">Currently occupied by: <strong>{selectedShelf.currentOrder?.orderNumber}</strong></Typography>
              <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">Marking this as cleared will make the shelf available for new orders.</Typography>
            </Box>
          ) : (
            <Typography variant="body1">This shelf is currently available.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShelfDialogOpen(false)}>Close</Button>
          {selectedShelf?.isOccupied && (
            <Button
              onClick={clearShelf}
              variant="contained"
              color="secondary"
              sx={{ borderRadius: 2 }}
            >
              Clear Shelf
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
    </MainLayout>
  );
}
