import React, { useState } from "react";
import axios from "axios";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Checkbox,
} from "@mui/material";
import { creditAPI } from "../../services/authService";

const steps = ["Customer Details", "CRIF Verification", "Report"];

const CrifReport = () => {
  const [activeStep, setActiveStep] = useState(0);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    panNumber: "",
    fullName: "",
    mobileNumber: "",
    email: "",
    dob: "",
    pincode: "",
    stateName: "",
    cityName: "",
    addressLine1: "",
    addressLine2: "",
    customerConsent: "Y",
  });

  const [questionData, setQuestionData] = useState({
    question: "",
    options: [],
    reportId: "",
    orderId: "",
  });

  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [reportData, setReportData] = useState(null);
  const [crifResponse, setCrifResponse] = useState(null);

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // INITIAL CRIF REQUEST
  // ============================================================

  const handleGetCrifReport = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await creditAPI.generateCrifReport(formData);

      const data = response.data;

      console.log("[CRIF FRONTEND] Response:", data);

      // ========================================================
      // CASE 1: QUESTION
      // ========================================================

      if (data.status === "question") {
        console.log("========== CRIF QUESTION ==========");
        console.log("Full response:", data);
        console.log("Question:", data.question);
        console.log("Options:", data.options);
        console.log("Report ID:", data.reportId);
        console.log("Order ID:", data.orderId);
        setQuestionData({
          question: data.question,
          options: data.options || [],
          reportId: data.reportId,
          orderId: data.orderId,
        });

        setSelectedAnswer("");

        // Save CRIF response
        setCrifResponse(data);

        // Move to question step
        setActiveStep(1);

        return;
      }

      // ========================================================
      // CASE 2: SUCCESS
      // ========================================================

      if (data.success === true) {
        setReportData(data);

        // Save successful response
        setCrifResponse(data);

        setSuccessMessage("CRIF report fetched successfully.");

        // DON'T automatically move to next step
        // Next button will be enabled now

        return;
      }

      throw new Error(data.message || "Unable to fetch CRIF report");
    } catch (error) {
      console.error("[CRIF FRONTEND] Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while fetching CRIF report",
      );

      // Failed response par Next disabled rahega
      setCrifResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SUBMIT QUESTION ANSWER
  // ============================================================

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) {
      setError("Please select an answer.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const payload = {
        userAns: selectedAnswer,
        reportId: questionData.reportId,
        orderId: questionData.orderId,
      };

      console.log("[CRIF FRONTEND] Answer Payload:", {
        ...payload,
        userAns: "***",
      });

      const response = await axios.post(
        "/api/credit-report/crif/report",
        payload,
      );

      const data = response.data;

      console.log("[CRIF FRONTEND] Answer Response:", data);

      // ========================================================
      // CASE 1: ANOTHER QUESTION
      // ========================================================

      if (data.status === "question") {
        setQuestionData({
          question: data.question,
          options: data.options || [],
          reportId: data.reportId,
          orderId: data.orderId,
        });

        setSelectedAnswer("");

        return;
      }

      // ========================================================
      // CASE 2: FINAL SUCCESS
      // ========================================================

      if (data.success && data.status === "success") {
        setReportData(data);

        setActiveStep(2);

        setSuccessMessage("CRIF report fetched successfully.");

        return;
      }

      throw new Error(data.message || "Unable to verify answer");
    } catch (error) {
      console.error("[CRIF FRONTEND] Answer Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to submit answer",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setActiveStep(0);

    setError("");
    setSuccessMessage("");

    setQuestionData({
      question: "",
      options: [],
      reportId: "",
      orderId: "",
    });

    setSelectedAnswer("");

    setReportData(null);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1100,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, md: 4 },
      }}
    >
      {/* ================= HEADER ================= */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            fontSize: { xs: "1.35rem", sm: "1.5rem" },
            mb: 0.5,
          }}
        >
          CRIF Credit Report
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Fetch customer CRIF credit score and report
        </Typography>
      </Box>

      {/* ================= STEPPER ================= */}
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: "none",
        }}
      >
        <CardContent
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2.5,
          }}
        >
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              "& .MuiStepLabel-label": {
                fontSize: { xs: "0.72rem", sm: "0.85rem" },
                mt: 1,
              },
              "& .MuiStepIcon-root": {
                fontSize: { xs: 24, sm: 30 },
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* ================= ALERTS ================= */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* =========================================================
        STEP 1 - CUSTOMER DETAILS
    ========================================================= */}
      {activeStep === 0 && (
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Customer Details
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Enter the customer's details to fetch the CRIF credit report.
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleGetCrifReport}>
              <Grid container spacing={{ xs: 2, md: 2.5 }}>
                {/* PAN */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="PAN Number"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>

                {/* NAME */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </Grid>

                {/* MOBILE */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Mobile Number"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>

                {/* EMAIL */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="email"
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>

                {/* DOB */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="date"
                    label="Date of Birth"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* PINCODE */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </Grid>

                {/* STATE */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="State"
                    name="stateName"
                    value={formData.stateName}
                    onChange={handleChange}
                  />
                </Grid>

                {/* CITY */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="City"
                    name="cityName"
                    value={formData.cityName}
                    onChange={handleChange}
                  />
                </Grid>

                {/* ADDRESS 1 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Address Line 1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                  />
                </Grid>

                {/* ADDRESS 2 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Address Line 2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                  />
                </Grid>

                {/* CONSENT */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }} />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      backgroundColor: "background.default",
                    }}
                  >
                    <FormControlLabel
                      sx={{
                        m: 0,
                        width: "100%",
                        alignItems: "flex-start",
                      }}
                      control={
                        <Checkbox
                          checked={formData.customerConsent === "Y"}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              customerConsent: e.target.checked ? "Y" : "N",
                            }));
                          }}
                          sx={{ mt: -0.5 }}
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          sx={{
                            lineHeight: 1.6,
                            pt: 0.3,
                          }}
                        >
                          I confirm that the customer has provided consent to
                          fetch their CRIF credit report.
                        </Typography>
                      }
                    />
                  </Box>
                </Grid>

                {/* BUTTONS */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1.5,
                      pt: 1,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{
                        minWidth: { xs: "100%", sm: 180 },
                        height: 44,
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={23} color="inherit" />
                      ) : (
                        "Get CRIF Report"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      size="large"
                      disabled={!crifResponse || loading}
                      onClick={() => setActiveStep(1)}
                      sx={{
                        minWidth: { xs: "100%", sm: 110 },
                        height: 44,
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* =========================================================
        STEP 2 - VERIFICATION
    ========================================================= */}
      {activeStep === 1 && (
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Identity Verification
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                CRIF requires an additional verification answer before providing
                the credit report.
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: "text.primary",
                  fontSize: { xs: 15, sm: 16 },
                  fontWeight: 600,
                  lineHeight: 1.5,
                  mb: 2,
                }}
              >
                {questionData.question}
              </FormLabel>

              <RadioGroup
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                sx={{ gap: 1.2 }}
              >
                {questionData.options.map((option, index) => {
                  const cleanOption = String(option).trim();

                  return (
                    <FormControlLabel
                      key={index}
                      value={cleanOption}
                      control={<Radio />}
                      label={
                        <Typography
                          variant="body2"
                          sx={{
                            lineHeight: 1.5,
                            wordBreak: "break-word",
                          }}
                        >
                          {cleanOption}
                        </Typography>
                      }
                      sx={{
                        width: "100%",
                        m: 0,
                        px: 1.5,
                        py: 1.2,
                        border: "1px solid",
                        borderColor:
                          selectedAnswer === cleanOption
                            ? "primary.main"
                            : "divider",
                        borderRadius: 2,
                        alignItems: "center",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "action.hover",
                          borderColor: "primary.main",
                        },
                        "& .MuiRadio-root": {
                          mr: 0.5,
                        },
                      }}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1.5,
                mt: 4,
                flexDirection: { xs: "column-reverse", sm: "row" },
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                disabled={loading}
                sx={{
                  minWidth: { xs: "100%", sm: 100 },
                  height: 44,
                }}
              >
                Back
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmitAnswer}
                disabled={loading || !selectedAnswer}
                sx={{
                  minWidth: { xs: "100%", sm: 160 },
                  height: 44,
                }}
              >
                {loading ? (
                  <CircularProgress size={23} color="inherit" />
                ) : (
                  "Submit Answer"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* =========================================================
        STEP 3 - REPORT
    ========================================================= */}
      {activeStep === 2 && reportData && (
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* REPORT HEADER */}
            <Box
              sx={{
                textAlign: "center",
                mb: 4,
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                CRIF Credit Report
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Report fetched successfully
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              {/* SCORE */}
              <Grid item xs={12} md={4}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                  }}
                >
                  <CardContent
                    sx={{
                      minHeight: 190,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      CRIF Score
                    </Typography>

                    <Typography
                      variant="h2"
                      fontWeight={700}
                      sx={{
                        mt: 1,
                        fontSize: { xs: "3rem", sm: "3.5rem" },
                      }}
                    >
                      {reportData.score ?? "-"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* REPORT INFORMATION */}
              <Grid item xs={12} md={8}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography fontWeight={600} variant="subtitle1">
                      Report Information
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Report ID
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ wordBreak: "break-word" }}
                        >
                          {reportData.reportId || "-"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>

                        <Typography variant="body2" fontWeight={600}>
                          {reportData.status || "Success"}
                        </Typography>
                      </Box>

                      {reportData.file && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            File
                          </Typography>

                          <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{ wordBreak: "break-word" }}
                          >
                            {reportData.file}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* NEW REPORT */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 4,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  minWidth: { xs: "100%", sm: 160 },
                  height: 44,
                }}
              >
                New CRIF Report
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CrifReport;
