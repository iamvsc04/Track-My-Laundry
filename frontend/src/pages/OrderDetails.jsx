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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
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
  LocalLaundryService as LaundryIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  QrCode as QrCodeIcon,
  Nfc as NfcIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrderById, updateOrderStatus, downloadInvoice } from "../utils/api";
import { toast } from "react-toastify";

const statusSteps = [
  "Pending",
  "Confirmed",
  "Picked Up",
  "Washing",
  "Ironing",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
];

const statusColors = {
  Pending: "default",
  Confirmed: "info",
  "Picked Up": "warning",
  Washing: "primary",
  Ironing: "secondary",
  "Ready for Pickup": "success",
  "Out for Delivery": "warning",
  Delivered: "success",
  Cancelled: "error",
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
  Cancelled: <ViewIcon />,
};

export default function OrderDetails() {
  const { orderId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // For now, use mock data. Replace with actual API call
      // const response = await getOrderById(token, orderId);
      // setOrder(response.data);

      // Mock order data
      setOrder({
        _id: orderId,
        orderNumber: "LAU12345678",
        status: "Washing",
        serviceType: "Wash & Fold",
        items: [
          {
            type: "Shirt",
            quantity: 5,
            price: 25,
            specialInstructions: "Gentle wash",
          },
          {
            type: "Pants",
            quantity: 3,
            price: 30,
            specialInstructions: "No starch",
          },
          {
            type: "Dress",
            quantity: 2,
            price: 35,
            specialInstructions: "Hand wash",
          },
        ],
        subtotal: 235,
        tax: 23.5,
        discount: 20,
        total: 238.5,
        pickup: {
          address: "123 Main St, City, State 12345",
          date: "2024-01-15",
          timeSlot: "10:00 AM - 12:00 PM",
          instructions: "Ring doorbell twice",
        },
        delivery: {
          address: "123 Main St, City, State 12345",
          date: "2024-01-17",
          timeSlot: "2:00 PM - 4:00 PM",
          instructions: "Leave at doorstep if not home",
        },
        paymentStatus: "Paid",
        paymentMethod: "UPI",
        transactionId: "TXN123456789",
        nfcTag: "NFC001",
        shelfLocation: "W_A2",
        trackingCode: "TRK12345678",
        assignedTo: { name: "John Doe", phone: "+1234567890" },
        estimatedCompletion: "2024-01-17T14:00:00Z",
        customerPreferences: {
          detergentType: "Eco-friendly",
          fabricSoftener: true,
          starchLevel: "None",
          ironing: true,
        },
        statusLogs: [
          {
            status: "Pending",
            timestamp: "2024-01-15T08:00:00Z",
            note: "Order created",
            updatedBy: "System",
          },
          {
            status: "Confirmed",
            timestamp: "2024-01-15T09:00:00Z",
            note: "Payment received",
            updatedBy: "System",
          },
          {
            status: "Picked Up",
            timestamp: "2024-01-15T11:00:00Z",
            note: "Picked up from customer",
            updatedBy: "John Doe",
          },
          {
            status: "Washing",
            timestamp: "2024-01-15T12:00:00Z",
            note: "Started washing process",
            updatedBy: "John Doe",
          },
        ],
        customerNotes: "Please handle with care, some items are delicate",
        staffNotes: "Customer requested eco-friendly detergent",
        createdAt: "2024-01-15T08:00:00Z",
        updatedAt: "2024-01-15T12:00:00Z",
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    try {
      setUpdating(true);
      // For now, just update local state. Replace with actual API call
      // await updateOrderStatus(token, orderId, { status: newStatus, note: statusNote });

      const updatedOrder = {
        ...order,
        status: newStatus,
        statusLogs: [
          ...order.statusLogs,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: statusNote || "Status updated",
            updatedBy: user?.name || "User",
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      setOrder(updatedOrder);
      setUpdateDialogOpen(false);
      setNewStatus("");
      setStatusNote("");
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getCurrentStep = () => {
    return statusSteps.indexOf(order?.status) + 1;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = async () => {
    try {
      await downloadInvoice(orderId);
      toast.info("Invoice download started");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Order not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
            <Typography variant="h4" component="h1" gutterBottom>
              Order #{order.orderNumber}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {order.serviceType} • Created on {formatDate(order.createdAt)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintInvoice}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadInvoice}
            >
              Invoice
            </Button>
            <Button variant="outlined" startIcon={<ShareIcon />}>
              Share
            </Button>
            {user?.role === "admin" && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setUpdateDialogOpen(true)}
              >
                Update Status
              </Button>
            )}
          </Box>
        </Box>

        {/* Status Overview */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Current Status
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Chip
                  icon={statusIcons[order.status]}
                  label={order.status}
                  color={statusColors[order.status]}
                  size="large"
                  variant="filled"
                />
                <Typography variant="body2" color="text.secondary">
                  Estimated completion: {formatDate(order.estimatedCompletion)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  ₹{order.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.paymentStatus}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Order Details */}
        <Grid item xs={12} md={8}>
          {/* Order Progress */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Progress
            </Typography>
            <Stepper activeStep={getCurrentStep()} orientation="vertical">
              {statusSteps.map((step, index) => (
                <Step key={step}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Avatar
                        sx={{
                          bgcolor:
                            getCurrentStep() > index
                              ? "primary.main"
                              : "grey.300",
                          color:
                            getCurrentStep() > index
                              ? "white"
                              : "text.secondary",
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    )}
                  >
                    {step}
                  </StepLabel>
                  <StepContent>
                    {order.statusLogs.find((log) => log.status === step) && (
                      <Box sx={{ mt: 1, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(
                            order.statusLogs.find((log) => log.status === step)
                              .timestamp
                          )}
                        </Typography>
                        <Typography variant="body2">
                          {
                            order.statusLogs.find((log) => log.status === step)
                              .note
                          }
                        </Typography>
                      </Box>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Items Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Items ({order.items.length})
            </Typography>
            <List>
              {order.items.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {item.type === "Shirt" && "👕"}
                        {item.type === "Pants" && "👖"}
                        {item.type === "Dress" && "👗"}
                        {item.type === "Suit" && "🤵"}
                        {item.type === "Bedsheet" && "🛏️"}
                        {item.type === "Towel" && "🛁"}
                        {item.type === "Curtain" && "🪟"}
                        {item.type === "Other" && "👕"}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${item.quantity}x ${item.type}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Service: {item.service}
                          </Typography>
                          {item.specialInstructions && (
                            <Typography variant="body2" color="text.secondary">
                              Instructions: {item.specialInstructions}
                            </Typography>
                          )}
                          <Typography variant="body2" color="primary">
                            ₹{item.price} each
                          </Typography>
                        </Box>
                      }
                    />
                    <Typography variant="h6" color="primary">
                      ₹{item.price * item.quantity}
                    </Typography>
                  </ListItem>
                  {index < order.items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Pickup & Delivery */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pickup & Delivery
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      gutterBottom
                    >
                      Pickup Details
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <LocationIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body2">
                        {order.pickup.address}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Date: {formatDate(order.pickup.date)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time: {order.pickup.timeSlot}
                    </Typography>
                    {order.pickup.instructions && (
                      <Typography variant="body2" color="text.secondary">
                        Instructions: {order.pickup.instructions}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      gutterBottom
                    >
                      Delivery Details
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CheckIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body2">
                        {order.delivery.address}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Date: {formatDate(order.delivery.date)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time: {order.delivery.timeSlot}
                    </Typography>
                    {order.delivery.instructions && (
                      <Typography variant="body2" color="text.secondary">
                        Instructions: {order.delivery.instructions}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Customer Preferences */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Preferences
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Detergent
                </Typography>
                <Typography variant="body1">
                  {order.customerPreferences.detergentType}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Fabric Softener
                </Typography>
                <Typography variant="body1">
                  {order.customerPreferences.fabricSoftener ? "Yes" : "No"}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Starch Level
                </Typography>
                <Typography variant="body1">
                  {order.customerPreferences.starchLevel}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Ironing
                </Typography>
                <Typography variant="body1">
                  {order.customerPreferences.ironing ? "Yes" : "No"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Notes */}
          {(order.customerNotes || order.staffNotes) && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              {order.customerNotes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    Customer Notes:
                  </Typography>
                  <Typography variant="body2">{order.customerNotes}</Typography>
                </Box>
              )}
              {order.staffNotes && (
                <Box>
                  <Typography variant="subtitle2" color="primary">
                    Staff Notes:
                  </Typography>
                  <Typography variant="body2">{order.staffNotes}</Typography>
                </Box>
              )}
            </Paper>
          )}
        </Grid>

        {/* Right Column - Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Order Summary */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">₹{order.subtotal}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Tax:</Typography>
                <Typography variant="body2">₹{order.tax}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Discount:</Typography>
                <Typography variant="body2" color="success.main">
                  -₹{order.discount}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ₹{order.total}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Payment Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Status:</Typography>
                <Chip
                  label={order.paymentStatus}
                  color={order.paymentStatus === "Paid" ? "success" : "warning"}
                  size="small"
                />
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Method:</Typography>
                <Typography variant="body2">{order.paymentMethod}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Transaction ID:</Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {order.transactionId}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Tracking Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tracking Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Tracking Code:</Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {order.trackingCode}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">NFC Tag:</Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {order.nfcTag}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Shelf Location:</Typography>
                <Typography variant="body2">{order.shelfLocation}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Assigned Staff */}
          {order.assignedTo && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Assigned Staff
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                  {order.assignedTo.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {order.assignedTo.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.assignedTo.phone}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Status Timeline */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status Timeline
            </Typography>
            <Timeline position="right">
              {order.statusLogs.map((log, index) => (
                <TimelineItem key={index}>
                  <TimelineOppositeContent
                    sx={{ m: "auto 0" }}
                    variant="body2"
                    color="text.secondary"
                  >
                    {formatTime(log.timestamp)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot
                      color={
                        index === order.statusLogs.length - 1
                          ? "primary"
                          : "grey"
                      }
                    />
                    {index < order.statusLogs.length - 1 && (
                      <TimelineConnector />
                    )}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: "12px", px: 2 }}>
                    <Typography variant="subtitle2" component="span">
                      {log.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.note}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {log.updatedBy}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="New Status"
              >
                {statusSteps.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Status Note (Optional)"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Add any additional notes about this status change..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={!newStatus || updating}
          >
            {updating ? <CircularProgress size={20} /> : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
