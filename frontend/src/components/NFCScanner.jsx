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

const NFCScanner = ({
  open,
  onClose,
  onScanSuccess,
  orderId,
  mode = "read",
  writeData,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
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
      setError("NFC is not supported on this device/browser. Use Chrome on Android.");
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

      abortControllerRef.current = new AbortController();
      const ndef = new NDEFReader();

      await ndef.scan({ signal: abortControllerRef.current.signal });

      ndef.onreading = (event) => {
        handleNFCReading(event);
      };

      ndef.onreadingerror = (event) => {
        handleNFCError(new Error("Cannot read data from NFC tag. Try another one."));
      };

    } catch (error) {
      handleNFCError(error);
    }
  };

  // Write to NFC tag
  const startWriting = async (data) => {
    if (!nfcSupported) {
      setError("NFC is not supported on this device");
      return;
    }

    try {
      setIsWriting(true);
      setError(null);

      const ndef = new NDEFReader();
      // Writing requires a user gesture, which this call is part of
      if (typeof data === "object" && data?.url) {
        await ndef.write({
          records: [{ recordType: "url", data: data.url }],
        });
      } else {
        await ndef.write(typeof data === "string" ? data : JSON.stringify(data));
      }
      
      toast.success("NFC tag written successfully!");
      if (onScanSuccess) {
        onScanSuccess({ type: "write_success", content: data, timestamp: new Date() });
      }
      setTimeout(() => handleClose(), 1500);
    } catch (error) {
      console.error("Write Error:", error);
      setError(error.message || "Failed to write to NFC tag");
      toast.error("NFC writing failed");
    } finally {
      setIsWriting(false);
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

      for (const record of event.message.records) {
        const content = decoder.decode(record.data);
        let parsedContent = content;
        let type = record.recordType;

        if (record.mediaType === "application/json" || content.startsWith('{')) {
          try {
            parsedContent = JSON.parse(content);
            type = "json";
          } catch (e) {
            // Not JSON, keep as text
          }
        }
        
        nfcData = { type, content: parsedContent, timestamp: new Date(), serialNumber: event.serialNumber };
      }

      if (nfcData) {
        setScanResult(nfcData);
        setScanHistory((prev) => [nfcData, ...prev.slice(0, 9)]);

        if (onScanSuccess) {
          onScanSuccess(nfcData);
          if (mode === "read") setTimeout(() => handleClose(), 2000);
        }

        stopScanning();
        toast.success("NFC tag scanned!");
      }
    } catch (error) {
      handleNFCError(error);
    }
  };

  const handleNFCError = (error) => {
    console.error("NFC Error:", error);
    setError(error.message || "Failed to interact with NFC tag");
    setIsScanning(false);
    setIsWriting(false);
    toast.error("NFC operation failed");
  };

  const handleClose = () => {
    stopScanning();
    setScanResult(null);
    setError(null);
    onClose();
  };

  const formatNFCData = (data) => {
    if (data.type === "json" || typeof data.content === 'object') {
      return JSON.stringify(data.content, null, 2);
    }
    return data.content;
  };

  const getDataTypeColor = (type) => {
    switch (type) {
      case "text": return "primary";
      case "url": return "success";
      case "json": return "warning";
      default: return "default";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <NfcIcon color="primary" />
            <Typography variant="h6">NFC {mode === "write" ? "Writer" : "Scanner"}</Typography>
            {orderId && (
              <Chip label={`Order: ${orderId}`} size="small" color="secondary" />
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
              NFC is not supported. Please use Chrome on Android and ensure NFC is enabled in settings.
            </Alert>
          ) : (
            <Alert severity="info" icon={<InfoIcon />}>
              {mode === "write" 
                ? "Tap 'Confirm & Write' then hold the NFC sticker to your phone's back."
                : "Hold your device near the laundry NFC sticker to scan."}
            </Alert>
          )}
        </Box>

        {mode === "write" && writeData?.url && (
          <Alert severity="success" sx={{ mb: 3 }}>
            This sticker will open {writeData.url}
          </Alert>
        )}

        <Box display="flex" gap={2} mb={3} justifyContent="center">
          {mode === "read" ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<NfcIcon />}
              onClick={startScanning}
              disabled={!nfcSupported || isScanning}
              size="large"
            >
              {isScanning ? "Scanning..." : "Start Scan"}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CheckIcon />}
              onClick={() =>
                startWriting(
                  writeData || {
                    orderId,
                    timestamp: new Date().toISOString(),
                  }
                )
              }
              disabled={!nfcSupported || isWriting}
              size="large"
            >
              {isWriting ? "Writing..." : "Confirm & Write Tag"}
            </Button>
          )}

          {isScanning && (
            <Button variant="outlined" color="secondary" onClick={stopScanning}>
              Stop
            </Button>
          )}
        </Box>

        {isScanning && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} my={3}>
            <CircularProgress size={60} />
            <Typography variant="body2" color="textSecondary">Hold device near tag...</Typography>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {scanResult && (
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CheckIcon color="success" />
              <Typography variant="h6">Scan Success</Typography>
              <Chip label={scanResult.type} color={getDataTypeColor(scanResult.type)} size="small" />
            </Box>
            {scanResult.serialNumber && (
              <Typography variant="caption" display="block" color="textSecondary">Tag ID: {scanResult.serialNumber}</Typography>
            )}
            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: "grey.50", fontFamily: "monospace", fontSize: "0.8rem" }}>
              {formatNFCData(scanResult)}
            </Paper>
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NFCScanner;
