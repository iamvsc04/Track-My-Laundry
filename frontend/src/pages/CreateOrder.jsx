import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  LocalLaundryService as LaundryIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createOrder, formatCurrency } from "../utils/api";
import { toast } from "react-toastify";

const steps = ["Order Details", "Pickup & Delivery", "Preferences & Review"];

const serviceTypes = [
  {
    value: "Wash & Fold",
    price: 5,
    description: "Basic wash and fold service",
  },
  { value: "Dry Clean", price: 8, description: "Professional dry cleaning" },
  { value: "Iron Only", price: 3, description: "Ironing service only" },
  {
    value: "Premium Wash",
    price: 10,
    description: "Premium wash with special care",
  },
];

const itemTypes = [
  "Shirt",
  "Pants",
  "Dress",
  "Suit",
  "Bedsheet",
  "Towel",
  "Curtain",
  "Other",
];

const timeSlots = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "6:00 PM - 8:00 PM",
];

export default function CreateOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: "Wash & Fold",
    items: [
      {
        type: "Shirt",
        quantity: 1,
        service: "Wash & Fold",
        specialInstructions: "",
        price: 5,
      },
    ],
    pickup: {
      address: user?.address || "",
      date: "",
      timeSlot: "",
      instructions: "",
    },
    delivery: {
      address: user?.address || "",
      date: "",
      timeSlot: "",
      instructions: "",
    },
    customerPreferences: {
      detergentType: "Standard",
      fabricSoftener: false,
      starchLevel: "None",
      ironing: true,
    },
    customerNotes: "",
    isUrgent: false,
    priority: "Normal",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Set default pickup date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData((prev) => ({
      ...prev,
      pickup: { ...prev.pickup, date: tomorrow.toISOString().split("T")[0] },
      delivery: {
        ...prev.delivery,
        date: tomorrow.toISOString().split("T")[0],
      },
    }));
  }, []);

  const calculateItemPrice = (item) => {
    const service = serviceTypes.find((s) => s.value === item.service);
    return service ? service.price * item.quantity : 0;
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + calculateItemPrice(item),
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.serviceType)
        newErrors.serviceType = "Service type is required";
      if (formData.items.length === 0)
        newErrors.items = "At least one item is required";
      formData.items.forEach((item, index) => {
        if (!item.type) newErrors[`item${index}Type`] = "Item type is required";
        if (!item.quantity || item.quantity < 1)
          newErrors[`item${index}Quantity`] = "Valid quantity is required";
        if (!item.service)
          newErrors[`item${index}Service`] = "Service is required";
      });
    } else if (step === 1) {
      if (!formData.pickup.address)
        newErrors.pickupAddress = "Pickup address is required";
      if (!formData.pickup.date)
        newErrors.pickupDate = "Pickup date is required";
      if (!formData.pickup.timeSlot)
        newErrors.pickupTimeSlot = "Pickup time slot is required";
      if (!formData.delivery.address)
        newErrors.deliveryAddress = "Delivery address is required";
      if (!formData.delivery.date)
        newErrors.deliveryDate = "Delivery date is required";
      if (!formData.delivery.timeSlot)
        newErrors.deliveryTimeSlot = "Delivery time slot is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          type: "Shirt",
          quantity: 1,
          service: prev.serviceType,
          specialInstructions: "",
          price: 5,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    try {
      setLoading(true);
      const orderData = {
        ...formData,
        ...calculateTotal(),
      };

      const response = await createOrder(orderData);
      toast.success("Order created successfully!");
      navigate(`/order/${response.data.data._id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              What would you like us to clean?
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Service Type</InputLabel>
              <Select
                value={formData.serviceType}
                label="Service Type"
                onChange={(e) =>
                  handleInputChange("serviceType", e.target.value)
                }
                error={!!errors.serviceType}
              >
                {serviceTypes.map((service) => (
                  <MenuItem key={service.value} value={service.value}>
                    <Box>
                      <Typography variant="body1">{service.value}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {service.description} - {formatCurrency(service.price)}{" "}
                        per item
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Items</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  size="small"
                >
                  Add Item
                </Button>
              </Box>

              <AnimatePresence>
                {formData.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card sx={{ mb: 2, p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Type</InputLabel>
                            <Select
                              value={item.type}
                              label="Type"
                              onChange={(e) =>
                                handleItemChange(index, "type", e.target.value)
                              }
                              error={!!errors[`item${index}Type`]}
                            >
                              {itemTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Quantity"
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseInt(e.target.value)
                              )
                            }
                            error={!!errors[`item${index}Quantity`]}
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Service</InputLabel>
                            <Select
                              value={item.service}
                              label="Service"
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "service",
                                  e.target.value
                                )
                              }
                              error={!!errors[`item${index}Service`]}
                            >
                              {serviceTypes.map((service) => (
                                <MenuItem
                                  key={service.value}
                                  value={service.value}
                                >
                                  {service.value}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Special Instructions"
                            value={item.specialInstructions}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "specialInstructions",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Gentle wash, No bleach"
                          />
                        </Grid>
                        <Grid item xs={12} sm={1}>
                          <IconButton
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, textAlign: "right" }}>
                        <Typography variant="body2" color="primary">
                          Price: {formatCurrency(calculateItemPrice(item))}
                        </Typography>
                      </Box>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Box>

            {errors.items && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.items}
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pickup & Delivery Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ color: "primary.main" }}
                >
                  <LocationOn
                    as
                    LocationIcon
                    sx={{ mr: 1, verticalAlign: "middle" }}
                  />
                  Pickup Details
                </Typography>

                <TextField
                  fullWidth
                  label="Pickup Address"
                  value={formData.pickup.address}
                  onChange={(e) =>
                    handleNestedInputChange("pickup", "address", e.target.value)
                  }
                  error={!!errors.pickupAddress}
                  helperText={errors.pickupAddress}
                  sx={{ mb: 2 }}
                  multiline
                  rows={2}
                />

                <TextField
                  fullWidth
                  label="Pickup Date"
                  type="date"
                  value={formData.pickup.date}
                  onChange={(e) =>
                    handleNestedInputChange("pickup", "date", e.target.value)
                  }
                  error={!!errors.pickupDate}
                  helperText={errors.pickupDate}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Pickup Time Slot</InputLabel>
                  <Select
                    value={formData.pickup.timeSlot}
                    label="Pickup Time Slot"
                    onChange={(e) =>
                      handleNestedInputChange(
                        "pickup",
                        "timeSlot",
                        e.target.value
                      )
                    }
                    error={!!errors.pickupTimeSlot}
                  >
                    {timeSlots.map((slot) => (
                      <MenuItem key={slot} value={slot}>
                        {slot}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Pickup Instructions (Optional)"
                  value={formData.pickup.instructions}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "pickup",
                      "instructions",
                      e.target.value
                    )
                  }
                  placeholder="e.g., Ring doorbell, Leave with doorman"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ color: "primary.main" }}
                >
                  <CheckIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Delivery Details
                </Typography>

                <TextField
                  fullWidth
                  label="Delivery Address"
                  value={formData.delivery.address}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "delivery",
                      "address",
                      e.target.value
                    )
                  }
                  error={!!errors.deliveryAddress}
                  helperText={errors.deliveryAddress}
                  sx={{ mb: 2 }}
                  multiline
                  rows={2}
                />

                <TextField
                  fullWidth
                  label="Delivery Date"
                  type="date"
                  value={formData.delivery.date}
                  onChange={(e) =>
                    handleNestedInputChange("delivery", "date", e.target.value)
                  }
                  error={!!errors.deliveryDate}
                  helperText={errors.deliveryDate}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Delivery Time Slot</InputLabel>
                  <Select
                    value={formData.delivery.timeSlot}
                    label="Delivery Time Slot"
                    onChange={(e) =>
                      handleNestedInputChange(
                        "delivery",
                        "timeSlot",
                        e.target.value
                      )
                    }
                    error={!!errors.deliveryTimeSlot}
                  >
                    {timeSlots.map((slot) => (
                      <MenuItem key={slot} value={slot}>
                        {slot}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Delivery Instructions (Optional)"
                  value={formData.delivery.instructions}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "delivery",
                      "instructions",
                      e.target.value
                    )
                  }
                  placeholder="e.g., Ring doorbell, Leave with doorman"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preferences & Review
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Cleaning Preferences
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Detergent Type</InputLabel>
                  <Select
                    value={formData.customerPreferences.detergentType}
                    label="Detergent Type"
                    onChange={(e) =>
                      handleNestedInputChange(
                        "customerPreferences",
                        "detergentType",
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Hypoallergenic">Hypoallergenic</MenuItem>
                    <MenuItem value="Eco-friendly">Eco-friendly</MenuItem>
                    <MenuItem value="Fragrance-free">Fragrance-free</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.customerPreferences.fabricSoftener}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "customerPreferences",
                          "fabricSoftener",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Add Fabric Softener"
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Starch Level</InputLabel>
                  <Select
                    value={formData.customerPreferences.starchLevel}
                    label="Starch Level"
                    onChange={(e) =>
                      handleNestedInputChange(
                        "customerPreferences",
                        "starchLevel",
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value="None">None</MenuItem>
                    <MenuItem value="Light">Light</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Heavy">Heavy</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.customerPreferences.ironing}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "customerPreferences",
                          "ironing",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Include Ironing"
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isUrgent}
                      onChange={(e) =>
                        handleInputChange("isUrgent", e.target.checked)
                      }
                    />
                  }
                  label="Mark as Urgent (Additional charges may apply)"
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Normal">Normal</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Additional Notes (Optional)"
                  value={formData.customerNotes}
                  onChange={(e) =>
                    handleInputChange("customerNotes", e.target.value)
                  }
                  multiline
                  rows={3}
                  placeholder="Any special instructions or requests..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Order Summary
                </Typography>

                <Card sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Items ({formData.items.length})
                  </Typography>
                  {formData.items.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {item.quantity}x {item.type} ({item.service})
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {formatCurrency(calculateItemPrice(item))}
                      </Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1">Subtotal:</Typography>
                    <Typography variant="body1">
                      {formatCurrency(calculateTotal().subtotal)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Tax (10%):
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(calculateTotal().tax)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(calculateTotal().total)}
                    </Typography>
                  </Box>
                </Card>

                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Service Type: {formData.serviceType}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Pickup: {formData.pickup.date} at {formData.pickup.timeSlot}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Delivery: {formData.delivery.date} at{" "}
                    {formData.delivery.timeSlot}
                  </Typography>
                  {formData.isUrgent && (
                    <Chip
                      label="URGENT"
                      color="error"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                  {formData.priority !== "Normal" && (
                    <Chip
                      label={formData.priority}
                      color="primary"
                      size="small"
                      sx={{ mt: 1, ml: 1 }}
                    />
                  )}
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard")}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          Create New Order
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fill in the details below to create your laundry order
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent(activeStep)}
          </motion.div>
        </AnimatePresence>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <PaymentIcon />
                }
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  },
                }}
              >
                {loading ? "Creating Order..." : "Create Order"}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  },
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
