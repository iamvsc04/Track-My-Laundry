import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
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

const Dashboard = () => {
  const [laundry, setLaundry] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchLaundry = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/laundry/history`, {
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
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Welcome, {user.name}!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ alignSelf: 'flex-start' }}
            >
              New Laundry Drop-off
            </Button>
          </Paper>
        </Grid>

        {/* Current Laundry Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" gutterBottom>
              Current Laundry Status
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tracking #</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Drop-off Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {laundry
                    .filter((item) => item.status !== 'picked_up')
                    .map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.trackingNumber}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.status.replace(/_/g, ' ').toUpperCase()}
                            color={statusColors[item.status]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(item.dropOffDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent History */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" gutterBottom>
              Recent History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tracking #</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Pickup Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {laundry
                    .filter((item) => item.status === 'picked_up')
                    .slice(0, 5)
                    .map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.trackingNumber}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.status.replace(/_/g, ' ').toUpperCase()}
                            color={statusColors[item.status]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(item.actualPickupDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 