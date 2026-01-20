import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  AccountBalanceWallet as WalletIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrderById, createPayment, processPayment, formatCurrency } from "../utils/api";
import { toast } from "react-toastify";

const paymentMethods = [
  {
    id: "upi",
    name: "UPI",
    icon: <PaymentIcon />,
    color: "#00bfa5",
    description: "Pay using any UPI app like GPay, PhonePe",
    fields: ["upiId"],
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    icon: <CardIcon />,
    color: "#1a237e",
    description: "Safe and secure card payments",
    fields: ["cardNumber", "expiryDate", "cvv", "cardholderName"],
  },
  {
    id: "netbanking",
    name: "Net Banking",
    icon: <BankIcon />,
    color: "#f57c00",
    description: "Pay directly from your bank account",
    fields: ["bankName"],
  },
  {
    id: "cash",
    name: "Cash on Delivery",
    icon: <ReceiptIcon />,
    color: "#d32f2f",
    description: "Pay when your order is delivered",
    fields: [],
  },
];

const banks = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Yes Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
];

const walletTypes = [
  "Paytm",
  "PhonePe",
  "Google Pay",
  "Amazon Pay",
  "MobiKwik",
  "Freecharge",
];

const steps = [
  "Order Review",
  "Payment Method",
  "Payment Details",
  "Confirmation",
];

export default function Payment() {
  const { orderId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [paymentForm, setPaymentForm] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

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

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handlePayment();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
    setPaymentForm({});
  };

  const handleInputChange = (field, value) => {
    setPaymentForm({
      ...paymentForm,
      [field]: value,
    });
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      setProcessing(true);

      // Create payment record
      const paymentData = {
        orderId: order._id,
        amount: order.total,
        paymentMethod: selectedPaymentMethod,
        paymentDetails: paymentForm,
      };

      // For now, simulate payment processing. Replace with actual API calls
      // const createResponse = await createPayment(token, paymentData);
      // const processResponse = await processPayment(token, createResponse.data._id);

      // Simulate payment success
      setTimeout(() => {
        setPaymentDetails({
          transactionId: "TXN" + Date.now(),
          invoiceNumber: "INV" + Date.now(),
          paymentStatus: "Completed",
          paidAt: new Date().toISOString(),
        });
        setPaymentSuccess(true);
        setProcessing(false);
        setActiveStep(3);
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  const renderPaymentFields = () => {
    const method = paymentMethods.find((m) => m.id === selectedPaymentMethod);
    if (!method || method.fields.length === 0) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>
        <Grid container spacing={2}>
          {method.fields.includes("upiId") && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="UPI ID"
                placeholder="example@upi"
                value={paymentForm.upiId || ""}
                onChange={(e) => handleInputChange("upiId", e.target.value)}
                helperText="Enter your UPI ID (e.g., name@bank)"
              />
            </Grid>
          )}

          {method.fields.includes("cardNumber") && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={paymentForm.cardNumber || ""}
                onChange={(e) =>
                  handleInputChange("cardNumber", e.target.value)
                }
                inputProps={{ maxLength: 19 }}
              />
            </Grid>
          )}

          {method.fields.includes("expiryDate") && (
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Expiry Date"
                placeholder="MM/YY"
                value={paymentForm.expiryDate || ""}
                onChange={(e) =>
                  handleInputChange("expiryDate", e.target.value)
                }
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
          )}

          {method.fields.includes("cvv") && (
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV"
                placeholder="123"
                value={paymentForm.cvv || ""}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                inputProps={{ maxLength: 4 }}
              />
            </Grid>
          )}

          {method.fields.includes("cardholderName") && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cardholder Name"
                placeholder="John Doe"
                value={paymentForm.cardholderName || ""}
                onChange={(e) =>
                  handleInputChange("cardholderName", e.target.value)
                }
              />
            </Grid>
          )}

          {method.fields.includes("bankName") && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Bank</InputLabel>
                <Select
                  value={paymentForm.bankName || ""}
                  onChange={(e) =>
                    handleInputChange("bankName", e.target.value)
                  }
                  label="Select Bank"
                >
                  {banks.map((bank) => (
                    <MenuItem key={bank} value={bank}>
                      {bank}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {method.fields.includes("accountNumber") && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Number"
                placeholder="Enter your account number"
                value={paymentForm.accountNumber || ""}
                onChange={(e) =>
                  handleInputChange("accountNumber", e.target.value)
                }
                type="password"
              />
            </Grid>
          )}

          {method.fields.includes("walletType") && (
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Wallet Type</InputLabel>
                <Select
                  value={paymentForm.walletType || ""}
                  onChange={(e) =>
                    handleInputChange("walletType", e.target.value)
                  }
                  label="Wallet Type"
                >
                  {walletTypes.map((wallet) => (
                    <MenuItem key={wallet} value={wallet}>
                      {wallet}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {method.fields.includes("mobileNumber") && (
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                placeholder="+91 98765 43210"
                value={paymentForm.mobileNumber || ""}
                onChange={(e) =>
                  handleInputChange("mobileNumber", e.target.value)
                }
              />
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {order.serviceType}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Order #{order.orderNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created on {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Items:
                    </Typography>
                    <List dense>
                      {order.items.map((item, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Avatar
                              sx={{ width: 24, height: 24, fontSize: 12 }}
                            >
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
                            secondary={`${formatCurrency(item.price)} each`}
                          />
                          <Typography variant="body2" color="primary">
                            {formatCurrency(item.price * item.quantity)}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Payment Summary
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2">Subtotal:</Typography>
                          <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2">Tax:</Typography>
                          <Typography variant="body2">{formatCurrency(order.tax)}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2">Discount:</Typography>
                          <Typography variant="body2" color="success.main">-{formatCurrency(order.discount || 0)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="h6">Total:</Typography>
                          <Typography variant="h6" color="primary">{formatCurrency(order.total)}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Payment Method
              </Typography>
              <Grid container spacing={2}>
                {paymentMethods.map((method) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={method.id}>
                    <Card
                      variant={
                        selectedPaymentMethod === method.id
                          ? "elevation"
                          : "outlined"
                      }
                      sx={{
                        cursor: "pointer",
                        border:
                          selectedPaymentMethod === method.id
                            ? `2px solid ${method.color}`
                            : "1px solid",
                        "&:hover": {
                          borderColor: method.color,
                          transform: "translateY(-2px)",
                          transition: "all 0.3s ease",
                        },
                      }}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                    >
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Avatar sx={{ bgcolor: method.color, mr: 2 }}>
                            {method.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {method.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {method.description}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              {selectedPaymentMethod ? (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: paymentMethods.find(
                          (m) => m.id === selectedPaymentMethod
                        )?.color,
                        mr: 2,
                      }}
                    >
                      {
                        paymentMethods.find(
                          (m) => m.id === selectedPaymentMethod
                        )?.icon
                      }
                    </Avatar>
                    <Typography variant="subtitle1">
                      {
                        paymentMethods.find(
                          (m) => m.id === selectedPaymentMethod
                        )?.name
                      }
                    </Typography>
                  </Box>
                  {renderPaymentFields()}
                </Box>
              ) : (
                <Alert severity="info">
                  Please select a payment method first
                </Alert>
              )}
            </Paper>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ textAlign: "center", py: 4 }}>
                {paymentSuccess ? (
                  <Box>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "success.main",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" color="success.main" gutterBottom>
                      Payment Successful!
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      Your order has been confirmed and payment processed
                      successfully.
                    </Typography>

                    {paymentDetails && (
                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Payment Details:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Transaction ID: {paymentDetails.transactionId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Invoice Number: {paymentDetails.invoiceNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Paid on:{" "}
                          {new Date(paymentDetails.paidAt).toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/order/${orderId}`)}
                        sx={{ mr: 2 }}
                      >
                        View Order
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => navigate("/dashboard")}
                      >
                        Back to Dashboard
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Processing Payment...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Please wait while we process your payment.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        );

      default:
        return null;
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
        <Typography variant="h4" component="h1" gutterBottom>
          Complete Payment
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Order #{order.orderNumber} • Total: ₹{order.total}
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      {activeStep < 3 && (
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Box>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 1 && !selectedPaymentMethod) ||
                (activeStep === 2 &&
                  selectedPaymentMethod !== "cash" &&
                  Object.keys(paymentForm).length === 0) ||
                processing
              }
            >
              {activeStep === steps.length - 1 ? "Complete Payment" : "Next"}
            </Button>
          </Box>
        </Box>
      )}

      {/* Security Notice */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          <LockIcon sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            Your payment information is secure and encrypted
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          We use industry-standard SSL encryption to protect your data
        </Typography>
      </Box>
    </Container>
  );
}
