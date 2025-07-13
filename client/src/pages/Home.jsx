import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import {
  LocalLaundryService,
  NotificationsActive,
  Speed,
  Security
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <LocalLaundryService fontSize="large" />,
      title: 'NFC-Enabled Tracking',
      description: 'Track your laundry in real-time using NFC technology'
    },
    {
      icon: <NotificationsActive fontSize="large" />,
      title: 'Real-time Updates',
      description: 'Get instant notifications about your laundry status'
    },
    {
      icon: <Speed fontSize="large" />,
      title: 'Fast Service',
      description: 'Quick turnaround time with efficient processing'
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Secure System',
      description: 'Your laundry is handled with care and security'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Project Laundry
          </Typography>
          <Typography variant="h5" paragraph>
            Experience the future of laundry management with NFC technology
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ mt: 2 }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    1. Drop Off
                  </Typography>
                  <Typography>
                    Bring your clothes to our facility and we'll tag them with NFC
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    2. Track Progress
                  </Typography>
                  <Typography>
                    Monitor your laundry status in real-time through our app
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    3. Pick Up
                  </Typography>
                  <Typography>
                    Collect your clean clothes when they're ready
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 