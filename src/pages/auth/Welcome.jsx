import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import confetti from "canvas-confetti";
import AuthCard from "../../Components/auth/AuthCard";
import Logo from "../../Components/shared/Logo";
import useAuth from "../../context/useAuth";
import { trackVirtualPageView } from "../../utils/analytics";

const COUNTDOWN_SECONDS = 5;
const DASHBOARD_PATH = "/partner/dashboard";
const SESSION_FLAG = "vh_from_register";

// Timer ring geometry
const RING_SIZE = 112;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef(null);
  const pageViewFiredRef = useRef(false);

  // Accessible if user just registered OR if already authenticated
  const isAllowed = Boolean(
    location.state?.fromRegister === true ||
    sessionStorage.getItem(SESSION_FLAG) === "1" ||
    user
  );

  useEffect(() => {
    if (!isAllowed) {
      // Unauthenticated non-registered visitor: redirect to login
      navigate("/login/register", { replace: true });
      return;
    }

    // Fire virtual page view once per load using window.location.pathname
    if (!pageViewFiredRef.current) {
      pageViewFiredRef.current = true;
      trackVirtualPageView(
        typeof window !== "undefined" ? window.location.pathname : "/thank-you",
        "Thank You - Registration Confirmed"
      );
    }

    // Start countdown for full duration before redirecting to dashboard
    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          sessionStorage.removeItem(SESSION_FLAG);
          navigate(DASHBOARD_PATH, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isAllowed, navigate]);

  // ── Celebration: party-popper confetti on page open ───────────────────────
  useEffect(() => {
    if (!isAllowed) return;

    // Respect users who prefer reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const defaults = {
      colors: ["#2563EB", "#3B82F6", "#10B981", "#34D399", "#FBBF24", "#F472B6"],
      zIndex: 9999,
    };

    // 1) Two "poppers" firing inward from the bottom corners.
    confetti({
      ...defaults,
      particleCount: 90,
      angle: 60,
      spread: 70,
      startVelocity: 55,
      origin: { x: 0, y: 0.85 },
    });
    confetti({
      ...defaults,
      particleCount: 90,
      angle: 120,
      spread: 70,
      startVelocity: 55,
      origin: { x: 1, y: 0.85 },
    });

    // 2) A softer burst from the centre a moment later.
    const burstTimer = setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 70,
        spread: 100,
        startVelocity: 35,
        origin: { x: 0.5, y: 0.55 },
      });
    }, 350);

    return () => {
      clearTimeout(burstTimer);
      confetti.reset();
    };
  }, [isAllowed]);

  const goNow = () => {
    clearInterval(intervalRef.current);
    sessionStorage.removeItem(SESSION_FLAG);
    navigate(DASHBOARD_PATH, { replace: true });
  };

  // Render nothing while unauthorized check resolves
  if (!isAllowed) return null;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#F6F8FB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        boxSizing: "border-box",
      }}
    >
      {/* Compact Logo above card */}
      <Box sx={{ mb: { xs: 2, sm: 2.5 }, display: "flex", justifyContent: "center" }}>
        <Logo height={32} alt="VerifyHub" />
      </Box>

      <AuthCard
        sx={{
          maxWidth: 480,
          textAlign: "center",
          "& .MuiBox-root": {
            boxSizing: "border-box",
          },
        }}
      >
        {/* Success icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: { xs: 1.5, sm: 2 },
            mt: 0.5,
          }}
        >
          <Box
            sx={{
              width: { xs: 64, sm: 72 },
              height: { xs: 64, sm: 72 },
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 70%)",
              border: "2px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": {
                  boxShadow: "0 0 0 0 rgba(16,185,129,0.3)",
                },
                "50%": {
                  boxShadow: "0 0 0 12px rgba(16,185,129,0)",
                },
              },
            }}
          >
            <CheckCircleIcon sx={{ fontSize: { xs: 38, sm: 44 }, color: "#10B981" }} />
          </Box>
        </Box>

        {/* Thank-you pill */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.5,
            py: 0.45,
            mb: { xs: 1.25, sm: 1.5 },
            borderRadius: "999px",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.22)",
          }}
        >
          <FavoriteRoundedIcon sx={{ fontSize: 13, color: "#10B981" }} />
          <Typography
            component="span"
            sx={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#059669",
            }}
          >
            Thank you for registering
          </Typography>
        </Box>

        {/* Heading (Single h1 for page accessibility) */}
        <Typography
          component="h1"
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontSize: { xs: "1.5rem", sm: "1.75rem" },
            fontWeight: 800,
            mb: 1,
            letterSpacing: "-0.02em",
            color: "text.primary",
          }}
        >
          Welcome to Verify Hub
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: { xs: 2, sm: 2.5 }, lineHeight: 1.55, maxWidth: 360, mx: "auto", fontSize: { xs: "0.875rem", sm: "0.925rem" } }}
        >
          Your account has been created successfully. Head to your dashboard to explore.
        </Typography>

        {/* ── Countdown: gradient ring + glass pill ───────────────────────── */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            mb: { xs: 2.5, sm: 3 },
          }}
        >
          {/* Ring */}
          <Box
            sx={{
              position: "relative",
              width: RING_SIZE,
              height: RING_SIZE,
            }}
          >
            {/* Soft glow behind the ring */}
            <Box
              aria-hidden="true"
              sx={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(20,184,166,0.08) 55%, transparent 75%)",
                filter: "blur(6px)",
              }}
            />

            <Box
              component="svg"
              aria-hidden="true"
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              sx={{
                position: "relative",
                transform: "rotate(-90deg)",
                display: "block",
              }}
            >
              <defs>
                <linearGradient
                  id="vhRingGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              {/* Track */}
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="rgba(37,99,235,0.10)"
                strokeWidth={RING_STROKE}
              />

              {/* Progress: smoothly drains over COUNTDOWN_SECONDS */}
              <Box
                component="circle"
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="url(#vhRingGradient)"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                sx={{
                  strokeDashoffset: 0,
                  animation: `vhRingDrain ${COUNTDOWN_SECONDS}s linear forwards`,
                  "@keyframes vhRingDrain": {
                    from: { strokeDashoffset: 0 },
                    to: { strokeDashoffset: RING_CIRCUMFERENCE },
                  },
                }}
              />
            </Box>

            {/* Number in the middle (re-mounts each second for a pop effect) */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                key={count}
                component="span"
                sx={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontSize: 34,
                  fontWeight: 800,
                  lineHeight: 1,
                  background:
                    "linear-gradient(135deg, #2563EB 0%, #10B981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "vhTick 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                  "@keyframes vhTick": {
                    from: { transform: "scale(0.6)", opacity: 0 },
                    to: { transform: "scale(1)", opacity: 1 },
                  },
                }}
              >
                {count}
              </Typography>
              <Typography
                component="span"
                sx={{
                  mt: 0.25,
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                {count === 1 ? "sec" : "secs"}
              </Typography>
            </Box>
          </Box>

          {/* Glass pill with the status text */}
          <Box
            role="status"
            aria-live="polite"
            aria-atomic="true"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.75,
              py: 0.7,
              borderRadius: "999px",
              background: "rgba(37,99,235,0.06)",
              border: "1px solid rgba(37,99,235,0.14)",
              backdropFilter: "blur(6px)",
            }}
          >
            {/* Live dot */}
            <Box
              aria-hidden="true"
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#10B981",
                animation: "vhDot 1.4s ease-in-out infinite",
                "@keyframes vhDot": {
                  "0%, 100%": {
                    boxShadow: "0 0 0 0 rgba(16,185,129,0.5)",
                  },
                  "50%": {
                    boxShadow: "0 0 0 5px rgba(16,185,129,0)",
                  },
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "text.secondary", fontSize: "0.825rem" }}
            >
              Taking you to your Partner Dashboard in{" "}
              <Box
                component="span"
                sx={{ fontWeight: 700, color: "#2563EB" }}
              >
                {count}s
              </Box>
            </Typography>
          </Box>
        </Box>

        {/* ── CTA button ──────────────────────────────────────────────────── */}
        <Button
          id="welcome-go-to-dashboard-btn"
          fullWidth
          size="medium"
          variant="contained"
          onClick={goNow}
          endIcon={
            <ArrowForwardRoundedIcon
              className="vh-cta-arrow"
              sx={{ transition: "transform 0.25s ease", fontSize: 18 }}
            />
          }
          sx={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #2563EB 0%, #0EA5E9 60%, #14B8A6 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.95rem",
            letterSpacing: "0.01em",
            borderRadius: "12px",
            py: 1.3,
            textTransform: "none",
            boxShadow:
              "0 8px 20px -6px rgba(37,99,235,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",

            // Shine sweep
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-75%",
              width: "50%",
              height: "100%",
              background:
                "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
              transform: "skewX(-20deg)",
              transition: "left 0.6s ease",
            },

            "&:hover": {
              background:
                "linear-gradient(135deg, #1D4ED8 0%, #0284C7 60%, #0D9488 100%)",
              transform: "translateY(-1px)",
              boxShadow:
                "0 12px 28px -6px rgba(37,99,235,0.55), inset 0 1px 0 rgba(255,255,255,0.3)",
            },
            "&:hover::after": { left: "130%" },
            "&:hover .vh-cta-arrow": { transform: "translateX(4px)" },
            "&:active": { transform: "translateY(0)" },
            "&:focus-visible": {
              outline: "3px solid rgba(37,99,235,0.35)",
              outlineOffset: "3px",
            },
          }}
        >
          Go to Dashboard
        </Button>
      </AuthCard>
    </Box>
  );
};

export default Welcome;