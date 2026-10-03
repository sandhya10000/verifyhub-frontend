import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, DialogContent, DialogActions, Button, Box, Typography, TextField, 
  LinearProgress, IconButton, useMediaQuery, useTheme, Checkbox, FormControlLabel,
  Snackbar, Alert, CircularProgress, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { X, Lock, UploadCloud, Info, CheckCircle2 } from 'lucide-react';
import { tokens } from './tokens';
import { customReportService } from './customReportService';
import { config } from './config';

const STORAGE_KEY = 'customReportForm';

const INITIAL_FORM = {
  companyName: '',
  logo: null,
  brandColors: { primary: '#2563eb', secondary: '#1e293b', autoChoose: false },
  tagline: '',
  signatoryName: '',
  signatoryDesignation: '',
  contact: { email: '', phone: '', website: '', address: '' },
  socialLinks: { linkedin: '', instagram: '', facebook: '', x: '', youtube: '' },
  preferences: {
    sections: { executive: true, risk: true, account: true, plan: true },
    language: 'en',
    disclaimer: 'This report is generated based on data provided by credit bureaus. It is for informational purposes only.',
    previousAnalysisId: '',
    additionalNotes: '',
    referenceFile: null
  }
};

const CustomReportModal = ({ open, onClose, initialData }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pastAnalyses, setPastAnalyses] = useState([]);

  const logoInputRef = useRef(null);
  const refFileInputRef = useRef(null);

  // Load drafts or initial data
  useEffect(() => {
    if (open) {
      setStep(1);
      setSuccessResult(null);
      setConfirmed(false);
      setErrors({});

      customReportService.listPastAnalyses().then(setPastAnalyses).catch(console.error);

      if (initialData) {
        setFormData(initialData);
      } else {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            setFormData(JSON.parse(saved));
          } catch (e) {}
        } else {
          setFormData(INITIAL_FORM);
        }
      }
    }
  }, [open, initialData]);

  // Autosave
  useEffect(() => {
    if (open && !successResult && !initialData) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, open, successResult, initialData]);

  const showToast = (message, severity = 'error') => {
    setToast({ open: true, message, severity });
  };

  const handleClose = () => {
    if (!successResult && JSON.stringify(formData) !== JSON.stringify(INITIAL_FORM) && !initialData) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        return;
      }
    }
    onClose(!!successResult);
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.companyName || formData.companyName.length < 2 || formData.companyName.length > 80) {
        newErrors.companyName = "Company name must be between 2 and 80 characters.";
      }
      if (!formData.logo) {
        newErrors.logo = "Logo is required.";
      }
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      if (!formData.brandColors.autoChoose) {
        if (!hexRegex.test(formData.brandColors.primary)) newErrors.primaryColor = "Invalid hex color (e.g. #2563EB).";
        if (!hexRegex.test(formData.brandColors.secondary)) newErrors.secondaryColor = "Invalid hex color.";
      }
      if (formData.tagline && formData.tagline.length > 100) newErrors.tagline = "Tagline max 100 characters.";
    } else if (currentStep === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.contact.email || !emailRegex.test(formData.contact.email)) {
        newErrors.email = "Enter a valid email address.";
      }
      if (formData.contact.address && formData.contact.address.length > 200) {
        newErrors.address = "Address max 200 characters.";
      }
      ['linkedin', 'instagram', 'facebook', 'x', 'youtube'].forEach(platform => {
        const url = formData.socialLinks[platform];
        if (url && (!url.startsWith('https://') || !url.includes('.'))) {
          newErrors[platform] = `Enter a valid ${platform} URL starting with https://`;
        }
      });
    } else if (currentStep === 3) {
      if (formData.preferences.disclaimer && formData.preferences.disclaimer.length > 500) {
        newErrors.disclaimer = "Disclaimer max 500 characters.";
      }
      if (formData.preferences.additionalNotes && formData.preferences.additionalNotes.length > 1000) {
        newErrors.additionalNotes = "Notes max 1000 characters.";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
      setErrors({});
    } else {
      showToast("Please fix the errors before continuing.");
    }
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!confirmed) return;
    setIsSubmitting(true);
    try {
      const result = await customReportService.createRequest(formData);
      sessionStorage.removeItem(STORAGE_KEY);
      setSuccessResult(result);
      showToast(`Request ${result.id} submitted successfully!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      showToast("Logo must be PNG, JPG, or SVG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Logo must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, logo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRefFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Reference file must be under 5MB.");
      return;
    }
    setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, referenceFile: file.name } }));
  };

  // --- Render Steps ---
  const renderStep1 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
      <TextField
        label="Company Name *"
        value={formData.companyName}
        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
        error={!!errors.companyName}
        helperText={errors.companyName}
        fullWidth
        inputProps={{ 'aria-invalid': !!errors.companyName }}
      />
      
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Company Logo *</Typography>
        <Box 
          onClick={() => logoInputRef.current?.click()}
          sx={{
            border: `1.5px dashed ${errors.logo ? tokens.colors.status.danger.text : tokens.colors.borderHover}`,
            borderRadius: 2, p: 3, textAlign: 'center', bgcolor: tokens.colors.background, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1
          }}
        >
          {formData.logo ? (
            // Only render via img tag, never inline SVG
            <img src={formData.logo} alt="Logo preview" style={{ maxHeight: 60, maxWidth: '100%' }} />
          ) : (
            <UploadCloud size={24} color={tokens.colors.primary} />
          )}
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            {formData.logo ? "Click to replace logo" : "Upload logo (PNG, JPG, SVG, max 2MB)"}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.muted }}>
            A transparent PNG or SVG gives the best result.
          </Typography>
        </Box>
        {errors.logo && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{errors.logo}</Typography>}
        <input type="file" hidden ref={logoInputRef} accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} />
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Brand Colours</Typography>
        <FormControlLabel 
          control={<Checkbox checked={formData.brandColors.autoChoose} onChange={e => setFormData({ ...formData, brandColors: { ...formData.brandColors, autoChoose: e.target.checked } })} />} 
          label={<Typography variant="body2">Not sure, choose for me (based on logo)</Typography>} 
        />
        {!formData.brandColors.autoChoose && (
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              label="Primary Hex"
              value={formData.brandColors.primary}
              onChange={(e) => setFormData({ ...formData, brandColors: { ...formData.brandColors, primary: e.target.value } })}
              error={!!errors.primaryColor}
              helperText={errors.primaryColor}
              size="small"
              InputProps={{
                startAdornment: <Box sx={{ width: 16, height: 16, bgcolor: formData.brandColors.primary, borderRadius: '4px', mr: 1, border: '1px solid #ccc' }} />
              }}
            />
            <TextField
              label="Secondary Hex"
              value={formData.brandColors.secondary}
              onChange={(e) => setFormData({ ...formData, brandColors: { ...formData.brandColors, secondary: e.target.value } })}
              error={!!errors.secondaryColor}
              helperText={errors.secondaryColor}
              size="small"
              InputProps={{
                startAdornment: <Box sx={{ width: 16, height: 16, bgcolor: formData.brandColors.secondary, borderRadius: '4px', mr: 1, border: '1px solid #ccc' }} />
              }}
            />
          </Box>
        )}
      </Box>

      <TextField label="Tagline (optional)" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} error={!!errors.tagline} helperText={errors.tagline} fullWidth />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Signatory Name" value={formData.signatoryName} onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })} fullWidth />
        <TextField label="Designation" value={formData.signatoryDesignation} onChange={(e) => setFormData({ ...formData, signatoryDesignation: e.target.value })} fullWidth />
      </Box>
    </Box>
  );

  const renderStep2 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
      <Box sx={{ p: 2, bgcolor: tokens.colors.status.info.bg, borderRadius: 2, display: 'flex', gap: 1 }}>
        <Info size={18} color={tokens.colors.status.info.text} style={{ flexShrink: 0, marginTop: 2 }} />
        <Typography variant="body2" sx={{ color: tokens.colors.status.info.text }}>These appear in the header and footer of your report.</Typography>
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Contact Details</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Contact Email *" value={formData.contact.email} onChange={e => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })} error={!!errors.email} helperText={errors.email} fullWidth />
        <TextField label="Phone / WhatsApp" value={formData.contact.phone} onChange={e => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })} fullWidth />
      </Box>
      <TextField label="Website" value={formData.contact.website} onChange={e => setFormData({ ...formData, contact: { ...formData.contact, website: e.target.value } })} fullWidth />
      <TextField label="Address" multiline rows={3} value={formData.contact.address} onChange={e => setFormData({ ...formData, contact: { ...formData.contact, address: e.target.value } })} error={!!errors.address} helperText={errors.address} fullWidth />

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>Social Links (Optional)</Typography>
      {['linkedin', 'instagram', 'facebook', 'x', 'youtube'].map(platform => (
        <TextField
          key={platform}
          label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
          placeholder="https://"
          value={formData.socialLinks[platform]}
          onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, [platform]: e.target.value } })}
          error={!!errors[platform]}
          helperText={errors[platform]}
          fullWidth
          size="small"
        />
      ))}
    </Box>
  );

  const renderStep3 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
      <Box sx={{ p: 2, bgcolor: tokens.colors.notice.bg, border: `1px solid ${tokens.colors.notice.border}`, borderRadius: 2, display: 'flex', gap: 1 }}>
        <Info size={18} color={tokens.colors.notice.icon} style={{ flexShrink: 0, marginTop: 2 }} />
        <Typography variant="body2" sx={{ color: tokens.colors.notice.text }}>
          After you receive the draft you can request up to {config.MAX_REVISIONS} rounds of changes. Each revision takes about 2–3 working days.
        </Typography>
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Report Configuration</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {Object.entries(formData.preferences.sections).map(([key, val]) => (
          <FormControlLabel
            key={key}
            control={<Checkbox checked={val} onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences, sections: { ...formData.preferences.sections, [key]: e.target.checked } } })} />}
            label={<Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{key} Section</Typography>}
          />
        ))}
      </Box>

      <FormControl fullWidth>
        <InputLabel>Output Language</InputLabel>
        <Select
          value={formData.preferences.language}
          label="Output Language"
          onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences, language: e.target.value } })}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="hi">Hindi</MenuItem>
          <MenuItem value="mr">Marathi</MenuItem>
          <MenuItem value="bn">Bengali</MenuItem>
          <MenuItem value="ta">Tamil</MenuItem>
          <MenuItem value="te">Telugu</MenuItem>
          <MenuItem value="kn">Kannada</MenuItem>
          <MenuItem value="gu">Gujarati</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Footer Disclaimer"
        multiline rows={3}
        value={formData.preferences.disclaimer}
        onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences, disclaimer: e.target.value } })}
        error={!!errors.disclaimer}
        helperText={errors.disclaimer}
        fullWidth
      />

      <TextField
        label="Anything else?"
        multiline rows={3}
        value={formData.preferences.additionalNotes}
        onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences, additionalNotes: e.target.value } })}
        error={!!errors.additionalNotes}
        helperText={errors.additionalNotes}
        fullWidth
      />

      <Box>
        <Button variant="outlined" onClick={() => refFileInputRef.current?.click()} sx={{ textTransform: 'none', borderRadius: 2 }}>
          {formData.preferences.referenceFile ? 'Replace Reference File' : 'Upload Reference File (Optional)'}
        </Button>
        {formData.preferences.referenceFile && <Typography variant="caption" sx={{ ml: 2 }}>{formData.preferences.referenceFile}</Typography>}
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: tokens.colors.text.muted }}>Share a sample report style you like (PDF/PNG/JPG, max 5MB).</Typography>
        <input type="file" hidden ref={refFileInputRef} accept=".pdf, image/*" onChange={handleRefFileUpload} />
      </Box>
    </Box>
  );

  const renderReview = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
      <Box sx={{ p: 2, bgcolor: tokens.colors.notice.bg, border: `1px solid ${tokens.colors.notice.border}`, borderRadius: 2, display: 'flex', gap: 1 }}>
        <Lock size={18} color={tokens.colors.notice.icon} style={{ flexShrink: 0, marginTop: 2 }} />
        <Typography variant="body2" sx={{ color: tokens.colors.notice.text, fontWeight: 600 }}>
          Please double-check your details. Changes after submission are handled as revisions.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Tile 1 */}
        <Box sx={{ border: `1px solid ${tokens.colors.border}`, borderRadius: `${tokens.radii.tile}px`, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Brand & Logo</Typography>
            <Button size="small" onClick={() => setStep(1)} sx={{ textTransform: 'none' }}>Edit</Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src={formData.logo} alt="Logo" style={{ maxHeight: 40 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.companyName}</Typography>
              {!formData.brandColors.autoChoose && (
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: formData.brandColors.primary, borderRadius: 1 }} />
                  <Box sx={{ width: 16, height: 16, bgcolor: formData.brandColors.secondary, borderRadius: 1 }} />
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Tile 2 */}
        <Box sx={{ border: `1px solid ${tokens.colors.border}`, borderRadius: `${tokens.radii.tile}px`, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Contact Info</Typography>
            <Button size="small" onClick={() => setStep(2)} sx={{ textTransform: 'none' }}>Edit</Button>
          </Box>
          <Typography variant="body2">{formData.contact.email} {formData.contact.phone && `• ${formData.contact.phone}`}</Typography>
        </Box>
      </Box>

      <FormControlLabel
        control={<Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />}
        label={<Typography variant="body2" sx={{ fontWeight: 600 }}>I confirm these details are correct.</Typography>}
      />
    </Box>
  );

  const renderSuccess = () => (
    <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <CheckCircle2 size={64} color={tokens.colors.status.success.text} />
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 2 }}>Request Submitted</Typography>
      <Typography variant="body1" sx={{ color: tokens.colors.text.secondary, maxWidth: 400 }}>
        Request <strong>{successResult.id}</strong> received. We'll email you a draft by <strong>{new Date(successResult.expectedBy).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>. You can track progress in My Custom Requests.
      </Typography>
    </Box>
  );

  const stepTitles = ["Your brand", "Contact and social links", "Report preferences", "Review & Submit"];

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullScreen={fullScreen} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={isSubmitting}
        aria-labelledby="custom-report-dialog-title"
      >
        {!successResult && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tokens.colors.border}` }}>
            <Box>
              <Typography variant="caption" sx={{ color: tokens.colors.text.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step {step} of 4
              </Typography>
              <Typography id="custom-report-dialog-title" variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {stepTitles[step - 1]}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} disabled={isSubmitting} aria-label="Close">
              <X size={20} />
            </IconButton>
          </Box>
        )}
        
        {!successResult && (
          <LinearProgress variant="determinate" value={(step / 4) * 100} sx={{ height: 3, bgcolor: tokens.colors.border, '& .MuiLinearProgress-bar': { bgcolor: tokens.colors.primary } }} />
        )}

        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {successResult ? renderSuccess() : (
            step === 1 ? renderStep1() :
            step === 2 ? renderStep2() :
            step === 3 ? renderStep3() :
            renderReview()
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: successResult ? 'none' : `1px solid ${tokens.colors.border}`, justifyContent: successResult ? 'center' : 'flex-end', gap: 1 }}>
          {successResult ? (
            <Button variant="contained" onClick={handleClose} sx={{ bgcolor: tokens.colors.primary, color: '#fff', borderRadius: '9999px', px: 4, textTransform: 'none', fontWeight: 600 }}>
              Close
            </Button>
          ) : (
            <>
              {step > 1 && <Button onClick={handleBack} disabled={isSubmitting} sx={{ color: tokens.colors.text.secondary, textTransform: 'none', fontWeight: 600 }}>Back</Button>}
              {step < 4 ? (
                <Button onClick={handleNext} variant="contained" sx={{ bgcolor: tokens.colors.primary, color: '#fff', borderRadius: '9999px', px: 4, textTransform: 'none', fontWeight: 600 }}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  variant="contained" 
                  disabled={!confirmed || isSubmitting}
                  startIcon={isSubmitting && <CircularProgress size={16} color="inherit" />}
                  sx={{ bgcolor: tokens.colors.primary, color: '#fff', borderRadius: '9999px', px: 4, textTransform: 'none', fontWeight: 600 }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ width: '100%', borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CustomReportModal;
