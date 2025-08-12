import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Nfc as NfcIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  QrCode as QrCodeIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const NFCScanner = ({ open, onClose, onScanSuccess, orderId }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const abortControllerRef = useRef(null);

  // Check NFC support on component mount
  useEffect(() => {
    checkNFCSupport();
  }, []);

  // Check if Web NFC API is supported
  const checkNFCSupport = () => {
    if ("NDEFReader" in window) {
      setNfcSupported(true);
      setError(null);
    } else {
      setNfcSupported(false);
      setError("NFC is not supported on this device or browser");
    }
  };

  // Start NFC scanning
  const startScanning = async () => {
    if (!nfcSupported) {
      setError("NFC is not supported on this device");
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      setScanResult(null);

      // Create abort controller for scanning
      abortControllerRef.current = new AbortController();

      // Request NFC permission
      const ndef = new NDEFReader();

      // Listen for NFC tags
      await ndef.scan({
        signal: abortControllerRef.current.signal,
        recordType: "text",
        mediaType: "application/json",
      });

      // Handle NFC reading
      ndef.addEventListener("reading", (event) => {
        handleNFCReading(event);
      });

      // Handle NFC reading errors
      ndef.addEventListener("readingerror", (event) => {
        handleNFCError(event);
      });

      // Handle NFC reading end
      ndef.addEventListener("readingerror", (event) => {
        handleNFCError(event);
      });
    } catch (error) {
      handleNFCError(error);
    }
  };

  // Stop NFC scanning
  const stopScanning = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsScanning(false);
  };

  // Handle NFC reading
  const handleNFCReading = (event) => {
    try {
      const decoder = new TextDecoder();
      let nfcData = null;

      // Process different record types
      for (const record of event.message.records) {
        if (record.recordType === "text") {
          const textDecoder = new TextDecoder(record.encoding || "utf-8");
          const text = textDecoder.decode(record.data);
          nfcData = { type: "text", content: text, timestamp: new Date() };
        } else if (record.recordType === "url") {
          const url = decoder.decode(record.data);
          nfcData = { type: "url", content: url, timestamp: new Date() };
        } else if (record.mediaType === "application/json") {
          const jsonData = JSON.parse(decoder.decode(record.data));
          nfcData = { type: "json", content: jsonData, timestamp: new Date() };
        }
      }

      if (nfcData) {
        setScanResult(nfcData);
        setScanHistory((prev) => [nfcData, ...prev.slice(0, 9)]); // Keep last 10 scans

        // Auto-close after successful scan if callback provided
        if (onScanSuccess) {
          onScanSuccess(nfcData);
          setTimeout(() => onClose(), 2000);
        }

        stopScanning();
        toast.success("NFC tag scanned successfully!");
      }
    } catch (error) {
      handleNFCError(error);
    }
  };

  // Handle NFC errors
  const handleNFCError = (error) => {
    console.error("NFC Error:", error);
    setError(error.message || "Failed to read NFC tag");
    setIsScanning(false);
    toast.error("NFC scanning failed");
  };

  // Handle dialog close
  const handleClose = () => {
    stopScanning();
    setScanResult(null);
    setError(null);
    onClose();
  };

  // Format NFC data for display
  const formatNFCData = (data) => {
    if (data.type === "json") {
      return JSON.stringify(data.content, null, 2);
    }
    return data.content;
  };

  // Get NFC data type color
  const getDataTypeColor = (type) => {
    switch (type) {
      case "text":
        return "primary";
      case "url":
        return "success";
      case "json":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <NfcIcon color="primary" />
            <Typography variant="h6">NFC Scanner</Typography>
            {orderId && (
              <Chip
                label={`Order: ${orderId}`}
                size="small"
                color="secondary"
              />
            )}
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          {!nfcSupported ? (
            <Alert severity="error" icon={<ErrorIcon />}>
              <Typography variant="body2">
                NFC is not supported on this device or browser. Please use a
                device with NFC capabilities and a compatible browser.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="body2">
                Hold your device near an NFC tag to scan it. Make sure NFC is
                enabled in your device settings.
              </Typography>
            </Alert>
          )}
        </Box>

        {/* NFC Control Buttons */}
        <Box display="flex" gap={2} mb={3} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<NfcIcon />}
            onClick={startScanning}
            disabled={!nfcSupported || isScanning}
            size="large"
          >
            {isScanning ? "Scanning..." : "Start Scanning"}
          </Button>

          {isScanning && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={stopScanning}
              startIcon={<CloseIcon />}
            >
              Stop Scanning
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={checkNFCSupport}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>

        {/* Loading State */}
        {isScanning && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            my={3}
          >
            <CircularProgress size={60} />
            <Typography variant="body2" color="textSecondary">
              Hold device near NFC tag...
            </Typography>
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}

        {/* Scan Result */}
        {scanResult && (
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CheckIcon color="success" />
              <Typography variant="h6">Scan Result</Typography>
              <Chip
                label={scanResult.type}
                color={getDataTypeColor(scanResult.type)}
                size="small"
              />
            </Box>

            <Typography variant="body2" color="textSecondary" mb={1}>
              Scanned at: {scanResult.timestamp.toLocaleString()}
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: "grey.50",
                fontFamily: "monospace",
                fontSize: "0.875rem",
                maxHeight: "200px",
                overflow: "auto",
              }}
            >
              {formatNFCData(scanResult)}
            </Paper>
          </Paper>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Box>
            <Typography variant="h6" mb={2}>
              Recent Scans
            </Typography>
            <List dense>
              {scanHistory.map((scan, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <NfcIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {scan.content.substring(0, 50)}
                          {scan.content.length > 50 ? "..." : ""}
                        </Typography>
                        <Chip
                          label={scan.type}
                          size="small"
                          color={getDataTypeColor(scan.type)}
                        />
                      </Box>
                    }
                    secondary={scan.timestamp.toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NFCScanner;
