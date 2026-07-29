import React from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Link,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";

const products = [
  {
    icon: "📊",
    iconBg: "#EEF4FF",
    title: "Credit Bureau API",
    description:
      "Consumer and commercial credit reports from all major Indian bureaus, delivered through one normalised schema.",
    features: [
      "Soft & hard pull support",
      "Built-in consent capture",
      "Score bands & summary attributes",
    ],
  },
  {
    icon: "🪪",
    iconBg: "#EAFBF6",
    title: "Identity & KYC Suite",
    description:
      "Real-time verification of PAN, Aadhaar (offline), GSTIN, driving licence, voter ID, bank accounts and UPI handles.",
    features: [
      "Face match & liveness detection",
      "Video KYC workflows",
      "CKYC search & download",
    ],
  },
  {
    icon: "🏦",
    iconBg: "#EEF4FF",
    title: "Bank Statement Analyzer",
    description:
      "Convert PDFs and account aggregator feeds into categorised transactions and lender-ready cashflow insights.",
    features: [
      "700+ bank formats supported",
      "Fraud & tampering detection",
      "FOIR, ABB & obligation analysis",
    ],
  },
  {
    icon: "🤖",
    iconBg: "#FFF8EA",
    badge: "NEW",
    title: "AI Decisioning Engine",
    description:
      "Combine bureau, banking and alternate data into configurable scorecards that return instant credit decisions.",
    features: [
      "No-code rule builder",
      "ML models with explainability",
      "Champion–challenger testing",
    ],
  },
  {
    icon: "📄",
    iconBg: "#EAFBF6",
    title: "Document Intelligence",
    description:
      "AI-powered OCR and forgery detection for salary slips, ITRs, Form 16, invoices and financial statements.",
    features: [
      "Structured field extraction",
      "Tamper & template checks",
      "Confidence scoring per field",
    ],
  },
  {
    icon: "📡",
    iconBg: "#FFF8EA",
    title: "Portfolio Monitoring",
    description:
      "Track borrower health after disbursal with bureau refresh triggers, employment signals and early-warning alerts.",
    features: [
      "Scheduled bureau refreshes",
      "EPFO & employment tracking",
      "Risk-event webhooks",
    ],
  },
];

const ProductSection = () => {
  return (
    <Box sx={{ py: 10, bgcolor: "#F8FAFC" }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 4,
          }}
        >
          {products.map((item, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid #E2E8F0",
                borderRadius: "24px",
                p: 2,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 15px 35px rgba(0,0,0,.08)",
                },
              }}
            >
              <CardContent>
                {/* Icon + Badge */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={4}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: item.iconBg,
                      borderRadius: 3,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 36,
                    }}
                  >
                    {item.icon}
                  </Box>

                  {item.badge && (
                    <Box
                      sx={{
                        bgcolor: "#E8FAF3",
                        color: "#059669",
                        px: 2,
                        py: 0.8,
                        borderRadius: "30px",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </Box>

                {/* Title */}
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 30,
                    color: "#0F172A",
                    mb: 2,
                  }}
                >
                  {item.title}
                </Typography>

                {/* Description */}
                <Typography
                  sx={{
                    color: "#475569",
                    fontSize: 18,
                    lineHeight: 1.8,
                    mb: 4,
                    minHeight: 120,
                  }}
                >
                  {item.description}
                </Typography>

                {/* Features */}
                {item.features.map((feature, i) => (
                  <Box key={i} display="flex" alignItems="center" mb={2}>
                    <CheckIcon
                      sx={{
                        color: "#10B981",
                        mr: 1.5,
                        fontSize: 22,
                      }}
                    />

                    <Typography sx={{ fontSize: 17, color: "#334155" }}>
                      {feature}
                    </Typography>
                  </Box>
                ))}

                {/* Explore Link */}
                <Link
                  href="#"
                  underline="none"
                  sx={{
                    mt: 4,
                    display: "inline-flex",
                    alignItems: "center",
                    color: "#2563EB",
                    fontWeight: 700,
                    fontSize: 18,
                    "&:hover": {
                      color: "#1D4ED8",
                    },
                  }}
                >
                  Explore API
                  <ArrowForwardIcon sx={{ ml: 1 }} />
                </Link>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default ProductSection;
