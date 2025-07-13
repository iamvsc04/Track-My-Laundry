import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const statusColors = {
  yet_to_wash: 'default',
  washing: 'info',
  washed: 'primary',
  ironing: 'warning',
  ready_for_pickup: 'success',
  picked_up: 'secondary'
};

const statusOptions = [
  { value: 'yet_to_wash', label: 'Yet to Wash' },
  { value: 'washing', label: 'Washing' },
  { value: 'washed', label: 'Washed' },
  { value: 'ironing', label: 'Ironing' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'picked_up', label: 'Picked Up' }
];

const AdminDashboard = () => {
  const [laundry, setLaundry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [status, setStatus] = useState('');
  const [shelfLocation, setShelfLocation] = useState('');
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchLaundry = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/laundry`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setLaundry(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching laundry:', error);
        setLoading(false);
      }
    };

    fetchLaundry();
  }, [user]);

  const handleStatusUpdate = async () => {
    try {
      await axios.put(
        `${API_URL}/api/laundry/${selectedItem._id}/status`,
        {
          status,
          shelfLocation
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      // Update local state
      setLaundry(laundry.map(item =>
        item._id === selectedItem._id
          ? { ...item, status, shelfLocation }
          : item
      ));

      setOpenDialog(false);
      setSelectedItem(null);
      setStatus('');
      setShelfLocation('');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleOpenDialog = (item) => {
    setSelectedItem(item);
    setStatus(item.status);
    setShelfLocation(item.shelfLocation || '');
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Admin Dashboard
            </Typography>
          </Paper>
        </Grid>

        {/* Laundry Items Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" gutterBottom>
              Laundry Items
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tracking #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Shelf Location</TableCell>
                    <TableCell>Drop-off Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {laundry.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.trackingNumber}</TableCell>
                      <TableCell>{item.user.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status.replace(/_/g, ' ').toUpperCase()}
                          color={statusColors[item.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.shelfLocation || '-'}</TableCell>
                      <TableCell>
                        {new Date(item.dropOffDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenDialog(item)}
                        >
                          Update Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Laundry Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ mb: 2 }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Shelf Location"
              value={shelfLocation}
              onChange={(e) => setShelfLocation(e.target.value)}
              placeholder="e.g., W_A1, I_B2, R_C3"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 