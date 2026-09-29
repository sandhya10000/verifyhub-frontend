import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonOutlineIcon from "@mui/icons-material/Person";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import BoltIcon from "@mui/icons-material/Bolt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import axios from "axios";
import { creditAPI } from "../../services/authService";
import useAuth from "../../context/useAuth";
import {
  fmtDate, fmtDT, inr0, initials, Dot, StatTile, InfoRow,
} from "../../Components/shared/partnerProfile";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const RANGE_LABEL = { lifetime: "Lifetime", month: "30-Day", week: "7-Day" };

const formatName = (name = "") =>
  String(name).trim().toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const Profile = () => {
  const { user } = useAuth();
  const [partner, setPartner] = useState(null);
  const [summary, setSummary] = useState(null);
  const [range, setRange] = useState("lifetime");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const [profileRes, bureauRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/partner/profile?range=${range}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
          creditAPI.getCreditBureauDetails().catch(() => null),
        ]);
        if (profileRes?.data?.success) {
          const u = profileRes.data.data || {};
          const b = bureauRes?.success ? bureauRes.data || {} : {};
          setPartner({
            ...u,
            state: u.state || b.state || user?.state || "",
            city: u.city || b.city || user?.city || "",
            pincode: u.pincode || b.pincode || user?.pincode || "",
          });
          setSummary(profileRes.data.summary || null);
        } else {
          setError("Unable to load profile details.");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError(err?.response?.data?.message || "Unable to load profile details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !partner) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: "#3730A3" }} /></Box>;
  }

  const isActive = partner ? partner.isActive !== false : true;
  const rangePrefix = RANGE_LABEL[range] || "Lifetime";
  const displayName = formatName(partner?.name || user?.name || "User");

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", bgcolor: "#f4f6fa", minHeight: "100vh" }}>
      {error && !partner && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {partner && (
        <>
          {/* ── Header card ── */}
          <Card variant="outlined" sx={{ borderRadius: 0.5, mb: 2, borderColor: "#e8edf4" }}>
            <CardContent sx={{ px: 3, pt: 2 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Avatar sx={{ width: 52, height: 52, bgcolor: "#e3edff", color: "#1d4fd1", fontWeight: 800, fontSize: "1.05rem" }}>
                  {initials(displayName)}
                </Avatar>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f1e3d", lineHeight: 1.2 }}>{displayName}</Typography>
                    <Dot tone={isActive ? "green" : "red"}>{isActive ? "Active" : "Suspended"}</Dot>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.75, flexWrap: { xs: "wrap", sm: "nowrap" }, color: "#64748b", fontSize: "0.85rem" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><EmailOutlinedIcon sx={{ fontSize: 16 }} />{partner.email || "—"}</Box>
                    <Box sx={{ width: "1px", alignSelf: "stretch", bgcolor: "#e2e8f0", flexShrink: 0, display: { xs: "none", sm: "block" } }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><PhoneIcon sx={{ fontSize: 16 }} />{partner.phone || "—"}</Box>
                    <Box sx={{ width: "1px", alignSelf: "stretch", bgcolor: "#e2e8f0", flexShrink: 0, display: { xs: "none", sm: "block" } }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}><BadgeIcon sx={{ fontSize: 16 }} />{partner.partner_id || "—"}</Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* ── Key Metrics ── */}
          <Card variant="outlined" sx={{ borderRadius: 0.5, borderColor: "#e8edf4", boxShadow: "0 1px 2px rgba(15,30,61,0.04)", overflow: "hidden", mb: 2 }}>
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BarChartIcon fontSize="small" sx={{ color: "#1d4fd1" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f1e3d" }}>Key Metrics</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarTodayIcon sx={{ fontSize: 16, color: "#64748b" }} />
                  <FormControl size="small">
                    <Select
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                      sx={{ fontSize: "0.85rem", fontWeight: 600, borderRadius: 0.5, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" } }}
                    >
                      <MenuItem value="lifetime">Lifetime</MenuItem>
                      <MenuItem value="month">Last 30 days</MenuItem>
                      <MenuItem value="week">Last 7 days</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Divider sx={{ borderColor: "#eef1f6" }} />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5, px: 3, py: 2.5 }}>
                <StatTile bg="#eef4ff" iconBg="#dbe7ff" iconColor="#1d5fd1" icon={<AccountBalanceWalletOutlinedIcon />} label="Wallet Balance" value={inr0(partner.walletBalance)} />
                <StatTile bg="#eafaf0" iconBg="#d3f2df" iconColor="#12805c" icon={<BoltIcon />} label={`${rangePrefix} Recharged`} value={inr0(summary?.totalRecharged)} />
                <StatTile bg="#fdf3e7" iconBg="#fbe3c2" iconColor="#b26a00" icon={<AccessTimeIcon />} label={`${rangePrefix} Spent`} value={inr0(summary?.totalSpent)} />
                <StatTile bg="#f1eafe" iconBg="#e0d2fb" iconColor="#6d3fd4" icon={<DescriptionOutlinedIcon />} label={`${rangePrefix} Reports`} value={summary?.totalReports ?? "—"} />
              </Box>
            </CardContent>
          </Card>

          {/* ── Account Information ── */}
          <Card variant="outlined" sx={{ borderRadius: 0.5, borderColor: "#e8edf4", boxShadow: "0 1px 2px rgba(15,30,61,0.04)", overflow: "hidden" }}>
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 3, py: 2 }}>
                <PersonOutlineIcon fontSize="small" sx={{ color: "#1d4fd1" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f1e3d" }}>Account Information</Typography>
              </Box>
              <Divider sx={{ borderColor: "#eef1f6" }} />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, px: 3, py: 2.5, columnGap: 4, rowGap: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                  <InfoRow label="Full Name" value={formatName(partner.name) || "—"} />
                  <InfoRow label="Email" value={partner.email || "—"} />
                  <InfoRow label="Phone" value={partner.phone || "—"} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75, borderLeft: { md: "1px solid #eef1f6" }, pl: { md: 4 } }}>
                  <InfoRow label="Partner ID" value={partner.partner_id || "—"} />
                  <InfoRow label="State / City" value={[partner.city, partner.state].filter(Boolean).join(", ") || "—"} />
                  <InfoRow label="Pincode" value={partner.pincode || "—"} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75, borderLeft: { md: "1px solid #eef1f6" }, pl: { md: 4 } }}>
                  <InfoRow icon={<CalendarTodayIcon sx={{ fontSize: 15, color: "#64748b" }} />} label="Date of Joining" value={fmtDate(partner.createdAt)} />
                  <InfoRow icon={<AccessTimeIcon sx={{ fontSize: 15, color: "#64748b" }} />} label="Last Login" value={partner.lastLoginAt ? fmtDT(partner.lastLoginAt) : "—"} />
                  <InfoRow icon={<StarBorderIcon sx={{ fontSize: 15, color: "#64748b" }} />} label="Active Plan" value={partner.activePlan ? String(partner.activePlan).toUpperCase() : "—"} />
                  <InfoRow
                    icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: isActive ? "#16a34a" : "#e05252", ml: "3px", mr: "4px" }} />}
                    label="Account Status"
                    value={<Dot tone={isActive ? "green" : "red"}>{isActive ? "Active" : "Suspended"}</Dot>}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default Profile;
