import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Grid, Paper, Skeleton, Button, Chip,
  List, ListItem, ListItemText, Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import {
  RefreshCw, Download, FileText, BarChart3, Wallet, IndianRupee,
    Percent, AlertTriangle, Ticket, Bot, Building2, Plus, CircleDot,
} from "lucide-react";
import useAuth from "../../context/useAuth";
import DataTable from "../../components/shared/DataTable";
import StatusBadge from "../../components/shared/StatusBadge";
import { KpiCard, ChartCard, TrendChart, ScoreBars, timeAgo } from "../../Components/partner/PartnerWidgets";

const API = (path) => {
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const inrShort = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const LOW_BALANCE_AT = 500;

const formatName = (name = "") => {
  return name.trim().toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const arrowDelta = (pct) => {
  if (pct == null) return "";
  return `${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct)}%`;
};

const QUICK_PULLS = [
  { label: "Experian", sub: "Credit report", path: "/partner/credit-reports/experian", icon: <Building2 size={18} />, bg: "#EFF6FF", fg: "#3B82F6" },
  { label: "CRIF", sub: "Credit report", path: "/partner/credit-reports/crif", icon: <Building2 size={18} />, bg: "#F5F3FF", fg: "#8B5CF6" },
  { label: "CIBIL", sub: "Credit report", path: "/partner/credit-reports/cibil", icon: <Building2 size={18} />, bg: "#ECFDF5", fg: "#10B981" },
  { label: "Equifax", sub: "Credit report", path: "/partner/credit-reports/equifax", icon: <Building2 size={18} />, bg: "#ECFEFF", fg: "#06B6D4" },
  { label: "AI Analysis", sub: "Smart insights", path: "/partner/ai-analyzer", icon: <Bot size={18} />, bg: "#EEF2FF", fg: "#4F46E5" },
  { label: "Add Funds", sub: "Top up wallet", path: "/partner/add-funds", icon: <Plus size={18} />, bg: "#FFF7ED", fg: "#F59E0B" },
];

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { user, token, login, logout } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [range, setRange] = useState(14);
  const [metric, setMetric] = useState("reports"); // reports | spend
  const [trend, setTrend] = useState([]);
  const [scores, setScores] = useState([]);
  const [recent, setRecent] = useState({ pulls: [], recentTxns: [], recentTickets: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setRefreshing(true);
      setErr(false);
      const h = authHeaders();
      const [sm, t, sc, rc] = await Promise.all([
        axios.get(API("/partner/overview/summary"), { headers: h }).then((r) => r.data),
        axios.get(API(`/partner/overview/timeseries?days=${range}`), { headers: h }).then((r) => r.data),
        axios.get(API("/partner/overview/score-mix"), { headers: h }).then((r) => r.data),
        axios.get(API("/partner/overview/recent"), { headers: h }).then((r) => r.data),
      ]);
      if (sm.success) {
        setSummary(sm.data);
        // Fix stale wallet balance from login-time context
        if (user && token && sm.data.walletBalance !== user.walletBalance) {
          login({ ...user, walletBalance: sm.data.walletBalance }, token);
        }
      } else setErr(true);
      if (t.success) setTrend(t.data);
      if (sc.success) setScores(sc.data);
      if (rc.success) setRecent(rc.data);
      setUpdatedAt(new Date());
    } catch (e) {
      console.error("Partner dashboard fetch failed:", e);
      // Stale/dead token (account deleted, wrong DB, expired session):
      // drop the session and send the partner back to login instead of
      // rendering a broken dashboard.
      if (e?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setErr(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const exportCsv = () => {
    const rows = [
      ["Date", "Reports", "Spend"],
      ...trend.map((d) => [d.date, d.reports, d.spend]),
    ].map((r) => r.join(",")).join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "my-activity.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const s = summary || {};
  const scoreTotal = scores.reduce((sum, b) => sum + (b.count || 0), 0);
  const openTotal = (s.openTickets ?? 0) + (s.inProgressTickets ?? 0);
  const lowWallet = (s.walletBalance ?? 0) < LOW_BALANCE_AT;

  const kpiRow1 = [
    {
      icon: <FileText size={18} />, iconBg: "#EFF6FF", iconColor: "#3B82F6",
      title: "Reports Today", value: err ? "—" : String(s.reportsToday ?? 0),
      delta: arrowDelta(s.todayDeltaPct), deltaTone: (s.todayDeltaPct ?? 0) >= 0 ? "up" : "down",
      subtitle: `${s.reportsToday ?? 0} pulled today`,
    },
    {
      icon: <BarChart3 size={18} />, iconBg: "#ECFDF5", iconColor: "#10B981",
      title: "Reports This Month", value: err ? "—" : String(s.reportsThisMonth ?? 0),
      delta: arrowDelta(s.monthDeltaPct), deltaTone: (s.monthDeltaPct ?? 0) >= 0 ? "up" : "down",
      subtitle: `${s.failedThisMonth ?? 0} failed · ${s.successRate ?? 100}% success`,
    },
    {
      icon: <Wallet size={18} />, iconBg: "#F5F3FF", iconColor: "#8B5CF6",
      title: "Wallet Balance", value: err ? "—" : inr(s.walletBalance), valueColor: "#2563EB",
      subtitle: lowWallet ? `Below ₹${LOW_BALANCE_AT} — top up soon` : "Available for pulls",
    
    },
    {
      icon: <IndianRupee size={18} />, iconBg: "#FFF7ED", iconColor: "#F59E0B",
      title: "Spent This Month", value: err ? "—" : inrShort(s.spentThisMonth),
      subtitle: s.lastRecharge
        ? `Last top-up ${inrShort(s.lastRecharge.amount)} · ${timeAgo(s.lastRecharge.createdAt)}`
        : "No top-up yet",
    },
  ];

  const kpiRow2 = [
    {
      icon: <Percent size={18} />, iconBg: "#ECFDF5", iconColor: "#10B981",
      title: "Success Rate", value: err ? "—" : `${s.successRate ?? 100}%`,
      subtitle: `${s.failedThisMonth ?? 0} failures · not charged`,
    },
    {
      icon: <AlertTriangle size={18} />, iconBg: "#FEF2F2", iconColor: "#EF4444",
      title: "Failed Pulls", value: err ? "—" : String(s.failedThisMonth ?? 0),
      subtitle: "Failed pulls incur a nominal fee",
    },
    {
      icon: <Ticket size={18} />, iconBg: "#FFF7ED", iconColor: "#F59E0B",
      title: "My Tickets", value: err ? "—" : String(openTotal),
      subtitle: `${s.openTickets ?? 0} open · ${s.inProgressTickets ?? 0} in progress`,
      action: (
        <Button size="small" variant="text" sx={{ fontSize: "0.68rem", minWidth: 0 }} onClick={() => navigate("/partner/account/support")}>
          New →
        </Button>
      ),
    },
  ];

  const pullColumns = [
    {
      header: "Customer", field: "customer", minWidth: 130,
      render: (r) => (
        <Typography title={r.customer} sx={{ fontWeight: 600, fontSize: "0.82rem", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {r.customer}
        </Typography>
      ),
    },
    {
      header: "Bureau", field: "bureau", nowrap: true, minWidth: 90,
      render: (r) => <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap" }}>{r.bureau}</Typography>,
    },
    {
      header: "Score", field: "score", nowrap: true, minWidth: 70,
      render: (r) => <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>{r.score}</Typography>,
    },
    { header: "Status", field: "status", nowrap: true, minWidth: 110, render: (r) => <StatusBadge status={r.status} /> },
    {
      header: "Pulled At", field: "createdAt", nowrap: true, minWidth: 170,
      render: (r) => (
        <Typography sx={{ fontSize: "0.75rem", color: "#8A94A6", whiteSpace: "nowrap" }}>
          {r.createdAt ? format(new Date(r.createdAt), "dd MMM yyyy, hh:mm a") : "—"}
        </Typography>
      ),
    },
  ];

  // Unified activity feed: pulls + wallet movements, newest first
  const feed = [
    ...(recent.pulls || []).map((p) => ({
      id: `p-${p.id}`, type: p.status === "Success" ? "pull" : "fail",
      message: p.status === "Success" ? `Report pulled · ${p.customer}` : `Report failed · ${p.customer}`,
      sub: p.bureau, timestamp: p.createdAt, amount: 0,
    })),
    ...(recent.recentTxns || []).map((t) => ({
      id: `t-${t._id}`, type: t.type === "CREDIT" ? "recharge" : "spend",
      message: t.type === "CREDIT" ? "Wallet recharged" : "Report charge",
      sub: t.purpose?.replace(/_/g, " ") || "", timestamp: t.createdAt,
      amount: t.type === "CREDIT" ? t.amount : -Math.abs(t.amount),
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

  const dotColor = (type) => type === "pull" || type === "recharge" ? "#10B981" : type === "fail" ? "#EF4444" : type === "spend" ? "#F59E0B" : "#3B82F6";

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
            {getGreeting()}, {formatName(user?.name || "Partner")}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            Pulls, wallet and activity{updatedAt ? ` · updated ${updatedAt.toLocaleTimeString()}` : ""}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.75, alignItems: "center", flexWrap: "wrap" }}>
          {[7, 14, 30].map((d) => (
            <Chip key={d} label={`${d}D`} clickable size="small"
              color={range === d ? "primary" : "default"} variant={range === d ? "filled" : "outlined"}
              onClick={() => setRange(d)} sx={{ fontWeight: 600, fontSize: "0.7rem", height: 30, borderRadius: 2 }} />
          ))}
          <Button size="small" variant="text" startIcon={<RefreshCw size={13} />} onClick={fetchAll} disabled={refreshing} sx={{ fontSize: "0.75rem" }}>
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
          <Button size="small" variant="text" startIcon={<Download size={13} />} onClick={exportCsv} disabled={!trend.length} sx={{ fontSize: "0.75rem" }}>
            Export
          </Button>
        </Box>
      </Box>

      {/* KPI row 1 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Skeleton variant="rounded" height={108} sx={{ borderRadius: 2.5 }} />
          </Grid>
        )) : kpiRow1.map((k) => (
          <Grid key={k.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard {...k} subtitle={err ? "Could not load" : k.subtitle} />
          </Grid>
        ))}
      </Grid>

      {/* KPI row 2 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {loading ? Array.from({ length: 3 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Skeleton variant="rounded" height={108} sx={{ borderRadius: 2.5 }} />
          </Grid>
        )) : kpiRow2.map((k) => (
          <Grid key={k.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <KpiCard {...k} subtitle={err ? "Could not load" : k.subtitle} />
          </Grid>
        ))}
      </Grid>

      {/* Quick pulls */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {QUICK_PULLS.map((q) => (
          <Grid key={q.label} size={{ xs: 6, sm: 4, md: 2 }}>
            <Paper
              onClick={() => navigate(q.path)}
              sx={{
                borderRadius: 2.5, border: "1px solid", borderColor: "divider", boxShadow: "none",
                p: 1.75, display: "flex", alignItems: "center", gap: 1.25, cursor: "pointer",
                transition: "transform 0.12s ease, box-shadow 0.12s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 16px rgba(0,0,0,0.07)" },
              }}
            >
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: q.bg, color: q.fg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {q.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.78rem", lineHeight: 1.2 }}>{q.label}</Typography>
                <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.68rem" }}>{q.sub}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Trend + score mix */}
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard
            title={metric === "reports" ? "My report volume" : "My spend"}
            subtitle={metric === "reports" ? `Last ${range} days · daily pulls` : `Last ${range} days · report charges`}
            height={210}
            action={
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[["reports", "Reports"], ["spend", "Spend"]].map(([key, label]) => (
                  <Chip key={key} label={label} clickable size="small"
                    color={metric === key ? "primary" : "default"} variant={metric === key ? "filled" : "outlined"}
                    onClick={() => setMetric(key)} sx={{ fontWeight: 600, fontSize: "0.68rem", height: 26 }} />
                ))}
              </Box>
            }
          >
            {loading ? <Skeleton variant="rounded" height={210} sx={{ borderRadius: 2 }} /> : (
              <TrendChart
                data={trend} dataKey={metric} label={metric === "reports" ? "Reports" : "Spend (₹)"}
                color={metric === "reports" ? "#4F46E5" : "#F59E0B"} money={metric === "spend"}
              />
            )}
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard
            title="My score mix"
            subtitle={scoreTotal > 0 ? `${scoreTotal} scored reports` : "Credit health bands"}
            height={210}
          >
            {loading ? <Skeleton variant="rounded" height={210} sx={{ borderRadius: 2 }} /> : <ScoreBars data={scores} />}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Pulls + wallet stack */}
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 8 }}>
          <DataTable
            title="Recent report pulls"
            actionLabel="All reports"
            onAction={() => navigate("/partner/account/reports")}
            columns={pullColumns}
            data={loading ? [] : (recent.pulls || [])}
            emptyMessage={loading ? "Loading…" : "No reports yet — pull your first one above"}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper sx={{ borderRadius: 2.5, border: "1px solid", borderColor: lowWallet ? "#FECACA" : "divider", boxShadow: "none", p: 2, bgcolor: lowWallet ? "#FFFBFB" : "background.paper" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Wallet size={16} color={lowWallet ? "#DC2626" : "#8B5CF6"} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>My Wallet</Typography>
                <Button size="small" variant="text" sx={{ ml: "auto", fontSize: "0.72rem", minWidth: 0 }} onClick={() => navigate("/partner/add-funds")}>
                  Top up →
                </Button>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#2563EB" }}>
                {loading ? "—" : inr(s.walletBalance)}
              </Typography>
              <Typography variant="caption" sx={{ color: lowWallet ? "error.main" : "text.disabled", fontWeight: lowWallet ? 700 : 400 }}>
                {lowWallet ? `Low balance — top up to keep pulling uninterrupted` : `Spent ${inrShort(s.spentThisMonth)} this month`}
              </Typography>
              <Divider sx={{ my: 1 }} />
              {(recent.recentTxns || []).length === 0
                ? <Typography variant="caption" sx={{ color: "text.disabled" }}>No transactions yet</Typography>
                : (recent.recentTxns || []).slice(0, 3).map((t) => (
                  <Box key={t._id} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.4 }}>
                    <CircleDot size={10} color={t.type === "CREDIT" ? "#10B981" : "#F59E0B"} fill="currentColor" />
                    <Typography variant="caption" sx={{ flex: 1, fontSize: "0.75rem", fontWeight: 600 }} noWrap>
                      {t.type === "CREDIT" ? "Top-up" : "Report charge"}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: t.type === "CREDIT" ? "success.main" : "text.primary" }}>
                      {t.type === "CREDIT" ? "+" : "−"}{inrShort(t.amount)}
                    </Typography>
                  </Box>
                ))}
              <Button size="small" variant="text" sx={{ mt: 0.5, fontSize: "0.72rem", minWidth: 0, p: 0 }} onClick={() => navigate("/partner/account/transactions")}>
                Full history →
              </Button>
            </Paper>
            <Paper sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", boxShadow: "none", p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "baseline", mb: 0.25 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>My Support</Typography>
                <Button size="small" variant="text" sx={{ ml: "auto", fontSize: "0.72rem", minWidth: 0 }} onClick={() => navigate("/partner/account/support")}>
                  Open →
                </Button>
              </Box>
              <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.7rem" }}>
                {openTotal > 0 ? `${openTotal} ticket${openTotal !== 1 ? "s" : ""} need attention` : "No open tickets ✓"}
              </Typography>
              <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                {(recent.recentTickets || []).map((t) => (
                  <Box key={t._id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircleDot size={10} color={t.status === "resolved" ? "#10B981" : t.status === "open" ? "#EF4444" : "#F59E0B"} fill="currentColor" />
                    <Typography variant="caption" sx={{ flex: 1, fontSize: "0.75rem", fontWeight: 600 }} noWrap>
                      {t.category}
                    </Typography>
                    <StatusBadge status={t.status === "resolved" ? "Success" : t.status} />
                    <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.7rem", flexShrink: 0 }}>
                      {timeAgo(t.createdAt)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Activity feed */}
      <Paper sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
        <Box sx={{ px: 2.5, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>Activity</Typography>
          <Button size="small" variant="text" sx={{ fontSize: "0.75rem", color: "#12B886", fontWeight: 600 }} onClick={() => navigate("/partner/account/activity")}>
            View all →
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ p: 2.5 }}><Skeleton variant="rounded" height={120} /></Box>
        ) : feed.length === 0 ? (
          <Box sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <CircleDot size={28} color="#CBD5E1" />
            <Typography variant="body2" sx={{ color: "text.disabled" }}>No activity yet — your pulls and top-ups will appear here</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {feed.map((a, idx) => (
              <React.Fragment key={a.id}>
                <ListItem sx={{ py: 1.5, px: 2.5, alignItems: "flex-start" }}>
                  <Box sx={{ minWidth: 28, mt: 0.5 }}>
                    <CircleDot size={12} color={dotColor(a.type)} fill="currentColor" />
                  </Box>
                  <ListItemText
                    disableTypography
                    primary={<Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.82rem" }}>{a.message}</Typography>}
                    secondary={
                      <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {a.sub ? `${a.sub} · ` : ""}{timeAgo(a.timestamp)}
                        </Typography>
                        {a.amount !== 0 && (
                          <Typography variant="caption" sx={{ color: a.amount > 0 ? "success.main" : "text.disabled", fontWeight: 700 }}>
                            {a.amount > 0 ? `+${inrShort(a.amount)}` : `−${inrShort(Math.abs(a.amount))}`}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {idx < feed.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default PartnerDashboard;
