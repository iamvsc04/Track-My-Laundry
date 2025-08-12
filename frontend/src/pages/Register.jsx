import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  CircularProgress,
  Grid,
  Alert,
  Fade,
  Slide,
  Chip,
  styled,
  keyframes,
} from "@mui/material";
import { motion } from "framer-motion";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/laundry-bg.jpg";
import { register } from "../utils/api";
import { toast } from "react-toastify";

// Styled components for custom animations
const pulse = keyframes`
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.3;
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const AnimatedBackground = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "320px",
  height: "320px",
  borderRadius: "50%",
  filter: "blur(60px)",
  animation: `${pulse} 4s ease-in-out infinite`,
  mixBlendMode: "multiply",
}));

const ShakeAlert = styled(Alert)(({ theme }) => ({
  animation: `${shake} 0.5s ease-in-out`,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #00bcd4 30%, #2196f3 90%)",
  border: 0,
  borderRadius: 12,
  boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
  color: "white",
  height: 48,
  padding: "0 30px",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(45deg, #00acc1 30%, #1976d2 90%)",
    transform: "scale(1.05)",
    boxShadow: "0 6px 10px 4px rgba(33, 203, 243, .3)",
  },
  "&:active": {
    transform: "scale(0.98)",
  },
  "&:disabled": {
    background: "rgba(0, 0, 0, 0.12)",
    color: "rgba(0, 0, 0, 0.26)",
    transform: "none",
    boxShadow: "none",
  },
}));

const VerifiedButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)",
  border: 0,
  borderRadius: 12,
  color: "white",
  height: 48,
  padding: "0 20px",
  cursor: "default",
  "&:hover": {
    background: "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)",
  },
}));

const OtpContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  borderRadius: 16,
  backgroundColor: "rgba(240, 248, 255, 0.8)",
  border: "1px solid rgba(33, 150, 243, 0.3)",
  backdropFilter: "blur(10px)",
}));

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userData = {
        name: form.name.trim(),
        email: form.email,
        mobile: form.mobile,
        password: form.password,
      };

      await register(userData);
      setLoading(false);
      setError("");
      toast.success(
        "Registration successful! Check your email to verify your account."
      );
      navigate("/login");
    } catch (err) {
      setLoading(false);
      const msg =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    }
  };

  const isEmailValid =
    form.email && form.email.includes("@") && form.email.length > 5;
  const isFormValid =
    form.name.trim() && form.password && form.password.length >= 6;

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "fixed",
        width: "100vw",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        top: 0,
        left: 0,
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(255,255,255,0.7)",
          zIndex: 1,
        }}
      />

      {/* Animated background elements */}
      <Box
        sx={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 2 }}
      >
        <AnimatedBackground
          sx={{
            top: -160,
            right: -160,
            background:
              "linear-gradient(45deg, rgba(0, 188, 212, 0.3), rgba(33, 150, 243, 0.3))",
          }}
        />
        <AnimatedBackground
          sx={{
            bottom: -160,
            left: -160,
            background:
              "linear-gradient(45deg, rgba(33, 150, 243, 0.3), rgba(63, 81, 181, 0.3))",
            animationDelay: "2s",
          }}
        />
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        style={{
          width: "100%",
          maxWidth: 450,
          position: "relative",
          zIndex: 3,
        }}
      >
        <Paper elevation={8} sx={{ p: 3, borderRadius: 4 }}>
          {/* Header */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 20, -20, 0] }}
              transition={{ duration: 0.8, type: "tween" }}
            >
              <LocalLaundryServiceIcon
                sx={{ fontSize: 60, color: "#00bcd4" }}
              />
            </motion.div>
            <Typography
              variant="h4"
              fontWeight="bold"
              mt={1}
              mb={1}
              color="primary"
            >
              TrackMyLaundry
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Create your account to get started!
            </Typography>
          </Box>

          {error && (
            <Fade in={!!error}>
              <ShakeAlert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </ShakeAlert>
            </Fade>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Name Field */}
            <TextField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              sx={{ mb: 1.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Email Field */}
            <Box sx={{ mb: 1.5 }}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Mobile Field */}
            <Box sx={{ mb: 1.5 }}>
              <TextField
                label="Mobile Number"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Password Field */}
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Submit Button */}
            <motion.div
              whileHover={{
                scale: loading ? 1 : 1.04,
              }}
              whileTap={{
                scale: loading ? 1 : 0.98,
              }}
              style={{ width: "100%" }}
            >
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !isFormValid}
                sx={{
                  py: 1.5,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  background: loading
                    ? "rgba(0, 0, 0, 0.12)"
                    : "linear-gradient(45deg, #00bcd4 30%, #2196f3 90%)",
                  "&:hover": {
                    background: loading
                      ? "rgba(0, 0, 0, 0.12)"
                      : "linear-gradient(45deg, #00acc1 30%, #1976d2 90%)",
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={24}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                    Creating Account...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </motion.div>
          </Box>

          {/* Login Link */}
          <Typography mt={3} textAlign="center" color="text.secondary">
            Already have an account?{" "}
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate("/login")}
              sx={{
                fontWeight: "medium",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(33, 150, 243, 0.04)",
                },
              }}
            >
              Login
            </Button>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}
