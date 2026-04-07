import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MainLayout from "../components/Layout/MainLayout";
import NFCScanner from "../components/NFCScanner";
import { APP_BASE_URL } from "../utils/api";

const generateTagId = () => {
  try {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  } catch {
    // ignore
  }
  return `TAG_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export default function NfcTagSetup() {
  const navigate = useNavigate();
  const [tagId, setTagId] = useState(generateTagId());
  const [writerOpen, setWriterOpen] = useState(false);

  const tagUrl = useMemo(() => `${APP_BASE_URL}/t/${encodeURIComponent(tagId)}`, [tagId]);

  return (
    <MainLayout>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Program NFC Sticker
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This writes a URL to the sticker so tapping it opens the app and shows the linked order (or asks to create one).
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Works on Chrome (Android) with NFC enabled. Writing requires a button tap.
            </Alert>

            <TextField
              fullWidth
              label="Sticker Tag ID"
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
              helperText="This is the ID stored in the sticker URL."
              sx={{ mb: 2 }}
            />

            <Alert severity="success" sx={{ mb: 3 }}>
              URL to write: {tagUrl}
            </Alert>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button variant="contained" onClick={() => setWriterOpen(true)}>
                Write URL to Sticker
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setTagId(generateTagId());
                  toast.info("Generated a new tag id");
                }}
              >
                Generate New ID
              </Button>
              <Button variant="text" onClick={() => navigate(`/t/${encodeURIComponent(tagId)}`)}>
                Open Link
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary">
              Tip: After writing, tap the sticker again — your phone should open the same URL and the app will either show the order or the create-order flow.
            </Typography>
          </CardContent>
        </Card>

        <NFCScanner
          open={writerOpen}
          onClose={() => setWriterOpen(false)}
          mode="write"
          writeData={{ url: tagUrl }}
          onScanSuccess={() => {
            toast.success("Sticker programmed");
            navigate(`/t/${encodeURIComponent(tagId)}`);
          }}
        />
      </Container>
    </MainLayout>
  );
}

