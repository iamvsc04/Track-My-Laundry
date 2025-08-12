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
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile, updateNotificationPreferences } from "../utils/api";
import { toast } from "react-toastify";

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

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

  useEffect(() => {
    // Initialize form with user data
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
        address: user.profile?.address || "",
        city: user.profile?.city || "",
        state: user.profile?.state || "",
        pincode: user.profile?.pincode || "",
        detergentType: user.profile?.detergentType || "Regular",
        fabricSoftener: user.profile?.fabricSoftener || false,
        starchLevel: user.profile?.starchLevel || "None",
        ironing: user.profile?.ironing || false,
      });

      setNotificationPrefs({
        email: user.notifications?.email || true,
        sms: user.notifications?.sms || true,
        push: user.notifications?.push || true,
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
    }
  }, [user]);

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
      // For now, simulate API call. Replace with actual API call
      // await updateProfile(token, profileForm);

      // Update local user state
      const updatedUser = {
        ...user,
        ...profileForm,
        profile: {
          ...user.profile,
          address: profileForm.address,
          city: profileForm.city,
          state: profileForm.state,
          pincode: profileForm.pincode,
          detergentType: profileForm.detergentType,
          fabricSoftener: profileForm.fabricSoftener,
          starchLevel: profileForm.starchLevel,
          ironing: profileForm.ironing,
        },
      };

      updateUser(updatedUser);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
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

      updateUser(updatedUser);
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

    updateUser(updatedUser);
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

    try {
      setLoading(true);
      // For now, simulate API call. Replace with actual API call
      // await changePassword(token, passwordForm);

      toast.success("Password changed successfully!");
      setPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: "3rem",
                }}
              >
                {user?.name?.charAt(0) || "U"}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {user?.name || "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email || "user@example.com"}
              </Typography>
              <Chip
                label="Premium Member"
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
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
                <Typography variant="h6">Personal Information</Typography>
                <Box>
                  {editing ? (
                    <>
                      <Button
                        startIcon={<SaveIcon />}
                        variant="contained"
                        onClick={handleSaveProfile}
                        disabled={loading}
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        startIcon={<CancelIcon />}
                        variant="outlined"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
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
            <Typography variant="h6">Notification Preferences</Typography>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={handleSaveNotifications}
              disabled={loading}
            >
              Save Preferences
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Communication Channels
              </Typography>
              <List>
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
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Types
              </Typography>
              <List>
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
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderThemeTab = () => (
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
            <Typography variant="h6">Theme & Display</Typography>
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
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
          Profile & Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your profile, preferences, and account settings
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="profile tabs"
        >
          <Tab label="Profile" />
          <Tab label="Notifications" />
          <Tab label="Theme" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 0 && renderProfileTab()}
        {activeTab === 1 && renderNotificationsTab()}
        {activeTab === 2 && renderThemeTab()}
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
    </Container>
  );
}
