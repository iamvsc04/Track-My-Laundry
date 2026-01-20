import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { Alert } from "@mui/material";
import { toast } from "react-toastify";
import { login as loginApi, resendVerificationEmail } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import { ThemeToggleIcon } from '../components/ThemeToggle';
import bgImage from '../assets/laundry-bg.jpg';

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginApi(form);
      authLogin(res.data.user, res.data.token);
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail(form.email);
      toast.success("Verification email sent. Please check your inbox.");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to resend verification email";
      toast.error(msg);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark' 
            ? 'rgba(0, 0, 0, 0.7)' 
            : 'rgba(255, 255, 255, 0.8)',
          zIndex: 1,
        },
      }}
    >
      {/* Theme Toggle */}
      <Box
        sx={{
          position: "absolute",
          top: 24,
          right: 24,
          zIndex: 20,
        }}
      >
        <ThemeToggleIcon size="medium" />
      </Box>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        style={{
          width: "100%",
          maxWidth: 400,
          position: "relative",
          zIndex: 10,
        }}
      >
        <Paper 
          elevation={24} 
          sx={{ 
            p: 4, 
            borderRadius: 4, 
            background: theme.palette.mode === 'dark' 
              ? 'rgba(30, 41, 59, 0.9)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3)',
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 20, -20, 0] }}
              transition={{ duration: 0.8, type: "tween" }}
            >
              <LocalLaundryServiceIcon
                sx={{ fontSize: 60, color: theme.palette.primary.main }}
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
              Welcome back! Please login to continue.
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span role="img" aria-label="email">
                      📧
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span role="img" aria-label="password">
                      🔒
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: "100%" }}
            >
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 2, py: 1.5, fontWeight: "bold", fontSize: "1.1rem" }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </motion.div>
          </form>
          <Typography mt={3} textAlign="center" color="text.secondary">
            Don&apos;t have an account?{" "}
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </Typography>
          {error?.toLowerCase().includes("verify") && (
            <Typography mt={1} textAlign="center" color="text.secondary">
              Didn&apos;t get the email?{" "}
              <Button
                variant="text"
                color="primary"
                onClick={handleResendVerification}
              >
                Resend verification
              </Button>
            </Typography>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
}
