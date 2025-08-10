import { useState } from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { toast } from "react-toastify";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleUpdate = () => {
    toast.success("Profile updated (simulated)");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Paper sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" mb={2}>
          Update Profile
        </Typography>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleUpdate}>
          Update
        </Button>
      </Paper>
    </Box>
  );
}
