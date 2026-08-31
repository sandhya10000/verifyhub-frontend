import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  UploadCloud,
  Lock,
  Sparkles,
  ArrowDownToLine,
  Save,
  BarChart2
} from 'lucide-react';

const StatCard = ({ label, value }) => (
  <Box
    sx={{
      p: 2,
      bgcolor: '#F8FAFC',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}
  >
    <Typography variant="overline" sx={{ display: 'block', mb: 0.5, lineHeight: 1.2 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
      {value}
    </Typography>
  </Box>
);

const AiAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [error, setError] = useState(null);
  // Download-specific states — separate from the main upload error so
  // a download failure doesn't reset the on-screen result cards.
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [chunkProgress, setChunkProgress] = useState(null);
  const fileInputRef = useRef(null);


  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('[AiAnalyzer] File selected:', file.name, file.type, file.size, 'bytes');
      // Reset all stale state so a retry always starts clean
      setSelectedFile(file);
      setError(null);
      setAnalysisResult(null);
      setAnalysisId(null);
      setChunkProgress(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      console.log('[AiAnalyzer] File dropped:', file.name, file.type, file.size, 'bytes');
      setSelectedFile(file);
      setError(null);
      setAnalysisResult(null);
      setAnalysisId(null);
      setChunkProgress(null);
    }
  };

  const handleUpload = async () => {
    console.log('[AiAnalyzer] Generate button clicked — selectedFile:', selectedFile, '| isUploading:', isUploading, '| isAnalyzing:', isAnalyzing);

    if (!selectedFile) {
      console.warn('[AiAnalyzer] Blocked: no file selected');
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setAnalysisResult(null);
    setAnalysisId(null);
    setChunkProgress(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const token = localStorage.getItem('token');
    console.log('[AiAnalyzer] Token from localStorage:', token ? `${token.slice(0, 20)}...` : 'MISSING');
    console.log('[AiAnalyzer] Sending POST /api/ai-analyzer/upload with file:', selectedFile.name);

    try {
      const response = await axios.post('http://localhost:5000/api/ai-analyzer/upload', formData, {
        headers: {
          // Do NOT set Content-Type here — axios sets it automatically with the
          // correct multipart/form-data; boundary=... when body is FormData.
          Authorization: `Bearer ${token}`
        }
      });

      console.log('[AiAnalyzer] Upload response:', response.status, response.data);

      if (response.data.success) {
        setAnalysisId(response.data.analysisId);
        setIsUploading(false);
        setIsAnalyzing(true);
        console.log('[AiAnalyzer] Upload accepted, analysisId:', response.data.analysisId, '— beginning polling');
      }
    } catch (err) {
      console.error('[AiAnalyzer] Upload FAILED:', err.response?.status, err.response?.data || err.message);
      setError(err.response?.data?.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  useEffect(() => {
    let intervalId;

    if (isAnalyzing && analysisId) {
      console.log('[AiAnalyzer] Starting poll for analysisId:', analysisId);
      intervalId = setInterval(async () => {
        console.log('[AiAnalyzer] Polling GET /api/ai-analyzer/', analysisId);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:5000/api/ai-analyzer/${analysisId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          console.log('[AiAnalyzer] Poll response:', response.data.status, response.data);

          if (response.data.success) {
            const { status, result, errorMessage, debugError, isChunked, chunkCount, chunksCompleted } = response.data;

            if (isChunked && chunkCount > 0) {
              setChunkProgress({ completed: chunksCompleted || 0, total: chunkCount });
            }

            if (status === 'completed') {
              console.log('[AiAnalyzer] Analysis COMPLETED:', result);
              setAnalysisResult(result);
              setIsAnalyzing(false);
              clearInterval(intervalId);
            } else if (status === 'failed') {
              console.error('[AiAnalyzer] Analysis FAILED — backend errorMessage:', errorMessage, 'debugError:', debugError);
              setError(debugError || errorMessage || 'Analysis failed');
              setIsAnalyzing(false);
              setChunkProgress(null);
              clearInterval(intervalId);
            } else {
              console.log('[AiAnalyzer] Still processing, status:', status);
            }
          }
        } catch (err) {
          console.error('[AiAnalyzer] Polling request error:', err.response?.status, err.message);
          setError('Failed to fetch analysis status');
          setIsAnalyzing(false);
          clearInterval(intervalId);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) {
        console.log('[AiAnalyzer] Clearing poll interval');
        clearInterval(intervalId);
      }
    };
  }, [isAnalyzing, analysisId]);

  useEffect(() => {
    let intervalId;

    if (isGeneratingHtml && analysisId) {
      console.log('[AiAnalyzer] Starting HTML generation poll for analysisId:', analysisId);
      let attempts = 0;
      const MAX_ATTEMPTS = 100;

      intervalId = setInterval(async () => {
        attempts++;
        console.log(`[AiAnalyzer] Polling HTML status (${attempts}/${MAX_ATTEMPTS})`);

        if (attempts > MAX_ATTEMPTS) {
          console.error('[AiAnalyzer] Max polling attempts reached for HTML generation');
          setDownloadError('Report generation took too long. Please try again.');
          setIsGeneratingHtml(false);
          setIsDownloading(false);
          clearInterval(intervalId);
          return;
        }

        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:5000/api/ai-analyzer/${analysisId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            const { htmlStatus } = response.data;

            if (htmlStatus === 'completed') {
              console.log('[AiAnalyzer] HTML generation COMPLETED, fetching file...');
              clearInterval(intervalId);

              try {
                const pdfResponse = await axios.get(
                  `http://localhost:5000/api/ai-analyzer/${analysisId}/download-pdf`,
                  { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
                );

                const url = window.URL.createObjectURL(new Blob([pdfResponse.data], { type: 'text/html' }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `credit-analysis-${analysisId}.html`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                setIsGeneratingHtml(false);
                setIsDownloading(false);
              } catch (downloadErr) {
                console.error('[AiAnalyzer] Failed to download completed HTML:', downloadErr);
                setDownloadError('Failed to download the generated report.');
                setIsGeneratingHtml(false);
                setIsDownloading(false);
              }
            } else if (htmlStatus === 'failed') {
              console.error('[AiAnalyzer] HTML generation FAILED on backend');
              setDownloadError('Failed to generate the full HTML report. Please try again.');
              setIsGeneratingHtml(false);
              setIsDownloading(false);
              clearInterval(intervalId);
            } else {
              console.log('[AiAnalyzer] HTML still generating, status:', htmlStatus);
            }
          }
        } catch (err) {
          console.error('[AiAnalyzer] HTML polling request error:', err.message);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isGeneratingHtml, analysisId]);

  const handleDownloadPdf = async () => {
    if (!analysisId) return;
    setIsDownloading(true);
    setIsGeneratingHtml(true);
    setDownloadError(null);

    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(
        `http://localhost:5000/api/ai-analyzer/${analysisId}/download-pdf`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 60000 } // Omit blob to allow 202 JSON parsing cleanly; 60s safety timeout
      );

      // If it returned 200, the HTML is ready (cached path A)
      if (response.status === 200) {
        console.log('[AiAnalyzer] Download endpoint returned HTML directly');
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `credit-analysis-${analysisId}.html`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        setIsDownloading(false);
        setIsGeneratingHtml(false);
      } else if (response.status === 202) {
        console.log('[AiAnalyzer] Backend returned 202 Accepted, starting polling...');
        // The useEffect will pick up isGeneratingHtml = true and start polling
      }
    } catch (err) {
      const status = err.response?.status;
      
      if (status === 429) {
        setDownloadError('Report generation failed recently. Please wait a moment before trying again.');
      } else {
        setDownloadError('Failed to initiate report generation.');
      }
      setIsDownloading(false);
      setIsGeneratingHtml(false);
    }
  };


  const languages = [
    { native: 'हिन्दी', english: 'Hindi' },
    { native: 'தமிழ்', english: 'Tamil' },
    { native: 'తెలుగు', english: 'Telugu' },
    { native: 'ಕನ್ನಡ', english: 'Kannada' },
    { native: 'मराठी', english: 'Marathi' },
    { native: 'বাংলা', english: 'Bengali' },
    { native: 'ગુજરાતી', english: 'Gujarati' },
    { native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
    { native: 'മലയാളം', english: 'Malayalam' },
    { native: 'ଓଡ଼ିଆ', english: 'Odia' },
    { native: 'অসমীয়া', english: 'Assamese' },
    { native: 'اردو', english: 'Urdu' }
  ];

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Page Header ── */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#EEF2FF',
            width: 48,
            height: 48,
            borderRadius: 3,
            flexShrink: 0
          }}
        >
          <Sparkles color="#3730A3" size={24} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            <Box component="span" sx={{ color: '#3730A3' }}>AI</Box> Credit Report Analyzer
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Turn any bureau report into a plain-language risk summary and lending recommendation.
          </Typography>
        </Box>
      </Box>

      {/* Two-Column Layout */}
      <Grid container spacing={2} sx={{ mb: 4, mt: 1 }}>
        {/* LEFT CARD */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', gap: 2.5 }}>
              {/* Left Card Title */}
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Upload a Credit Report
              </Typography>
              {/* Upload Dropzone */}
              <Box
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                sx={{
                  border: '1px dashed #CBD5E1',
                  borderRadius: 3,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'success.main',
                    bgcolor: 'success.light'
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.json"
                  onChange={handleFileChange}
                />
                <UploadCloud size={32} color="#64748B" style={{ margin: '0 auto 12px' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedFile ? selectedFile.name : '↑ Upload credit report (PDF / JSON)'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', maxWidth: 300, mx: 'auto' }}>
                  CIBIL, Experian, Equifax and CRIF reports supported — including reports pulled outside VerifyHub
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Warning Banner */}
              <Box
                sx={{
                  bgcolor: '#FEF3C7',
                  color: '#92400E',
                  p: 2,
                  borderRadius: 2,
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start'
                }}
              >
                <Lock size={20} style={{ flexShrink: 0, marginTop: 2 }} color="#D97706" />
                <Typography variant="body2">
                  <Box component="span" sx={{ fontWeight: 700 }}>Upload without password.</Box>{' '}
                  Password-protected PDFs cannot be analysed — remove the password from the report before uploading.
                </Typography>
              </Box>

              {/* Action Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleUpload}
                disabled={isUploading || isAnalyzing || !selectedFile || !!analysisResult}
                sx={{
                  mt: 'auto',
                  bgcolor: '#3730A3',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#312E81',
                  },
                  boxShadow: 'none'
                }}
              >
                {isUploading ? 'Uploading...' :
                  isAnalyzing ? (
                    chunkProgress
                      ? `Analyzing chunk ${chunkProgress.completed + 1} of ${chunkProgress.total}...`
                      : 'Analyzing with AI...'
                  ) : '✦ Generate AI Analysis'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT CARD */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              {/* Right Card Title */}
              {analysisResult && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Analysis{analysisResult.customerName ? ` — ${analysisResult.customerName}` : ''}
                  </Typography>
                  {analysisResult.riskLevel && (
                    <Chip
                      label={analysisResult.riskLevel}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor:
                          analysisResult.riskLevel === 'Low Risk' ? '#DCFCE7' :
                            analysisResult.riskLevel === 'Medium Risk' ? '#FEF3C7' : '#FEE2E2',
                        color:
                          analysisResult.riskLevel === 'Low Risk' ? '#15803D' :
                            analysisResult.riskLevel === 'Medium Risk' ? '#92400E' : '#991B1B',
                      }}
                    />
                  )}
                </Box>
              )}
              {/* Credit Score Overview Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                 <Box sx={{ bgcolor: '#EEF2FF', p: 1, borderRadius: 2, display: 'flex' }}>
                   <BarChart2 size={18} color="#3730A3" />
                 </Box>
                 <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                   Credit Score Overview
                 </Typography>
              </Box>

              {/* Score Bar */}
              <Box sx={{ mb: 5, px: 1, mt: 1 }}>
                <Box sx={{ position: 'relative', height: 12, borderRadius: 6, background: 'linear-gradient(to right, #EF4444, #F59E0B, #10B981)', mb: 1 }}>
                  {/* Marker for 780 score (approx 80% width since range is ~300-900) */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '80%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 4,
                      height: 24,
                      bgcolor: '#0F1B2D',
                      borderRadius: 2,
                      boxShadow: '0 0 0 2px white'
                    }}
                  />
                </Box>
                {/* Axis Labels */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>300</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>550</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>650</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>750</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>900</Typography>
                </Box>
              </Box>

              {/* Grid of Stats */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard label="SCORE BAND" value={analysisResult ? `${analysisResult.score} — ${analysisResult.scoreBand}` : "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard label="ACTIVE LOANS" value={analysisResult ? `${analysisResult.activeLoans} active` : "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard label="OVERDUE / DPD" value={analysisResult ? analysisResult.overdueStatus : "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard label="ENQUIRIES (6M)" value={analysisResult ? `${analysisResult.enquiries6m} — ${analysisResult.enquiriesRating || ''}` : "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard label="FOIR" value={analysisResult ? `${analysisResult.foirPercent}% — ${analysisResult.foirRating || ''}` : "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard label="MAX ELIGIBLE" value={analysisResult ? `₹${Number(analysisResult.maxEligibleAmount).toLocaleString('en-IN')}` : "—"} />
                </Grid>
              </Grid>

              {/* Recommendation Banner */}
              {analysisResult && (
                <Box
                  sx={{
                    bgcolor: 'success.light',
                    color: 'success.dark',
                    p: 2.5,
                    borderRadius: 2,
                    mb: 3
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>Recommendation: </Box>
                    {analysisResult.recommendation}
                  </Typography>
                </Box>
              )}
              {/* Download error alert — separate from main upload error */}
              {downloadError && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: 2, mb: 2 }}
                  onClose={() => setDownloadError(null)}
                >
                  {downloadError}
                </Alert>
              )}

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {isAnalyzing ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#EEF2FF', borderRadius: 2, color: '#3730A3', width: '100%' }}>
                    <CircularProgress size={24} sx={{ color: '#3730A3' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Your report is being analyzed... this may take up to a minute.
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={isDownloading || isGeneratingHtml ? null : <ArrowDownToLine size={18} />}
                    onClick={handleDownloadPdf}
                    disabled={!analysisResult || isDownloading || isGeneratingHtml}
                    sx={{
                      borderColor: 'divider',
                      color: isDownloading ? 'text.secondary' : 'text.primary',
                      minWidth: 200,
                      position: 'relative',
                    }}
                  >
                    {isDownloading || isGeneratingHtml ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          component="span"
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            border: '2px solid currentColor',
                            borderTopColor: 'transparent',
                            animation: 'spin 0.8s linear infinite',
                            display: 'inline-block',
                            '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                          }}
                        />
                        {isGeneratingHtml ? 'Generating report…' : 'Downloading...'}
                      </Box>
                    ) : (
                      'Download Analysis Report'
                    )}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<Save size={18} />}
                  disabled
                  title="Save to Reports — coming soon"
                  sx={{ borderColor: 'divider', color: 'text.disabled', cursor: 'not-allowed' }}
                >
                  Save to Reports
                </Button>
              </Stack>
              {isGeneratingHtml && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Generating your report, this can take a minute or two for detailed profiles...
                </Typography>
              )}

            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Promo Banner */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#fff',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 12px rgba(15,27,45,.06)',
        }}
      >
        {/* Top border gradient */}
        <Box
          sx={{
            height: 4,
            width: '100%',
            background: 'linear-gradient(to right, #EF4444, #F59E0B, #10B981)'
          }}
        />

        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Chip
            icon={<Sparkles size={14} color="#3730A3" />}
            label="COMING SOON"
            size="small"
            sx={{
              bgcolor: '#EEF2FF',
              color: '#3730A3',
              fontWeight: 700,
              mb: 2,
              borderRadius: 1.5,
              '& .MuiChip-icon': { ml: 1 }
            }}
          />

          <Typography variant="h5" sx={{ color: 'text.primary', mb: 1, fontWeight: 700 }}>
            Get AI report analysis in your language
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 800 }}>
            Explain the credit report to your customer in the language they think in — the same summary, risk flags and recommendation, translated automatically.
          </Typography>

          {/* Languages Row */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {languages.map((lang) => (
              <Chip
                key={lang.english}
                label={`${lang.native} ${lang.english}`}
                variant="outlined"
                sx={{
                  borderColor: 'divider',
                  color: 'text.primary',
                  bgcolor: 'transparent',
                  borderRadius: 2,
                  px: 0.5,
                  py: 2
                }}
              />
            ))}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default AiAnalyzer;
