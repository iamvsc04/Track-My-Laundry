import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { getOrderByNfcTag } from "../utils/api";

export default function NfcTagLanding() {
  const { nfcTag } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | login | unassigned | error
  const [message, setMessage] = useState("Checking this NFC sticker...");
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!nfcTag) {
      setStatus("error");
      setMessage("Missing NFC tag in the URL.");
      return;
    }

    if (!user) {
      sessionStorage.setItem("postLoginRedirectUrl", window.location.href);
      setStatus("login");
      setMessage("Log in on this phone, then tap the NFC sticker again.");
      return;
    }

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchByTag = async () => {
      try {
        setStatus("loading");
        setMessage("Looking up the order linked to this sticker...");
        const response = await getOrderByNfcTag(nfcTag);
        const order = response.data.data;
        navigate(`/order/${order._id}`, { replace: true });
      } catch (error) {
        const apiMessage =
          error.response?.data?.message || "Could not look up this NFC sticker.";

        if (error.response?.status === 404) {
          setStatus("unassigned");
          setMessage("This sticker is not linked to any order yet.");
          return;
        }

        setStatus("error");
        setMessage(apiMessage);
      }
    };

    fetchByTag();
  }, [navigate, nfcTag, user]);

  return (
    <MainLayout>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            {status === "loading" && <CircularProgress sx={{ mb: 3 }} />}
            <Typography variant="h4" fontWeight={800} gutterBottom>
              NFC Sticker
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>

            <Alert severity={status === "error" ? "error" : "info"} sx={{ mb: 3 }}>
              Tag: {nfcTag}
            </Alert>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
              {status === "login" && (
                <Button variant="contained" onClick={() => navigate("/login")}>
                  Go to Login
                </Button>
              )}

              {status === "unassigned" && (
                <Button
                  variant="contained"
                  onClick={() =>
                    navigate(`/create-order?nfcTag=${encodeURIComponent(nfcTag)}`)
                  }
                >
                  Create Order
                </Button>
              )}

              {status === "unassigned" && (
                <Button variant="outlined" onClick={() => navigate("/nfc-setup")}>
                  Program Another Sticker
                </Button>
              )}

              {status === "error" && (
                <Button variant="contained" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
}

