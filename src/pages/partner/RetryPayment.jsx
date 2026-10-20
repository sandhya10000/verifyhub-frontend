import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowLeft, CreditCard, RefreshCw, Wallet } from "lucide-react";
import axios from "axios";
import useAuth from "../../context/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const inr2 = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDateTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
};

const expiryLabel = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

  // A single retryable failure means the WhatsApp button can skip the card
  // list: bounce straight to the hosted Razorpay page for that exact
  // transaction (amount, GST and wallet credit all come from the txn).
  // Several failures keep the list so the partner pays the right one.
  const single = !loading && !error && items.length === 1 ? items[0] : null;
  const singleUrl =
    single && /^https?:\/\//i.test(String(single.retryLinkUrl || ""))
      ? String(single.retryLinkUrl)
      : null;
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!singleUrl || redirectedRef.current) return;
    redirectedRef.current = true;
    window.location.replace(singleUrl);
  }, [singleUrl]);

  const handlePay = (item) => {
    window.open(item.retryLinkUrl, "_blank", "noopener,noreferrer");
  };

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
        A wallet recharge did not go through. Pay again below — your wallet is credited
        automatically once the payment succeeds.
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

      {!loading && !error && singleUrl && (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress size={36} />
            <Typography variant="h6" sx={{ mt: 2, mb: 0.5 }}>
              Redirecting you to secure payment…
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Taking you to Razorpay to complete your{" "}
              {inr2(single.totalAmount)} recharge.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.assign(singleUrl)}
              sx={{ textTransform: "none" }}
            >
              Continue to payment
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && items.length > 0 && !singleUrl && (
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              startIcon={<RefreshCw size={14} />}
              onClick={fetchRetries}
              sx={{ textTransform: "none" }}
            >
              Refresh
            </Button>
          </Box>

          {items.map((item) => {
            const expiry = expiryLabel(item.expiresAt);
            const bonus = Number(item.bonusCredit) || 0;
            const gst = Number(item.gstAmount) || 0;
            return (
              <Card key={item.transactionId} variant="outlined">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Wallet recharge
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {inr2(item.totalAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Initiated {fmtDateTime(item.createdAt)}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CreditCard size={18} />}
                      onClick={() => handlePay(item)}
                      sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                    >
                      Pay Now
                    </Button>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={0.75}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Recharge amount
                      </Typography>
                      <Typography variant="body2">{inr2(item.amount)}</Typography>
                    </Box>
                    {gst > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          GST
                        </Typography>
                        <Typography variant="body2">{inr2(gst)}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Wallet credit
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {inr2(item.walletCredit)}
                        {bonus > 0 ? ` (incl. ${inr2(bonus)} bonus)` : ""}
                      </Typography>
                    </Box>
                  </Stack>

                  {expiry && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                      Payment link valid till {expiry}. A fresh link is created automatically if it expires.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default RetryPayment;
