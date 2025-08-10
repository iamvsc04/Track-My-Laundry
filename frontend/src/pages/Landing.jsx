import { Box, Button, Typography, Grid, Paper, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SmsIcon from "@mui/icons-material/Sms";

const features = [
  {
    icon: <LocalLaundryServiceIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "NFC-Triggered Tracking",
    desc: "Automated ticket generation and real-time laundry tracking with NFC.",
  },
  {
    icon: <NotificationsActiveIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "Live Status & Notifications",
    desc: "Track your laundry status live and get push/SMS notifications.",
  },
  {
    icon: <HistoryEduIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "Order History",
    desc: "View your laundry order history with timestamps and shelf locations.",
  },
  {
    icon: <EmojiEventsIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "Rewards & Coupons",
    desc: "Earn loyalty rewards and use coupons for discounts.",
  },
];

const valueProps = [
  {
    icon: <DashboardIcon color="primary" sx={{ fontSize: 32 }} />,
    title: "Admin Dashboard",
    desc: "Powerful tools for staff and admins.",
  },
  {
    icon: <SmsIcon color="primary" sx={{ fontSize: 32 }} />,
    title: "Instant Alerts",
    desc: "Never miss an update with instant SMS and push notifications.",
  },
  {
    icon: <LocalLaundryServiceIcon color="primary" sx={{ fontSize: 32 }} />,
    title: "Easy to Use",
    desc: "A beautiful, intuitive interface for everyone.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f7fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          width: "100%",
          minHeight: { xs: 400, md: 520 },
          background: "linear-gradient(120deg, #00bcd4 0%, #1976d2 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative SVG shape */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 400,
            height: 400,
            opacity: 0.15,
            zIndex: 1,
            display: { xs: "none", md: "block" },
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="200" fill="#fff" />
          </svg>
        </Box>
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 2, pt: 8, pb: 6 }}
        >
          <Grid container alignItems="center" spacing={4}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, type: "spring" }}
              >
                <Typography
                  variant="h2"
                  fontWeight="bold"
                  mb={2}
                  sx={{ letterSpacing: 1 }}
                >
                  TrackMyLaundry
                </Typography>
                <Typography variant="h5" mb={4} sx={{ opacity: 0.95 }}>
                  The smart, modern way to track, manage, and get notified about
                  your laundry—powered by NFC, real-time updates, and rewards!
                </Typography>
                <Box display="flex" gap={2} mt={2}>
                  <motion.div
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      sx={{
                        fontWeight: "bold",
                        px: 4,
                        borderRadius: 3,
                        boxShadow: 3,
                      }}
                      onClick={() => navigate("/register")}
                    >
                      Get Started
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      sx={{
                        fontWeight: "bold",
                        px: 4,
                        borderRadius: 3,
                        borderColor: "white",
                        color: "white",
                      }}
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6} display="flex" justifyContent="center">
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, type: "spring" }}
              >
                <Box
                  sx={{
                    width: 320,
                    height: 320,
                    background: "rgba(255,255,255,0.13)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 6,
                  }}
                >
                  <LocalLaundryServiceIcon
                    sx={{ fontSize: 140, color: "#fff" }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: 6, md: 10 }, mb: 6 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={4}
          color="primary"
        >
          Why Choose TrackMyLaundry?
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Paper
                  elevation={6}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    minHeight: 220,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.97)",
                  }}
                >
                  {feature.icon}
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mt={2}
                    mb={1}
                    color="primary"
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    textAlign="center"
                  >
                    {feature.desc}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Value Props Section */}
      <Box sx={{ bgcolor: "#e3f2fd", py: 6 }}>
        <Container maxWidth="md">
          <Grid container spacing={4} justifyContent="center">
            {valueProps.map((prop, idx) => (
              <Grid item xs={12} sm={4} key={prop.title}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      textAlign: "center",
                      background: "white",
                    }}
                  >
                    {prop.icon}
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      mt={1}
                      mb={0.5}
                      color="primary"
                    >
                      {prop.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {prop.desc}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: "#1976d2",
          color: "white",
          py: 2,
          textAlign: "center",
          mt: "auto",
        }}
      >
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} TrackMyLaundry. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
