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
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Slide,
  Grow,
  Collapse,
  Skeleton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  PhotoCamera as PhotoCameraIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  LocalLaundryService as LaundryIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationCenter from "../components/Notifications/NotificationCenter";
import NotificationBadge from "../components/Notifications/NotificationBadge";
import { 
  updateProfile, 
  updateNotificationPreferences, 
  changePassword,
  getOrders,
  getOrderAnalytics,
  getProfile,
  formatCurrency,
  formatDate,
  getStatusColor,
  getLoyaltyProfile,
  getRewardsHistory,
  getRedemptionOptions,
  redeemPoints,
  getLeaderboard,
  getAchievementProgress,
  processReferral
} from "../utils/api";
import { toast } from "react-toastify";
import { styled } from "@mui/material/styles";
import { ThemeToggleIcon } from '../components/ThemeToggle';

// Enhanced Glassmorphic components
const StyledCard = styled(motion.create(Card))(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
  overflow: "visible",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  }
}));

const StatsCard = styled(Card)(({ theme, color = "primary" }) => {
  const colors = {
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    success: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    warning: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    info: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  };
  return {
    background: colors[color],
    borderRadius: 16,
    padding: theme.spacing(2),
    position: "relative",
    overflow: "hidden",
    color: "white",
    "&::after": {
      content: '""',
      position: "absolute",
      top: -50,
      right: -50,
      width: 100,
      height: 100,
      background: "rgba(255,255,255,0.1)",
      borderRadius: "50%",
    },
  };
});

export default function Profile() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [orderPage, setOrderPage] = useState(0);
  const [orderRowsPerPage, setOrderRowsPerPage] = useState(5);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [profileStats, setProfileStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
    favoriteService: "Wash & Fold"
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    address: user?.profile?.address || "",
    city: user?.profile?.city || "",
    state: user?.profile?.state || "",
    pincode: user?.profile?.pincode || "",
    detergentType: user?.profile?.detergentType || "Regular",
    fabricSoftener: user?.profile?.fabricSoftener || false,
    starchLevel: user?.profile?.starchLevel || "None",
    ironing: user?.profile?.ironing || false,
  });

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: user?.notifications?.email || true,
    sms: user?.notifications?.sms || true,
    push: user?.notifications?.push || true,
    orderUpdates: true,
    paymentReminders: true,
    promotionalOffers: false,
    deliveryNotifications: true,
  });

  // Theme preferences
  const [themePrefs, setThemePrefs] = useState({
    theme: user?.theme || "light",
    autoDarkMode: false,
    compactMode: false,
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Show/hide password
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Address management
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "Home",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      isDefault: true,
    },
  ]);

  const [newAddress, setNewAddress] = useState({
    type: "Home",
    address: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  // Rewards State
  const [loyaltyProfile, setLoyaltyProfile] = useState(null);
  const [redemptionOptions, setRedemptionOptions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Initialize form with user data
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.mobile || user.phone || "",
        avatar: user.profile?.avatar || "",
        address: user.profile?.address?.street || "",
        city: user.profile?.address?.city || "",
        state: user.profile?.address?.state || "",
        pincode: user.profile?.address?.pincode || "",
        detergentType: user.profile?.preferences?.detergentType || "Regular",
        fabricSoftener: user.profile?.preferences?.fabricSoftener || false,
        starchLevel: user.profile?.preferences?.starchLevel || "None",
        ironing: user.profile?.preferences?.ironing || false,
      });

      setNotificationPrefs({
        email: user.notifications?.email ?? true,
        sms: user.notifications?.sms ?? true,
        push: user.notifications?.push ?? true,
        orderUpdates: true,
        paymentReminders: true,
        promotionalOffers: false,
        deliveryNotifications: true,
      });

      setThemePrefs({
        theme: user.theme || "light",
        autoDarkMode: false,
        compactMode: false,
      });
      
      // Set avatar preview if exists
      if (user.profile?.avatar) {
        setAvatarPreview(user.profile.avatar);
      }
    }
    
    // Fetch additional data
    fetchOrderHistory();
    fetchAnalytics();
  }, [user]);

  const fetchOrderHistory = async () => {
    try {
      const response = await getOrders({ limit: 100 });
      setOrderHistory(response.data.data || []);
      
      // Calculate stats
      const orders = response.data.data || [];
      const stats = {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0),
        completedOrders: orders.filter(order => order.status === 'Delivered').length,
        favoriteService: getMostFrequentService(orders)
      };
      setProfileStats(stats);
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await getOrderAnalytics('90');
      setAnalytics(response.data.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchRewardsData = async () => {
    try {
      const [profileRes, optionsRes, leaderboardRes, achievementsRes] = await Promise.all([
        getLoyaltyProfile(),
        getRedemptionOptions(),
        getLeaderboard({ limit: 5 }),
        getAchievementProgress()
      ]);
      setLoyaltyProfile(profileRes.data.data);
      setRedemptionOptions(optionsRes.data.data);
      setLeaderboard(leaderboardRes.data.data.leaderboard);
      setAchievements(achievementsRes.data.data.achievements);
    } catch (error) {
       console.error("Error fetching rewards data", error);
    }
  };

  useEffect(() => {
    if(activeTab === 2) { 
       fetchRewardsData();
    }
  }, [activeTab]);

  const getMostFrequentService = (orders) => {
    const serviceCount = orders.reduce((acc, order) => {
      acc[order.serviceType] = (acc[order.serviceType] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(serviceCount).reduce((a, b) => 
      serviceCount[a] > serviceCount[b] ? a : b, 'Wash & Fold'
    );
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileInputChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleThemeChange = (field, value) => {
    setThemePrefs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      const profileData = {
        name: profileForm.name,
        email: profileForm.email,
        mobile: profileForm.phone,
        profile: {
          avatar: avatarPreview || profileForm.avatar,
          address: {
            street: profileForm.address,
            city: profileForm.city,
            state: profileForm.state,
            pincode: profileForm.pincode,
          },
          preferences: {
            detergentType: profileForm.detergentType,
            fabricSoftener: profileForm.fabricSoftener,
            starchLevel: profileForm.starchLevel,
            ironing: profileForm.ironing,
          },
        },
      };

      const response = await updateProfile(profileData);
      
      // Update auth context with new user data
      const updatedUser = {
        ...user,
        ...response.data.user,
      };
      
      login(updatedUser, token);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressInputChange = (field, value) => {
    setNewAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAddress = () => {
    if (!newAddress.address || !newAddress.city || !newAddress.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const address = {
      ...newAddress,
      id: Date.now(),
    };
    
    setAddresses(prev => [...prev, address]);
    setNewAddress({
      type: "Home",
      address: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
    setAddressDialogOpen(false);
    toast.success("Address added successfully!");
  };

  const handleDeleteAddress = (id) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    toast.success("Address deleted successfully!");
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    toast.success("Default address updated!");
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      // Update notification preferences via API
      await updateNotificationPreferences(notificationPrefs);

      // Update local user state
      const updatedUser = {
        ...user,
        notifications: notificationPrefs,
      };

      login(updatedUser, token);
      toast.success("Notification preferences updated!");
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast.error("Failed to update notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = () => {
    // Update local user state
    const updatedUser = {
      ...user,
      theme: themePrefs.theme,
    };

    login(updatedUser, token);
    toast.success("Theme preferences updated!");
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Password changed successfully!");
      setPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPageChange = (event, newPage) => {
    setOrderPage(newPage);
  };

  const handleOrderRowsPerPageChange = (event) => {
    setOrderRowsPerPage(parseInt(event.target.value, 10));
    setOrderPage(0);
  };

  const handleRedeem = async (option) => {
      try {
         await redeemPoints({ ...option, type: option.type || 'discount' });
         toast.success("Reward redeemed successfully!");
         fetchRewardsData(); // refresh points
      } catch (error) {
         toast.error("Redemption failed: " + (error.response?.data?.message || error.message));
      }
  };





  const renderProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Grid container spacing={3}>
        {/* Profile Stats Overview */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard color="primary">
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {profileStats.totalOrders}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Orders
                    </Typography>
                  </Box>
                  <LaundryIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </StatsCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard color="success">
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {formatCurrency(profileStats.totalSpent)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Spent
                    </Typography>
                  </Box>
                  <PaymentIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </StatsCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard color="warning">
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {profileStats.completedOrders}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Completed
                    </Typography>
                  </Box>
                  <CheckIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </StatsCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard color="info">
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {profileStats.favoriteService}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Favorite Service
                    </Typography>
                  </Box>
                  <StarIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </StatsCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Profile Information */}
        <Grid size={{ xs: 12, md: 4 }}>
          <StyledCard>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                <Avatar
                  src={avatarPreview}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontSize: "3rem",
                    fontWeight: "bold",
                  }}
                >
                  {!avatarPreview && (user?.name?.charAt(0) || "U")}
                </Avatar>
                {editing && (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="avatar-upload"
                      type="file"
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload">
                      <IconButton
                        component="span"
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                      >
                        <PhotoCameraIcon />
                      </IconButton>
                    </label>
                  </>
                )}
              </Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {user?.name || "User"}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user?.email || "user@example.com"}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
                <Chip
                  icon={<VerifiedIcon />}
                  label="Verified"
                  color="success"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<StarIcon />}
                  label="Premium"
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Main Profile Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>Personal Information</Typography>
                <Box>
                  {editing ? (
                    <>
                      <Button
                        startIcon={<SaveIcon />}
                        variant="contained"
                        onClick={handleSaveProfile}
                        disabled={loading}
                        sx={{ 
                          mr: 1,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                          },
                        }}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Save"}
                      </Button>
                      <Button
                        startIcon={<CancelIcon />}
                        variant="outlined"
                        onClick={() => {
                          setEditing(false);
                          setAvatarPreview("");
                          setAvatarFile(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      startIcon={<EditIcon />}
                      variant="contained"
                      onClick={() => setEditing(true)}
                      sx={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        "&:hover": {
                          background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
                        },
                      }}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileForm.name}
                    onChange={(e) =>
                      handleProfileInputChange("name", e.target.value)
                    }
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileForm.email}
                    onChange={(e) =>
                      handleProfileInputChange("email", e.target.value)
                    }
                    disabled={!editing}
                    margin="normal"
                    type="email"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileForm.phone}
                    onChange={(e) =>
                      handleProfileInputChange("phone", e.target.value)
                    }
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profileForm.address}
                    onChange={(e) =>
                      handleProfileInputChange("address", e.target.value)
                    }
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={profileForm.city}
                    onChange={(e) =>
                      handleProfileInputChange("city", e.target.value)
                    }
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="State"
                    value={profileForm.state}
                    onChange={(e) =>
                      handleProfileInputChange("state", e.target.value)
                    }
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    value={profileForm.pincode}
                    onChange={(e) =>
                      handleProfileInputChange("pincode", e.target.value)
                    }
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Laundry Preferences
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Detergent Type</InputLabel>
                    <Select
                      value={profileForm.detergentType}
                      onChange={(e) =>
                        handleProfileInputChange(
                          "detergentType",
                          e.target.value
                        )
                      }
                      disabled={!editing}
                      label="Detergent Type"
                    >
                      <MenuItem value="Regular">Regular</MenuItem>
                      <MenuItem value="Mild">Mild</MenuItem>
                      <MenuItem value="Fragrance Free">Fragrance Free</MenuItem>
                      <MenuItem value="Eco-Friendly">Eco-Friendly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Starch Level</InputLabel>
                    <Select
                      value={profileForm.starchLevel}
                      onChange={(e) =>
                        handleProfileInputChange("starchLevel", e.target.value)
                      }
                      disabled={!editing}
                      label="Starch Level"
                    >
                      <MenuItem value="None">None</MenuItem>
                      <MenuItem value="Light">Light</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Heavy">Heavy</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileForm.fabricSoftener}
                        onChange={(e) =>
                          handleProfileInputChange(
                            "fabricSoftener",
                            e.target.checked
                          )
                        }
                        disabled={!editing}
                      />
                    }
                    label="Fabric Softener"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileForm.ironing}
                        onChange={(e) =>
                          handleProfileInputChange("ironing", e.target.checked)
                        }
                        disabled={!editing}
                      />
                    }
                    label="Ironing"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{
                    borderColor: "rgba(255,255,255,0.3)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.5)",
                      backgroundColor: "rgba(255,255,255,0.05)",
                    },
                  }}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        
        {/* Address Management */}
        <Grid size={{ xs: 12 }}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>Delivery Addresses</Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => setAddressDialogOpen(true)}
                  sx={{
                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #3d8bfe 0%, #0dd8e8 100%)",
                    },
                  }}
                >
                  Add Address
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                {addresses.map((address) => (
                  <Grid item xs={12} md={6} key={address.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        background: "rgba(255,255,255,0.08)",
                        border: address.isDefault 
                          ? "2px solid #4facfe" 
                          : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 2,
                        "&:hover": {
                          background: "rgba(255,255,255,0.12)",
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                              icon={address.type === "Home" ? <HomeIcon /> : <BusinessIcon />}
                              label={address.type}
                              size="small"
                              color={address.isDefault ? "primary" : "default"}
                              variant={address.isDefault ? "filled" : "outlined"}
                            />
                            {address.isDefault && (
                              <Chip
                                label="Default"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteAddress(address.id)}
                              sx={{ color: "error.main" }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                          {address.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {address.city}, {address.state} - {address.pincode}
                        </Typography>
                        
                        {!address.isDefault && (
                          <Button
                            size="small"
                            onClick={() => handleSetDefaultAddress(address.id)}
                            sx={{ mt: 1 }}
                          >
                            Set as Default
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderOrderHistoryTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Grid container spacing={3}>
        {/* Order Analytics */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard color="primary">
                <Box sx={{ textAlign: "center" }}>
                  <LaundryIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {orderHistory.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Orders
                  </Typography>
                </Box>
              </StatsCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard color="success">
                <Box sx={{ textAlign: "center" }}>
                  <CheckIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {orderHistory.filter(o => o.status === 'Delivered').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Completed
                  </Typography>
                </Box>
              </StatsCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard color="warning">
                <Box sx={{ textAlign: "center" }}>
                  <TrendingUpIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {formatCurrency(orderHistory.reduce((sum, order) => sum + (order.total || 0), 0))}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Spent
                  </Typography>
                </Box>
              </StatsCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatsCard color="info">
                <Box sx={{ textAlign: "center" }}>
                  <StarIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, textAlign: "center" }}>
                    {getMostFrequentService(orderHistory)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Favorite Service
                  </Typography>
                </Box>
              </StatsCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Order History Table */}
        <Grid size={{ xs: 12 }}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Orders
              </Typography>
              
              {orderHistory.length > 0 ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderHistory
                          .slice(orderPage * orderRowsPerPage, orderPage * orderRowsPerPage + orderRowsPerPage)
                          .map((order) => (
                            <TableRow
                              key={order._id}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'rgba(255,255,255,0.05)',
                                },
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  #{order.orderNumber}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LaundryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    {order.serviceType}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(order.createdAt)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={order.status}
                                  color={getStatusColor(order.status)}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {formatCurrency(order.total)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="View Details">
                                    <IconButton
                                      size="small"
                                      onClick={() => navigate(`/order/${order._id}`)}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {order.status === 'Delivered' && (
                                    <Tooltip title="Download Receipt">
                                      <IconButton size="small">
                                        <ReceiptIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={orderHistory.length}
                    rowsPerPage={orderRowsPerPage}
                    page={orderPage}
                    onPageChange={handleOrderPageChange}
                    onRowsPerPageChange={handleOrderRowsPerPageChange}
                    sx={{
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      mt: 2,
                    }}
                  />
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <LaundryIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Orders Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start your laundry journey by creating your first order
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/create-order')}
                    sx={{ mt: 2 }}
                  >
                    Create Order
                  </Button>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderNotificationsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Grid container spacing={3}>
        {/* Notification Overview Card */}
        <Grid size={{ xs: 12 }}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <NotificationsIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage your notification preferences and view recent updates
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<NotificationsIcon />}
                  onClick={() => setNotificationCenterOpen(true)}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    },
                  }}
                >
                  View All Notifications
                </Button>
              </Box>

              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  background: "rgba(102, 126, 234, 0.1)",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  color: "primary.main",
                  '& .MuiAlert-icon': {
                    color: "primary.main",
                  },
                }}
              >
                Click "View All Notifications" to see your complete notification history, search notifications, and manage advanced settings.
              </Alert>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Notification Preferences */}
        <Grid size={{ xs: 12 }}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" fontWeight={600}>Notification Preferences</Typography>
                <Button
                  startIcon={<SaveIcon />}
                  variant="contained"
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  sx={{
                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #3d8bfe 0%, #0dd8e8 100%)",
                    },
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : "Save Preferences"}
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Communication Channels
                  </Typography>
                  <List sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email Notifications"
                        secondary="Receive updates via email"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationPrefs.email}
                          onChange={(e) =>
                            handleNotificationChange("email", e.target.checked)
                          }
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="SMS Notifications"
                        secondary="Receive updates via SMS"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationPrefs.sms}
                          onChange={(e) =>
                            handleNotificationChange("sms", e.target.checked)
                          }
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <NotificationsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Push Notifications"
                        secondary="Receive updates via push notifications"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationPrefs.push}
                          onChange={(e) =>
                            handleNotificationChange("push", e.target.checked)
                          }
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Notification Types
                  </Typography>
                  <List sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <ListItem>
                      <ListItemText
                        primary="Order Updates"
                        secondary="Status changes and progress updates"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationPrefs.orderUpdates}
                          onChange={(e) =>
                            handleNotificationChange(
                              "orderUpdates",
                              e.target.checked
                            )
                          }
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Payment Reminders"
                        secondary="Payment due dates and confirmations"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationPrefs.paymentReminders}
                          onChange={(e) =>
                            handleNotificationChange(
                              "paymentReminders",
                              e.target.checked
                            )
                          }
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Delivery Notifications"
                        secondary="Pickup and delivery updates"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationPrefs.deliveryNotifications}
                          onChange={(e) =>
                            handleNotificationChange(
                              "deliveryNotifications",
                              e.target.checked
                            )
                          }
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Promotional Offers"
                        secondary="Special deals and discounts"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationPrefs.promotionalOffers}
                          onChange={(e) =>
                            handleNotificationChange(
                              "promotionalOffers",
                              e.target.checked
                            )
                          }
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderSettingsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>App Settings</Typography>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={handleSaveTheme}
            >
              Save Theme
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Theme</InputLabel>
                <Select
                  value={themePrefs.theme}
                  onChange={(e) => handleThemeChange("theme", e.target.value)}
                  label="Theme"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto (System)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={themePrefs.autoDarkMode}
                    onChange={(e) =>
                      handleThemeChange("autoDarkMode", e.target.checked)
                    }
                  />
                }
                label="Auto Dark Mode"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={themePrefs.compactMode}
                    onChange={(e) =>
                      handleThemeChange("compactMode", e.target.checked)
                    }
                  />
                }
                label="Compact Mode"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Preview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Theme changes will be applied immediately across the application.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background.gradient,
        pb: 4,
      }}
    >
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      {/* Enhanced Header */}
      <Slide direction="down" in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <StyledCard sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={avatarPreview || user?.profile?.avatar}
                sx={{
                  width: 80,
                  height: 80,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: "2rem",
                  fontWeight: "bold",
                }}
              >
                {!avatarPreview && (user?.name?.charAt(0) || "U")}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 0.5,
                  }}
                >
                  Profile & Settings
                </Typography>
                <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                  Welcome back, {user?.name || "User"}! 👋
                </Typography>
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  Manage your profile, preferences, and account settings
                </Typography>
              </Box>
              
              {/* Notification & Theme Toggle */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <NotificationBadge
                  unreadCount={0}
                  size="large"
                  color="primary"
                  sx={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    "&:hover": {
                      background: "rgba(255,255,255,0.2)",
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.3s ease",
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                />
                <ThemeToggleIcon size="large" />
              </Box>
            </Box>
          </StyledCard>
        </Box>
      </Slide>

      {/* Enhanced Tabs */}
      <StyledCard sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Profile" icon={<PersonIcon />} />
          <Tab label="Order History" icon={<HistoryIcon />} />
          <Tab label="Notifications" icon={<NotificationsIcon />} />
          <Tab label="Settings" icon={<SettingsIcon />} />
        </Tabs>
      </StyledCard>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 0 && renderProfileTab()}
        {activeTab === 1 && renderOrderHistoryTab()}
        {activeTab === 2 && renderNotificationsTab()}
        {activeTab === 3 && renderSettingsTab()}
      </AnimatePresence>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type={showPasswords.current ? "text" : "password"}
            value={passwordForm.currentPassword}
            onChange={(e) =>
              handlePasswordInputChange("currentPassword", e.target.value)
            }
            margin="normal"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => togglePasswordVisibility("current")}
                  edge="end"
                >
                  {showPasswords.current ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              ),
            }}
          />
          <TextField
            fullWidth
            label="New Password"
            type={showPasswords.new ? "text" : "password"}
            value={passwordForm.newPassword}
            onChange={(e) =>
              handlePasswordInputChange("newPassword", e.target.value)
            }
            margin="normal"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => togglePasswordVisibility("new")}
                  edge="end"
                >
                  {showPasswords.new ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type={showPasswords.confirm ? "text" : "password"}
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              handlePasswordInputChange("confirmPassword", e.target.value)
            }
            margin="normal"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => togglePasswordVisibility("confirm")}
                  edge="end"
                >
                  {showPasswords.confirm ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Change Password"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Address Management Dialog */}
      <Dialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationIcon color="primary" />
            Add New Address
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Address Type</InputLabel>
              <Select
                value={newAddress.type}
                label="Address Type"
                onChange={(e) => handleAddressInputChange("type", e.target.value)}
              >
                <MenuItem value="Home">Home</MenuItem>
                <MenuItem value="Office">Office</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={newAddress.address}
              onChange={(e) => handleAddressInputChange("address", e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={newAddress.city}
                  onChange={(e) => handleAddressInputChange("city", e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="State"
                  value={newAddress.state}
                  onChange={(e) => handleAddressInputChange("state", e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) => handleAddressInputChange("pincode", e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newAddress.isDefault}
                      onChange={(e) => handleAddressInputChange("isDefault", e.target.checked)}
                    />
                  }
                  label="Set as default"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddAddress}
            variant="contained"
            disabled={!newAddress.address || !newAddress.city || !newAddress.pincode}
          >
            Add Address
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Center */}
      <NotificationCenter
        open={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />
    </Container>
    </Box>
  );
}
