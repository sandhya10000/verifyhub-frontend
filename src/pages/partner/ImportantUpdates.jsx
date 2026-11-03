import React from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { FaWhatsapp, FaArrowRight } from "react-icons/fa";
import { Megaphone } from "lucide-react";
import { socialLinks } from "../../Components/common/SocialLinks";

const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbE9c0Q0rGiPOGFW7t2V";

// Important Updates: announcements channel (WhatsApp) plus the company's
// social profiles, reusing the same link list as the sidebar footer.
const ImportantUpdates = () => {
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #1D4ED8 0%, #6366F1 100%)",
            color: "#fff", boxShadow: "0 6px 16px rgba(29,78,216,.25)",
          }}
        >
          <Megaphone size={22} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "1.35rem", fontWeight: 800, color: "#0F1B2D", lineHeight: 1.2 }}>
            Important Updates
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#64748B" }}>
            Product news, offers and announcements from VerifyHub
          </Typography>
        </Box>
      </Box>

      {/* WhatsApp channel hero */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          mb: 3,
          color: "#fff",
          background: "linear-gradient(120deg, #075E54 0%, #128C7E 60%, #25D366 100%)",
          boxShadow: "0 14px 32px rgba(7,94,84,.25)",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2.5,
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute", right: -60, top: -60, width: 220, height: 220,
            borderRadius: "50%", background: "rgba(255,255,255,.08)",
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, position: "relative" }}>
          <Box
            sx={{
              width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.3)",
            }}
          >
            <FaWhatsapp size={30} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1.15rem", fontWeight: 800 }}>
              Join our WhatsApp Channel
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", opacity: 0.9, mt: 0.5, maxWidth: 480 }}>
              Get important updates, new feature launches and offers directly on WhatsApp.
            </Typography>
          </Box>
        </Box>
        <Button
          component="a"
          href={WHATSAPP_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<FaArrowRight size={13} />}
          sx={{
            position: "relative", flexShrink: 0,
            bgcolor: "#fff", color: "#075E54", fontWeight: 800, textTransform: "none",
            px: 3, py: 1.2, borderRadius: 999, boxShadow: "0 6px 16px rgba(0,0,0,.18)",
            "&:hover": { bgcolor: "#F0FDF4", transform: "translateY(-1px)" },
            transition: "all .18s ease",
          }}
        >
          Join Channel
        </Button>
      </Box>

      {/* Social profiles */}
      <Typography
        sx={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748B", mb: 1.5 }}
      >
        Follow us
      </Typography>
      <Grid container spacing={2}>
        {socialLinks.map(({ icon, label, href, color }) => (
          <Grid item xs={12} sm={6} md={2.4} key={label}>
            <Box
              component="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              sx={{
                display: "flex", alignItems: "center", gap: 2,
                height: 64, px: 2, borderRadius: 2, textDecoration: "none",
                bgcolor: "#fff", border: "1px solid #E2E8F0",
                boxShadow: "0 1px 3px rgba(15,27,45,.06)",
                color: "#334155", transition: "all .18s ease",
                "&:hover": { borderColor: color, color, transform: "translateY(-2px)", boxShadow: "0 8px 18px rgba(15,27,45,.12)" },
              }}
            >
              <Box
                sx={{
                  width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: "#F1F5F9", color: "inherit",
                }}
              >
                {React.cloneElement(icon, { size: 20 })}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>{label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ImportantUpdates;
