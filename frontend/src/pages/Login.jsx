import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Alert } from "@mui/material";
import { loginUser } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import bgImage from "../assets/laundry-bg.jpg";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Login failed");
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
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "fixed",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
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
          bgcolor: "rgba(255,255,255,0.7)", // or use a blue tint: 'rgba(178,235,242,0.7)'
          zIndex: 1,
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        style={{
          width: "100%",
          maxWidth: 400,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Paper elevation={8} sx={{ p: 4, borderRadius: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
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
        </Paper>
      </motion.div>
    </Box>
  );
}
