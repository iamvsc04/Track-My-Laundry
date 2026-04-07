import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  useMediaQuery,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Stack
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import {
  Add as AddIcon,
  LocalLaundryService as LaundryIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
  LocalShipping as DeliveryIcon,
  Receipt as ReceiptIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/Layout/MainLayout";

// Import our enhanced animation components
import LaundryLoader from '../components/animations/LaundryLoaders';
import { 
  useScrollAnimation, 
  useCounterAnimation,
  useTypingAnimation,
  useFeedbackAnimation,
  animationVariants,
} from '../hooks/useAnimations';
import { getOrders, getOrderAnalytics, getProfile, formatCurrency, formatDate, getStatusColor } from '../utils/api';

// Styled Components
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

const StatCard = ({ title, value, icon, color, delay }) => {
  const theme = useTheme();
  
  return (
    <StyledCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom textTransform="uppercase" letterSpacing={1}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color.main}15`,
              color: color.main,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </StyledCard>
  );
};

const QuickActionCard = ({ title, description, icon, onClick, color }) => {
  const theme = useTheme();
  
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Paper
        onClick={onClick}
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          cursor: 'pointer',
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'all 0.2s',
          '&:hover': {
             borderColor: color.main,
             boxShadow: `0 4px 20px ${color.main}15`
          }
        }}
      >
          <Box sx={{ mb: 2, p: 1.5, bgcolor: `${color.main}10`, width: 'fit-content', borderRadius: 2, color: color.main }}>
            {icon}
          </Box>
          <Typography variant="h6" fontWeight={700} gutterBottom color="text.primary">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>

      </Paper>
    </motion.div>
  );
};

const RecentOrderRow = ({ order, index, onOpen, showCustomer }) => {
  const theme = useTheme();
  const statusColor = getStatusColor(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Paper
        variant="outlined"
        onClick={onOpen}
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 3,
          cursor: 'pointer',
          borderColor: 'transparent',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          }
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: `${theme.palette[statusColor]?.main || theme.palette.grey[500]}15`, color: theme.palette[statusColor]?.main || theme.palette.grey[500] }}>
            <LaundryIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {order.orderNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(order.createdAt)} • {order.items?.length || 0} items
            </Typography>
            {showCustomer && (
              <Typography variant="caption" color="text.secondary" display="block">
                Customer: {order.user?.name || "Customer"}
              </Typography>
            )}
          </Box>
        </Stack>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
           <Chip 
              label={order.status}
              size="small"
              color={statusColor}
              sx={{ 
                fontWeight: 700,
                borderRadius: 2
              }} 
            />
            <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 80, textAlign: 'right' }}>
              {formatCurrency(order.total)}
            </Typography>
            <Tooltip title="Open order">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen();
                }}
              >
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isAdmin = user?.role === "admin" || user?.role === "super-admin";

  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    readyOrders: 0,
  });

  // Animations
  const { controls: statsControls, ref: statsRef } = useScrollAnimation(0.2);
  const totalOrdersCount = useCounterAnimation(stats.totalOrders, 2);
  const activeOrdersCount = useCounterAnimation(stats.activeOrders, 1.5);
  const readyOrdersCount = useCounterAnimation(stats.readyOrders, 1);

  const greeting = `Welcome back, ${user?.name?.split(' ')[0] || "Admin"}!`;
  const { displayText: typedGreeting } = useTypingAnimation(greeting, 50);
  const hasFetchedRef = useRef(false);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        getOrders({ limit: 5 }),
        getOrderAnalytics(),
      ]);

      const ordersData = ordersRes.data.data || [];
      setOrders(ordersData);

      const analyticsData = statsRes.data.data || {};
      const statusCounts = analyticsData.analytics || [];
      
      const readyCount = statusCounts.find(s => s._id === 'Ready for Pickup')?.count || 0;
      const activeCount = statusCounts
        .filter(s => !['Delivered', 'Cancelled', 'Ready for Pickup'].includes(s._id))
        .reduce((sum, item) => sum + item.count, 0);

      setStats({
        totalOrders: analyticsData.totalOrders || 0,
        readyOrders: readyCount,
        activeOrders: activeCount
      });

      // Update Profile
      const profileRes = await getProfile();
      if (profileRes.data && profileRes.data.data) {
        updateUser(profileRes.data.data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // React 18 StrictMode mounts effects twice in dev; guard to avoid double-fetching.
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchDashboardData();
  }, []);

  if (loading) {
     return (
       <Box
         sx={{
           minHeight: "100vh",
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           background: theme.palette.background.default
         }}
       >
         <LaundryLoader type="washing" size={100} message="Preparing your dashboard..." />
       </Box>
     );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          {typedGreeting}
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={500}>
          Here's what's happening with your laundry today.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }} ref={statsRef}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Orders" 
            value={totalOrdersCount} 
            icon={<LaundryIcon fontSize="large" />} 
            color={theme.palette.primary} 
            delay={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Active" 
            value={activeOrdersCount} 
            icon={<ScheduleIcon fontSize="large" />} 
            color={theme.palette.warning} 
            delay={0.1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Ready" 
            value={readyOrdersCount} 
            icon={<CheckIcon fontSize="large" />} 
            color={theme.palette.success} 
            delay={0.2}
          />
        </Grid>
      </Grid>

      {/* Main Content Split */}
      <Grid container spacing={4}>
        {/* Left Column: Recent Orders */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight={700}>
              Recent Orders
            </Typography>
            <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/orders')}>
              View All
            </Button>
          </Box>
          
          <StyledCard>
            <CardContent sx={{ p: 0 }}>
              {orders.length > 0 ? (
                <Box sx={{ p: 2 }}>
                  {orders.map((order, index) => (
                    <RecentOrderRow
                      key={order._id}
                      order={order}
                      index={index}
                      onOpen={() => navigate(`/order/${order._id}`)}
                      showCustomer={user?.role === "admin" || user?.role === "super-admin"}
                    />
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">No orders yet</Typography>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/create-order')}>
                    Create your first order
                  </Button>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Right Column: Quick Actions & Promo */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          <Stack spacing={3}>
             <QuickActionCard
               title="New Order"
               description="Schedule a pickup for your laundry"
               icon={<AddIcon fontSize="large" />}
               onClick={() => navigate('/create-order')}
               color={theme.palette.primary}
             />
             {/* Pricing removed from user dashboard */}
             

          </Stack>
        </Grid>
      </Grid>
    </MainLayout>
  );
}
