import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";

import { creditAPI } from "../../services/authService";

const getInitials = (name) => {
  if (!name) return "U";

  const parts = String(name).trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Profile = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FIELD ROW
  // ==========================================

  const FieldRow = ({ label, value }) => {
    const displayValue =
      value !== null && value !== undefined && String(value).trim() !== ""
        ? String(value)
        : "—";

    return (
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            display: "block",
            lineHeight: 1,
            mb: 0.7,
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            wordBreak: "break-word",
          }}
        >
          {displayValue}
        </Typography>
      </Box>
    );
  };

  // ==========================================
  // GET CREDIT BUREAU DETAILS
  // ==========================================

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await creditAPI.getCreditBureauDetails();

        console.log("Credit Bureau Details:", response);

        // API response directly returned from authService
        if (response?.success && response?.data) {
          const data = response.data;

          setUserDetails({
            userId: String(data.userId || ""),
            name: String(data.name || ""),
            mobile: String(data.mobile || ""),
            email: String(data.email || ""),
            pan: String(data.pan || ""),

            // partnerId null hai,
            // isliye userId ko Partner ID ke liye use kar rahe hain
            partnerId: String(data.userId || ""),
          });
        } else {
          setError(response?.message || "Failed to fetch profile details");
        }
      } catch (error) {
        console.error("Failed to fetch credit bureau details:", error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load profile details.",
        );
      } finally {
        setLoading(false);
      }
    };

    getUserDetails();
  }, []);

  // ==========================================
  // DISPLAY VALUES
  // ==========================================

  const displayName = userDetails?.name || "User";

  const displayPartnerId = userDetails?.userId || "—";

  // ==========================================
  // UI
  // ==========================================

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 1, sm: 2 },
        py: { xs: 2, sm: 3 },
      }}
    >
      {/* ==========================================
          HEADER
      ========================================== */}

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 1,
          }}
        >
          Profile
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
          }}
        >
          Your personal information and credit bureau account details.
        </Typography>
      </Box>

      {/* ==========================================
          PROFILE CARD
      ========================================== */}

      <Paper
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          mb: 4,
        }}
      >
        {/* ==========================================
            PROFILE HEADER
        ========================================== */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 2,
            mb: 4,
          }}
        >
          {/* USER */}

          <Box
            sx={{
              display: "flex",
              gap: 2.5,
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: "secondary.main",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.75rem",
              }}
            >
              {getInitials(displayName)}
            </Avatar>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  mb: 0.5,
                }}
              >
                {displayName}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                Partner ID: <strong>{displayPartnerId}</strong>
              </Typography>
            </Box>
          </Box>

          {/* ACCOUNT STATUS */}

          <Chip
            label="Credit Bureau Account"
            sx={{
              bgcolor: "#EEF2FF",
              color: "#4338CA",
              fontWeight: 700,
              borderRadius: 6,
              px: 1,
              py: 2.5,
              fontSize: "0.8rem",
            }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* ==========================================
            PERSONAL DETAILS
        ========================================== */}

        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 3,
          }}
        >
          Personal Details
        </Typography>

        {/* LOADING */}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 5,
            }}
          >
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          /* ERROR */

          <Box
            sx={{
              textAlign: "center",
              py: 5,
            }}
          >
            <Typography
              color="error"
              sx={{
                fontWeight: 600,
              }}
            >
              {error}
            </Typography>
          </Box>
        ) : userDetails ? (
          /* DATA */

          <Grid container spacing={4}>
            {/* LEFT COLUMN */}

            <Grid item xs={12} md={6}>
              <FieldRow label="Full Name" value={userDetails.name} />

              <Divider sx={{ my: 2 }} />

              <FieldRow label="PAN Number" value={userDetails.pan} />

              <Divider sx={{ my: 2 }} />

              <FieldRow label="Mobile Number" value={userDetails.mobile} />
            </Grid>

            {/* RIGHT COLUMN */}

            <Grid item xs={12} md={6}>
              <FieldRow label="Email Address" value={userDetails.email} />

              <Divider sx={{ my: 2 }} />

              {/* USER ID AS PARTNER ID */}

              <FieldRow label="Partner ID" value={userDetails.userId} />

              <Divider sx={{ my: 2 }} />

              <FieldRow label="User ID" value={userDetails.userId} />
            </Grid>
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 5,
            }}
          >
            <Typography color="text.secondary">
              Unable to load profile details.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* ==========================================
          CREDIT BUREAU CARD
      ========================================== */}

      <Paper
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 1,
          }}
        >
          Credit Bureau Details
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 3,
          }}
        >
          Credit bureau services available for your account.
        </Typography>

        <Grid container spacing={2}>
          {/* CIBIL */}

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                height: "100%",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 2,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                }}
              >
                CIBIL
              </Typography>

              <Chip
                label="Coming Soon"
                size="small"
                sx={{
                  mt: 1.5,
                  fontWeight: 600,
                }}
              />
            </Paper>
          </Grid>

          {/* EXPERIAN */}

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                height: "100%",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 2,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                }}
              >
                Experian
              </Typography>

              <Chip
                label="Available"
                size="small"
                color="success"
                sx={{
                  mt: 1.5,
                  fontWeight: 600,
                }}
              />
            </Paper>
          </Grid>

          {/* CRIF */}

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                height: "100%",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 2,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                }}
              >
                CRIF
              </Typography>

              <Chip
                label="Available"
                size="small"
                color="success"
                sx={{
                  mt: 1.5,
                  fontWeight: 600,
                }}
              />
            </Paper>
          </Grid>

          {/* EQUIFAX */}

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                height: "100%",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 2,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                }}
              >
                Equifax
              </Typography>

              <Chip
                label="Coming Soon"
                size="small"
                sx={{
                  mt: 1.5,
                  fontWeight: 600,
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
