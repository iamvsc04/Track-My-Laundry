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
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import MainLayout from "../components/Layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../utils/api";

const getDemoDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
};

const buildDemoOrder = (user, nfcTag) => {
  const address =
    user?.profile?.address?.street ||
    user?.address ||
    "TrackMyLaundry Demo Address";

  return {
    serviceType: "Wash & Fold",
    nfcTag,
    items: [
      {
        type: "Shirt",
        quantity: 3,
        service: "Wash & Fold",
        specialInstructions: "NFC demo order",
        price: 5,
      },
      {
        type: "Pants",
        quantity: 2,
        service: "Wash & Fold",
        specialInstructions: "Handle with regular care",
        price: 5,
      },
    ],
    pickup: {
      address,
      date: getDemoDate(1),
      timeSlot: "11:00 AM - 1:00 PM",
      instructions: "Created automatically from NFC demo tap",
    },
    delivery: {
      address,
      date: getDemoDate(2),
      timeSlot: "4:00 PM - 6:00 PM",
      instructions: "Demo delivery slot",
    },
    customerPreferences: {
      detergentType: "Standard",
      fabricSoftener: false,
      starchLevel: "None",
      ironing: true,
    },
    customerNotes: "Predefined demo order created from an NFC sticker tap.",
    isUrgent: false,
    priority: "Normal",
  };
};

export default function NFCDemoOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("creating");
  const [message, setMessage] = useState("Creating your NFC demo order...");
  const hasSubmittedRef = useRef(false);

  const sourceTagRef = useRef(
    searchParams.get("tag") ||
      searchParams.get("nfcTag") ||
      `DEMO_NFC_${Date.now()}`
  );
  const orderTagRef = useRef(`${sourceTagRef.current}_${Date.now()}`);
  const nfcTag = sourceTagRef.current;

  useEffect(() => {
    if (!user) {
      sessionStorage.setItem("postLoginRedirectUrl", window.location.href);
      setStatus("login");
      setMessage("Log in on this phone, then tap the NFC sticker again to create the demo order.");
      return;
    }

    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const createDemoOrder = async () => {
      try {
        const response = await createOrder(buildDemoOrder(user, orderTagRef.current));
        const order = response.data.data;
        setStatus("created");
        setMessage(`Demo order ${order.orderNumber} created from NFC tag ${nfcTag}.`);
        toast.success("NFC demo order created");
        navigate(`/order/${order._id}`, { replace: true });
      } catch (error) {
        console.error("Error creating NFC demo order:", error);
        const errorMessage =
          error.response?.data?.message || "Could not create NFC demo order.";
        setStatus("error");
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    createDemoOrder();
  }, [navigate, nfcTag, user]);

  return (
    <MainLayout>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            {status === "creating" && <CircularProgress sx={{ mb: 3 }} />}
            <Typography variant="h4" fontWeight={800} gutterBottom>
              NFC Demo Order
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Alert severity={status === "error" ? "error" : "info"} sx={{ mb: 3 }}>
              Tag: {nfcTag}
            </Alert>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              {status === "login" && (
                <Button variant="contained" onClick={() => navigate("/login")}>
                  Go to Login
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
