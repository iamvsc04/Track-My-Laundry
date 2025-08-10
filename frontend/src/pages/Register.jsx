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

export default function EnhancedRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailOTP, setEmailOTP] = useState("");
  const [mobileOTP, setMobileOTP] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [sendingMobileOtp, setSendingMobileOtp] = useState(false);
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [showMobileOtp, setShowMobileOtp] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendEmailOtp = async () => {
    setSendingEmailOtp(true);
    setTimeout(() => {
      setSendingEmailOtp(false);
      setShowEmailOtp(true);
      setError("");
    }, 2000);
  };

  const handleSendMobileOtp = async () => {
    setSendingMobileOtp(true);
    setTimeout(() => {
      setSendingMobileOtp(false);
      setShowMobileOtp(true);
      setError("");
    }, 2000);
  };

  const handleVerifyEmailOtp = async () => {
    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      if (emailOTP === "123456") {
        setEmailVerified(true);
        setShowEmailOtp(false);
      } else {
        setError("Invalid email OTP. Try 123456");
      }
    }, 1500);
  };

  const handleVerifyMobileOtp = async () => {
    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      if (mobileOTP === "654321") {
        setMobileVerified(true);
        setShowMobileOtp(false);
      } else {
        setError("Invalid mobile OTP. Try 654321");
      }
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified || !mobileVerified) {
      setError("Please verify both email and mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Registration successful! You can now login.");
    }, 2000);
  };

  const isEmailValid = form.email && form.email.includes("@");
  const isMobileValid = form.mobile && form.mobile.length >= 10;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "fixed",
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        overflow: "hidden",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 6,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
        >
          {/* Header */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 20, -20, 0] }}
              transition={{ duration: 0.8, type: "tween" }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 4,
                  background:
                    "linear-gradient(45deg, #00bcd4 30%, #2196f3 90%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  transform: "rotate(12deg)",
                  transition: "transform 0.5s ease",
                  "&:hover": {
                    transform: "rotate(0deg)",
                  },
                }}
              >
                <LocalLaundryServiceIcon
                  sx={{ fontSize: 40, color: "white" }}
                />
              </Box>
            </motion.div>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                background: "linear-gradient(45deg, #00bcd4 30%, #2196f3 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              TrackMyLaundry
            </Typography>
            <Typography variant="body1" color="text.secondary">
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
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3 },
              }}
            />

            {/* Email Field with OTP */}
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={7}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={emailVerified}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon
                            color={emailVerified ? "success" : "primary"}
                          />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 3,
                        backgroundColor: emailVerified
                          ? "rgba(76, 175, 80, 0.1)"
                          : "inherit",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={5}>
                  {emailVerified ? (
                    <VerifiedButton fullWidth startIcon={<CheckCircleIcon />}>
                      Verified
                    </VerifiedButton>
                  ) : (
                    <GradientButton
                      fullWidth
                      onClick={handleSendEmailOtp}
                      disabled={sendingEmailOtp || !isEmailValid}
                    >
                      {sendingEmailOtp ? (
                        <>
                          <CircularProgress
                            size={20}
                            color="inherit"
                            sx={{ mr: 1 }}
                          />
                          Sending...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </GradientButton>
                  )}
                </Grid>
              </Grid>

              <Slide
                direction="down"
                in={showEmailOtp && !emailVerified}
                mountOnEnter
                unmountOnExit
              >
                <OtpContainer elevation={2}>
                  <Typography variant="body2" color="primary" gutterBottom>
                    Enter the OTP sent to your email (Demo: 123456)
                  </Typography>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={8}>
                      <TextField
                        value={emailOTP}
                        onChange={(e) => setEmailOTP(e.target.value)}
                        placeholder="Enter OTP"
                        fullWidth
                        size="small"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        onClick={handleVerifyEmailOtp}
                        disabled={otpLoading || !emailOTP}
                        variant="contained"
                        fullWidth
                        sx={{ borderRadius: 2 }}
                      >
                        {otpLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </OtpContainer>
              </Slide>
            </Box>

            {/* Mobile Field with OTP */}
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={7}>
                  <TextField
                    label="Mobile"
                    name="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={mobileVerified}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon
                            color={mobileVerified ? "success" : "primary"}
                          />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 3,
                        backgroundColor: mobileVerified
                          ? "rgba(76, 175, 80, 0.1)"
                          : "inherit",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={5}>
                  {mobileVerified ? (
                    <VerifiedButton fullWidth startIcon={<CheckCircleIcon />}>
                      Verified
                    </VerifiedButton>
                  ) : (
                    <GradientButton
                      fullWidth
                      onClick={handleSendMobileOtp}
                      disabled={sendingMobileOtp || !isMobileValid}
                    >
                      {sendingMobileOtp ? (
                        <>
                          <CircularProgress
                            size={20}
                            color="inherit"
                            sx={{ mr: 1 }}
                          />
                          Sending...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </GradientButton>
                  )}
                </Grid>
              </Grid>

              <Slide
                direction="down"
                in={showMobileOtp && !mobileVerified}
                mountOnEnter
                unmountOnExit
              >
                <OtpContainer
                  elevation={2}
                  sx={{ backgroundColor: "rgba(227, 242, 253, 0.8)" }}
                >
                  <Typography variant="body2" color="primary" gutterBottom>
                    Enter the OTP sent to your mobile (Demo: 654321)
                  </Typography>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={8}>
                      <TextField
                        value={mobileOTP}
                        onChange={(e) => setMobileOTP(e.target.value)}
                        placeholder="Enter OTP"
                        fullWidth
                        size="small"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        onClick={handleVerifyMobileOtp}
                        disabled={otpLoading || !mobileOTP}
                        variant="contained"
                        fullWidth
                        sx={{ borderRadius: 2 }}
                      >
                        {otpLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </OtpContainer>
              </Slide>
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
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3 },
              }}
            />

            {/* Submit Button */}
            <motion.div
              whileHover={{
                scale: loading || !emailVerified || !mobileVerified ? 1 : 1.05,
              }}
              whileTap={{
                scale: loading || !emailVerified || !mobileVerified ? 1 : 0.98,
              }}
            >
              <Button
                type="submit"
                fullWidth
                disabled={loading || !emailVerified || !mobileVerified}
                sx={{
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: 3,
                  background:
                    loading || !emailVerified || !mobileVerified
                      ? "rgba(0, 0, 0, 0.12)"
                      : "linear-gradient(45deg, #00bcd4 30%, #2196f3 90%)",
                  color:
                    loading || !emailVerified || !mobileVerified
                      ? "rgba(0, 0, 0, 0.26)"
                      : "white",
                  boxShadow:
                    loading || !emailVerified || !mobileVerified
                      ? "none"
                      : "0 4px 15px 0 rgba(33, 203, 243, .4)",
                  "&:hover": {
                    background:
                      loading || !emailVerified || !mobileVerified
                        ? "rgba(0, 0, 0, 0.12)"
                        : "linear-gradient(45deg, #00acc1 30%, #1976d2 90%)",
                    boxShadow:
                      loading || !emailVerified || !mobileVerified
                        ? "none"
                        : "0 6px 20px 0 rgba(33, 203, 243, .4)",
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
          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Button
                variant="text"
                color="primary"
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
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
