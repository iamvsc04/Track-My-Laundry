import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Switch,
  Container,
  Grid,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getOrders, createOrderWithNfc, completeOrder } from "../utils/api";

const menuOptions = [
  { text: "Orders", icon: <LocalLaundryServiceIcon /> },
  { text: "Notifications", icon: <NotificationsIcon /> },
  { text: "Settings", icon: <SettingsIcon /> },
];

export default function Dashboard() {
  const { user, token } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("Orders");
  const [tab, setTab] = useState(0);
  const [themeMode, setThemeMode] = useState("light"); // For demo; connect to MUI theme provider for real
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Simulate loading state
  const [loading, setLoading] = useState(true);

  // Simulate order data
  const [orders, setOrders] = useState([]);

  // Show welcome toast on mount
  useEffect(() => {
    toast.success(`Welcome, ${user?.name || "User"}, to the application!`, {
      toastId: "welcome",
    });
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await getOrders(token);
        setOrders(res.data);
      } catch (err) {
        toast.error("Failed to fetch orders");
      }
      setLoading(false);
    };
    fetchOrders();
  }, [token]);

  // Simulate adding a new NFC bag to "Yet to be Washed"
  const handleAddNFCBag = async () => {
    try {
      const res = await createOrderWithNfc(token, {
        shelfLocation: "W_A2",
        status: "Yet to be Washed",
      });
      setOrders((prev) => [...prev, res.data]);
      toast.info("A new NFC-enabled bag has been placed in Yet to be Washed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add NFC bag");
    }
  };

  // Filter orders by tab
  const filteredOrders = orders.filter((order) => {
    if (tab === 0) return order.type === "Ongoing";
    if (tab === 1) return order.type === "Completed";
    if (tab === 2) return order.type === "Yet to Start";
    return true;
  });

  // Handlers
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleProfileMenuOpen = (e) => setProfileMenuAnchor(e.currentTarget);
  const handleProfileMenuClose = () => setProfileMenuAnchor(null);
  const handleMenuClick = (text) => {
    setSelectedMenu(text);
    setDrawerOpen(false);
  };
  const handleTabChange = (e, newValue) => setTab(newValue);

  // Theme toggle (for demo)
  const handleThemeToggle = () =>
    setThemeMode(themeMode === "light" ? "dark" : "light");

  const handleCompleteOrder = async (id) => {
    try {
      const res = await completeOrder(token, id);
      setOrders((prev) => prev.map((o) => (o._id === id ? res.data : o)));
      toast.success("Order marked as completed and tag freed!");
    } catch (err) {
      toast.error("Failed to complete order");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: themeMode === "light" ? "#f7fafc" : "#121212",
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      {/* AppBar */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleProfileMenuOpen}>
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer (Burger Menu) */}
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuOptions.map((option) => (
              <ListItem
                button
                key={option.text}
                onClick={() => handleMenuClick(option.text)}
              >
                <ListItemIcon>{option.icon}</ListItemIcon>
                <ListItemText primary={option.text} />
              </ListItem>
            ))}
            {/* Theme toggle in settings */}
            {selectedMenu === "Settings" && (
              <ListItem>
                <ListItemIcon>
                  {themeMode === "light" ? <WbSunnyIcon /> : <DarkModeIcon />}
                </ListItemIcon>
                <ListItemText primary="Theme" />
                <Switch
                  checked={themeMode === "dark"}
                  onChange={handleThemeToggle}
                />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          Change Phone Number (OTP)
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          Change Email Address (OTP)
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {selectedMenu === "Orders" && (
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Tabs value={tab} onChange={handleTabChange} centered>
              <Tab label="Ongoing" />
              <Tab label="Completed" />
              <Tab label="Yet to Start" />
            </Tabs>
            <Box mt={3}>
              {/* Simulate NFC bag placement for demo */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddNFCBag}
                sx={{ mb: 2 }}
              >
                Simulate NFC Bag Placement (Yet to be Washed)
              </Button>
              {loading ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  minHeight={200}
                >
                  <CircularProgress color="primary" size={60} />
                  <Typography mt={2} color="primary" fontWeight="bold">
                    Loading your laundry...
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredOrders.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography color="text.secondary" align="center">
                        No orders found in this category.
                      </Typography>
                    </Grid>
                  ) : (
                    filteredOrders.map((order) => (
                      <Grid item xs={12} sm={6} key={order._id}>
                        <Paper
                          elevation={3}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Avatar
                            sx={{ bgcolor: "#00bcd4", width: 56, height: 56 }}
                          >
                            <LocalLaundryServiceIcon sx={{ fontSize: 32 }} />
                          </Avatar>
                          <Box>
                            <Typography fontWeight="bold" color="primary">
                              {order.code}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {order.status}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              NFC Tag: {order.nfcTag}
                            </Typography>
                            {order.status !== "Completed" && (
                              <Button
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ mt: 1 }}
                                onClick={() => handleCompleteOrder(order._id)}
                              >
                                Mark as Completed
                              </Button>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    ))
                  )}
                </Grid>
              )}
            </Box>
          </Paper>
        )}

        {selectedMenu === "Notifications" && (
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Notifications
            </Typography>
            <Typography color="text.secondary">
              No notifications yet.
            </Typography>
          </Paper>
        )}

        {selectedMenu === "Settings" && (
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Settings
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography>Theme:</Typography>
              <Switch
                checked={themeMode === "dark"}
                onChange={handleThemeToggle}
              />
              {themeMode === "light" ? <WbSunnyIcon /> : <DarkModeIcon />}
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
