import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Avatar,
  CircularProgress,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import {
  LocalLaundryService as LaundryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ArrowForward as ArrowForwardIcon
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import { getOrders, formatCurrency, formatDate } from "../utils/api";
import LaundryLoader from '../components/animations/LaundryLoaders';

const StyledCard = styled(motion.create(Paper))(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main
  }
}));

const OrderItem = ({ order, index, onClick }) => {
  const theme = useTheme();
  
  const getStatusColor = (status) => {
    const colors = {
      'Pending': theme.palette.warning,
      'Washing': theme.palette.info,
      'Ready for Pickup': theme.palette.success,
      'Delivered': theme.palette.primary,
      'Cancelled': theme.palette.error,
    };
    return colors[status] || theme.palette.grey;
  };

  const statusColor = getStatusColor(order.status);

  return (
    <StyledCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      elevation={0}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={2} md={1}>
           <Avatar sx={{ bgcolor: statusColor.light, color: statusColor.dark, width: 56, height: 56 }}>
             <LaundryIcon />
           </Avatar>
        </Grid>
        <Grid item xs={12} sm={4} md={5}>
          <Typography variant="h6" fontWeight={700}>
            {order.orderNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(order.createdAt)} • {order.items?.length || 0} items
          </Typography>
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
           <Chip 
              label={order.status}
              sx={{ 
                bgcolor: statusColor.light, 
                color: statusColor.dark, 
                fontWeight: 700,
                borderRadius: 2
              }} 
            />
        </Grid>
        <Grid item xs={6} sm={3} md={3} sx={{ textAlign: 'right' }}>
           <Typography variant="h6" fontWeight={700} color="primary">
              {formatCurrency(order.total)}
           </Typography>
        </Grid>
      </Grid>
    </StyledCard>
  );
};

export default function Orders() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LaundryLoader type="washing" size={80} message="Loading your orders..." />
      </Box>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight={800}>
            Your Orders
          </Typography>
          <Button variant="contained" startIcon={<ArrowForwardIcon />} onClick={() => navigate('/create-order')}>
            New Order
          </Button>
        </Box>

        <Paper sx={{ mb: 4, p: 2, borderRadius: 3 }} elevation={0} variant="outlined">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                 <FormControl size="small" sx={{ minWidth: 150 }}>
                   <InputLabel>Status</InputLabel>
                   <Select
                     value={statusFilter}
                     label="Status"
                     onChange={(e) => setStatusFilter(e.target.value)}
                   >
                     <MenuItem value="All">All Statuses</MenuItem>
                     <MenuItem value="Pending">Pending</MenuItem>
                     <MenuItem value="Washing">Washing</MenuItem>
                     <MenuItem value="Ready for Pickup">Ready</MenuItem>
                     <MenuItem value="Delivered">Delivered</MenuItem>
                     <MenuItem value="Cancelled">Cancelled</MenuItem>
                   </Select>
                 </FormControl>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Stack spacing={2}>
          <AnimatePresence>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <OrderItem 
                  key={order._id} 
                  order={order} 
                  index={index} 
                  onClick={() => navigate(`/order/${order._id}`)}
                />
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                 <Typography variant="h6" color="text.secondary">No orders found</Typography>
              </Box>
            )}
          </AnimatePresence>
        </Stack>
      </Container>
    </MainLayout>
  );
}
