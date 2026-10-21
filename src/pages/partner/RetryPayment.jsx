import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { ArrowLeft, Wallet } from "lucide-react";
import axios from "axios";
import useAuth from "../../context/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const inr2 = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const RetryPayment = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRetries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const authToken = token || localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/wallet-recharge/retries`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setItems(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to load retry payments:", err);
      setError(
        err.response?.data?.message || "Could not load your pending payments. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRetries();
  }, [fetchRetries]);

  // The WhatsApp button URL is static, so it carries no transaction id. Send
  // the partner straight to the most recent failed recharge's hosted Razorpay
  // page (amount, GST and wallet credit come from that txn).
  const top = !loading && !error && items.length > 0 ? items[0] : null;
  const topUrl =
    top && /^https?:\/\//i.test(String(top.retryLinkUrl || ""))
      ? String(top.retryLinkUrl)
      : null;

  useEffect(() => {
    if (!topUrl) return undefined;
    const t = setTimeout(() => window.location.replace(topUrl), 800);
    return () => clearTimeout(t);
  }, [topUrl]);

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate("/partner/add-funds")}
        sx={{ mb: 2, textTransform: "none", color: "text.secondary" }}
      >
        Back to Add Funds
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Retry Payment
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        A wallet recharge did not go through. We are taking you to the secure payment
        page — your wallet is credited automatically once the payment succeeds.
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchRetries}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && items.length === 0 && (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Wallet size={40} color="#94A3B8" />
            <Typography variant="h6" sx={{ mt: 1.5, mb: 0.5 }}>
              No pending payments
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              There are no failed recharges waiting for a retry. If you just
              attempted a payment, please contact support.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/partner/add-funds")}>
              Add Funds
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && topUrl && (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress size={36} />
            <Typography variant="h6" sx={{ mt: 2, mb: 0.5 }}>
              Redirecting you to Razorpay…
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Taking you to the secure payment page to complete your{" "}
              {inr2(top.totalAmount)} recharge.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.replace(topUrl)}
              sx={{ textTransform: "none" }}
            >
              Continue to payment
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && items.length > 0 && !topUrl && (
        <Alert severity="warning">
          We could not open your payment link. Please contact support.
        </Alert>
      )}
    </Box>
  );
};

export default RetryPayment;
