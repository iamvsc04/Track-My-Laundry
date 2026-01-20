import React, { useState, useEffect } from "react";
import {
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
  Stack,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
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
  Print as PrintIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  getOrderById, 
  downloadInvoice, 
  updateOrderStatus,
  formatCurrency, 
  formatDate, 
  formatDateTime,
  getStatusColor 
} from "../utils/api";
import { toast } from "react-toastify";
import MainLayout from "../components/Layout/MainLayout";
import LaundryLoader from '../components/animations/LaundryLoaders';
import { animationVariants } from '../hooks/useAnimations';

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

const statusIcons = {
  Pending: <ScheduleIcon />,
  Confirmed: <CheckIcon />,
  "Picked Up": <LocationIcon />,
  Washing: <LaundryIcon />,
  Ironing: <LaundryIcon />,
  "Ready for Pickup": <CheckIcon />,
  "Out for Delivery": <LocationIcon />,
  Delivered: <CheckIcon />,
  Cancelled: <CheckIcon />,
};

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

export default function OrderDetails() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
      const response = await getOrderById(orderId);
      setOrder(response.data.data);
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
      const response = await updateOrderStatus(orderId, { status: newStatus, note: statusNote });
      
      if (response.data.success) {
        setOrder(response.data.data);
        setUpdateDialogOpen(false);
        setNewStatus("");
        setStatusNote("");
        toast.success("Order status updated successfully");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getCurrentStep = () => {
    if (!order?.status) return 0;
    return statusSteps.indexOf(order.status) + 1;
  };

  const handleDownloadInvoice = async () => {
    try {
      await downloadInvoice(orderId);
      toast.success("Invoice download started");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
        <LaundryLoader type="washing" size={80} message="Loading order details..." />
      </Box>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            }
          >
            Order not found or access denied.
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        variants={animationVariants.pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Box sx={{ mb: 4 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Order #{order.orderNumber}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={order.serviceType} variant="outlined" size="small" />
                <Typography variant="body2" color="text.secondary">
                  Created on {formatDate(order.createdAt)}
                </Typography>
              </Stack>
            </Box>
            
            <Stack direction="row" spacing={1}>
              <IconButton color="primary" onClick={() => window.print()}>
                <PrintIcon />
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadInvoice}
              >
                Invoice
              </Button>
              {user?.role === "admin" && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setUpdateDialogOpen(true)}
                >
                  Update
                </Button>
              )}
            </Stack>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Main Info */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Quick Status Card */}
            <StyledCard sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      Current Status
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip
                        icon={statusIcons[order.status]}
                        label={order.status}
                        color={getStatusColor(order.status)}
                        sx={{ fontWeight: 700, px: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Est. Completion: {formatDate(order.estimatedCompletion)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: { sm: 'right' } }}>
                    <Typography variant="h4" fontWeight={800} color="primary">
                      {formatCurrency(order.total)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                      {order.paymentStatus}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>

            {/* Stepper */}
            <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Order Journey
              </Typography>
              <Stepper activeStep={getCurrentStep()} orientation="vertical">
                {statusSteps.map((step, index) => {
                  const log = order.statusLogs?.find(l => l.status === step);
                  return (
                    <Step key={step}>
                      <StepLabel
                        error={order.status === "Cancelled" && step === "Cancelled"}
                        StepIconProps={{
                          sx: { 
                            '&.Mui-active': { color: theme.palette.primary.main },
                            '&.Mui-completed': { color: theme.palette.success.main },
                          }
                        }}
                      >
                        <Typography fontWeight={getCurrentStep() > index ? 600 : 400}>
                          {step}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        {log && (
                          <Box sx={{ py: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatDateTime(log.timestamp)}
                            </Typography>
                            <Typography variant="body2">{log.note}</Typography>
                          </Box>
                        )}
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
            </Paper>

            {/* Items */}
            <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Laundry Items
              </Typography>
              <List disablePadding>
                {order.items?.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ py: 2, px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: `${theme.palette.primary.main}15`, color: theme.palette.primary.main }}>
                          <LaundryIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography fontWeight={600}>
                            {item.quantity}x {item.type}
                          </Typography>
                        }
                        secondary={item.service}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography fontWeight={700}>{formatCurrency(item.price * item.quantity)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(item.price)} each
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < (order.items?.length || 0) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>

            {/* Pickup & Delivery */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="button" color="primary" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon fontSize="small" /> Pickup Detail
                  </Typography>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {order.pickup?.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(order.pickup?.date)} • {order.pickup?.timeSlot}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="button" color="secondary" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon fontSize="small" /> Delivery Detail
                  </Typography>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {order.delivery?.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(order.delivery?.date)} • {order.delivery?.timeSlot}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Order Summary */}
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Order Summary
                    </Typography>
                    <Chip 
                      label={order.paymentStatus} 
                      size="small" 
                      color={order.paymentStatus === 'Paid' ? 'success' : 'warning'} 
                      variant="tonal"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">Tax (10%)</Typography>
                      <Typography variant="body2">{formatCurrency(order.tax)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">Discount</Typography>
                      <Typography variant="body2" color="success.main">-{formatCurrency(order.discount)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {order.paymentStatus === 'Paid' ? 'Total Paid' : 'Amount Due'}
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="primary">
                        {formatCurrency(order.total)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StyledCard>

              {/* Preferences */}
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Preferences
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Detergent Type</Typography>
                      <Typography variant="body2" fontWeight={600}>{order.customerPreferences?.detergentType || "Standard"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Fabric Softener</Typography>
                      <Typography variant="body2" fontWeight={600}>{order.customerPreferences?.fabricSoftener ? "Yes" : "No"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Ironing</Typography>
                      <Typography variant="body2" fontWeight={600}>{order.customerPreferences?.ironing ? "Yes" : "No"}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StyledCard>

              {/* NFC & Tracking */}
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Tracking
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Tracking Code</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{order.trackingCode}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">NFC Tag ID</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{order.nfcTag}</Typography>
                    </Box>
                    {order.shelfLocation && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Shelf Location</Typography>
                        <Typography variant="body2">{order.shelfLocation}</Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </StyledCard>
            </Stack>
          </Grid>
        </Grid>
      </motion.div>

      {/* Update Dialog (Admin) */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="New Status"
              >
                {statusSteps.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Status Note"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Explain the update..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={!newStatus || updating}
            sx={{ px: 4 }}
          >
            {updating ? "Updating..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
