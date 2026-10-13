import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import confetti from "canvas-confetti";
import AuthLayout from "../../Components/auth/AuthLayout";
import AuthCard from "../../Components/auth/AuthCard";

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
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef(null);


  const [fromRegister] = useState(
    () =>
      location.state?.fromRegister === true ||
      sessionStorage.getItem(SESSION_FLAG) === "1"
  );

  useEffect(() => {
    if (!fromRegister) {
      // Not arrived via registration, redirect to login immediately.
      navigate("/login", { replace: true });
      return;
    }

    // Clear the sessionStorage flag the moment we land here.
    sessionStorage.removeItem(SESSION_FLAG);

    // Start countdown.
    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          navigate(DASHBOARD_PATH, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };

  }, [fromRegister, navigate]);

  // ── Celebration: party-popper confetti on page open ───────────────────────
  useEffect(() => {
    if (!fromRegister) return;

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
  }, [fromRegister]);

  const goNow = () => {

    clearInterval(intervalRef.current);
    navigate(DASHBOARD_PATH, { replace: true });
  };

  // While the guard is still deciding, render nothing to avoid flash.
  if (!fromRegister) return null;



  return (
    <AuthLayout variant="split">
      <AuthCard
        sx={{
          maxWidth: 520,
          textAlign: "center",
        }}
      >
        {/* Success icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
            mt: 1,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
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
            <CheckCircleIcon sx={{ fontSize: 48, color: "#10B981" }} />
          </Box>
        </Box>

        {/* Heading */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontWeight: 800,
            mb: 1.5,
            letterSpacing: "-0.02em",
          }}
        >
          Welcome to Verify Hub
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, lineHeight: 1.7 }}
        >
          You have created your VerifyHub account successfully.
        </Typography>

        {/* ── Countdown: gradient ring + glass pill ───────────────────────── */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            mb: 4,
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
                inset: -10,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(20,184,166,0.08) 55%, transparent 75%)",
                filter: "blur(8px)",
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
                  fontSize: 40,
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
                  mt: 0.5,
                  fontSize: 10,
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
              gap: 1,
              px: 2,
              py: 0.9,
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
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#10B981",
                animation: "vhDot 1.4s ease-in-out infinite",
                "@keyframes vhDot": {
                  "0%, 100%": {
                    boxShadow: "0 0 0 0 rgba(16,185,129,0.5)",
                  },
                  "50%": {
                    boxShadow: "0 0 0 6px rgba(16,185,129,0)",
                  },
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "text.secondary" }}
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
          size="large"
          variant="contained"
          onClick={goNow}
          endIcon={
            <ArrowForwardRoundedIcon
              className="vh-cta-arrow"
              sx={{ transition: "transform 0.25s ease" }}
            />
          }
          sx={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #2563EB 0%, #0EA5E9 60%, #14B8A6 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "0.01em",
            borderRadius: "14px",
            py: 1.6,
            textTransform: "none",
            boxShadow:
              "0 10px 24px -6px rgba(37,99,235,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
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
              transform: "translateY(-2px)",
              boxShadow:
                "0 16px 32px -8px rgba(37,99,235,0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
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
    </AuthLayout>
  );
};

export default Welcome;