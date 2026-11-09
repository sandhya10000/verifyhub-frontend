import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, TextField, Button, Chip, Alert, CircularProgress, Divider, Stack,
} from '@mui/material';
import axios from 'axios';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
const API_BASE = `${API_ROOT}/api`;

const SETUP_CHIP = {
  not_started: { label: 'Not done', color: 'default' },
  in_progress: { label: 'In progress', color: 'warning' },
  done: { label: 'Done', color: 'success' },
};

const HEX = /^#[0-9a-fA-F]{6}$/;

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const formatDate = (v) => (v ? new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

const Field = ({ label, value }) => (
  <Box sx={{ mb: 1.25 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>{value || '—'}</Typography>
  </Box>
);

const emptyForm = {
  firmName: '', tagline: '', primaryColor: '#1A3C5E', secondaryColor: '#2E86AB', accentColor: '#F5A623',
  email: '', website: 'https://', phone: '', whatsapp: '', address: '',
};

const BrandDeskRequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { severity, text }

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/white-label/${id}`, { headers: authHeaders() });
      if (!res.data.success) throw new Error(res.data.message);
      const { request: r, profile: p } = res.data.data;
      setRequest(r);
      setProfile(p);
      setNotes(r.internalNotes || '');
      setForm({
        firmName: p?.firmName || r.brandingDetails?.companyName || r.partnerId?.name || '',
        tagline: p?.tagline || r.brandingDetails?.tagline || '',
        primaryColor: p?.colors?.primary || r.brandingDetails?.brandColors?.[0] || emptyForm.primaryColor,
        secondaryColor: p?.colors?.secondary || r.brandingDetails?.brandColors?.[1] || emptyForm.secondaryColor,
        accentColor: p?.colors?.accent || r.brandingDetails?.brandColors?.[2] || emptyForm.accentColor,
        email: p?.email || r.brandingDetails?.contactEmail || r.email || '',
        website: p?.website || 'https://',
        phone: p?.phone || r.brandingDetails?.contactPhone || r.phone || '',
        whatsapp: p?.whatsapp || '',
        address: p?.address || '',
      });
    } catch (err) {
      setMessage({ severity: 'error', text: err.response?.data?.message || err.message || 'Failed to load request.' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!logoFile) { setLogoPreview(null); return undefined; }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const colorsValid = [form.primaryColor, form.secondaryColor, form.accentColor].every((c) => HEX.test(c));
  const hasLogo = Boolean(logoFile || profile?.logo?.dataUri);

  const saveProfile = async () => {
    if (!colorsValid) return setMessage({ severity: 'error', text: 'Colours must be 6-digit hex codes like #1A3C5E.' });
    if (!hasLogo) return setMessage({ severity: 'error', text: 'Upload a PNG or JPEG logo first.' });
    try {
      setSaving(true);
      setMessage(null);
      const fd = new FormData();
      Object.entries({
        firmName: form.firmName,
        tagline: form.tagline,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        email: form.email,
        website: form.website,
        phone: form.phone,
        whatsapp: form.whatsapp,
        address: form.address,
      }).forEach(([k, v]) => fd.append(k, v ?? ''));
      if (logoFile) fd.append('logo', logoFile);

      const res = await axios.put(`${API_BASE}/white-label/${id}/profile`, fd, { headers: authHeaders() });
      if (!res.data.success) throw new Error(res.data.message);
      setLogoFile(null);
      setMessage({ severity: 'success', text: `Brand profile saved (version ${res.data.data.version}).` });
      await load();
    } catch (err) {
      setMessage({ severity: 'error', text: err.response?.data?.message || err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (setupStatus) => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await axios.put(
        `${API_BASE}/white-label/${id}/status`,
        { ...(setupStatus && { setupStatus }), internalNotes: notes },
        { headers: authHeaders() },
      );
      if (!res.data.success) throw new Error(res.data.message);
      setMessage({
        severity: 'success',
        text: setupStatus === 'done'
          ? 'Marked Done. The partner is now active and has been emailed.'
          : setupStatus ? `Status set to ${SETUP_CHIP[setupStatus].label}.` : 'Notes saved.',
      });
      await load();
    } catch (err) {
      setMessage({ severity: 'error', text: err.response?.data?.message || err.message || 'Failed to update status.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }
  if (!request) {
    return (
      <Box>
        {message && <Alert severity={message.severity}>{message.text}</Alert>}
        <Button component={RouterLink} to="/brand-desk/requests" sx={{ mt: 2 }}>Back to requests</Button>
      </Box>
    );
  }

  const details = request.brandingDetails || {};
  const setup = SETUP_CHIP[request.setupStatus || 'not_started'];
  const previewLogo = logoPreview || profile?.logo?.dataUri;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{request.requestId}</Typography>
        <Chip size="small" label={setup.label} color={setup.color} variant={setup.color === 'default' ? 'outlined' : 'filled'} />
        <Chip size="small" variant="outlined" label={`Payment: ${request.paymentMethod || '—'} · ₹${request.amount ?? '—'}`} />
        <Box sx={{ flexGrow: 1 }} />
        <Button component={RouterLink} to="/brand-desk/requests" variant="text">Back to requests</Button>
      </Stack>

      {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Grid container spacing={2.5}>
        {/* Partner + submitted assets */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 1, boxShadow: 'none', border: '1px solid #E8EEF5' }}>
            <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Partner</Typography>
            <Field label="Name" value={request.partnerId?.name} />
            <Field label="Partner ID" value={request.partnerId?.partner_id} />
            <Field label="Email" value={request.email} />
            <Field label="Phone" value={request.phone} />
            <Field label="Paid on" value={formatDate(request.createdAt)} />
            <Field label="Partner account status" value={request.partnerId?.brandingStatus} />
          </Paper>

          <Paper sx={{ p: 2.5, borderRadius: 1, boxShadow: 'none', border: '1px solid #E8EEF5' }}>
            <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Submitted assets</Typography>
            <Field label="Company name" value={details.companyName} />
            <Field label="Tagline" value={details.tagline} />
            <Field label="Contact email" value={details.contactEmail} />
            <Field label="Contact phone" value={details.contactPhone} />
            <Field label="Logo URL" value={details.logoUrl} />
            <Field label="Brand colours" value={(details.brandColors || []).join(', ')} />
            <Field label="Notes from partner" value={details.notes} />
            <Field label="Submitted at" value={formatDate(details.submittedAt)} />
            <Field label={`Revisions used (${details.revisionsUsed || 0}/2)`} value={(details.revisionNotes || []).join(' | ')} />
          </Paper>
        </Grid>

        {/* Profile editor + status */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 1, boxShadow: 'none', border: '1px solid #E8EEF5' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Typography sx={{ fontWeight: 800 }}>Brand profile</Typography>
              {profile && <Chip size="small" variant="outlined" label={`v${profile.version} active`} />}
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Firm name" value={form.firmName} onChange={setField('firmName')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Tagline" value={form.tagline} onChange={setField('tagline')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth size="small" label="Primary colour" value={form.primaryColor} onChange={setField('primaryColor')}
                  error={!HEX.test(form.primaryColor)} helperText={!HEX.test(form.primaryColor) ? 'e.g. #1A3C5E' : ' '} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth size="small" label="Secondary colour" value={form.secondaryColor} onChange={setField('secondaryColor')}
                  error={!HEX.test(form.secondaryColor)} helperText={!HEX.test(form.secondaryColor) ? 'e.g. #2E86AB' : ' '} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth size="small" label="Accent colour" value={form.accentColor} onChange={setField('accentColor')}
                  error={!HEX.test(form.accentColor)} helperText={!HEX.test(form.accentColor) ? 'e.g. #F5A623' : ' '} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Report email" value={form.email} onChange={setField('email')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Website (https://)" value={form.website} onChange={setField('website')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth size="small" label="Phone" value={form.phone} onChange={setField('phone')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth size="small" label="WhatsApp" value={form.whatsapp} onChange={setField('whatsapp')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth size="small" label="Address" value={form.address} onChange={setField('address')} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ flexWrap: 'wrap' }}>
                  <Button component="label" variant="outlined" size="small">
                    {logoFile ? 'Change logo' : profile?.logo?.dataUri ? 'Replace logo' : 'Upload logo'}
                    <input hidden type="file" accept="image/png,image/jpeg" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                  </Button>
                  <Typography variant="caption" color="text.secondary">PNG or JPEG, max 2 MB</Typography>
                  {previewLogo && (
                    <Box sx={{ p: 1, border: '1px dashed #CBD5E1', borderRadius: 1, bgcolor: '#fff' }}>
                      <img src={previewLogo} alt="Logo preview" style={{ maxHeight: 56, maxWidth: 180, display: 'block' }} />
                    </Box>
                  )}
                  {logoFile && <Typography variant="caption" color="warning.main">New logo — not saved yet</Typography>}
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                {[form.primaryColor, form.secondaryColor, form.accentColor].map((c, i) => (
                  <Box key={i} title={c} sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: HEX.test(c) ? c : '#fff', border: '1px solid #E2E8F0' }} />
                ))}
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="contained" onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : profile ? 'Save as new version' : 'Save brand profile'}
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2.5, borderRadius: 1, boxShadow: 'none', border: '1px solid #E8EEF5' }}>
            <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Setup status</Typography>
            <TextField
              fullWidth size="small" multiline minRows={2} label="Internal notes (not shown to partner)"
              value={notes} onChange={(e) => setNotes(e.target.value)} sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
              <Button variant="outlined" disabled={saving} onClick={() => updateStatus('in_progress')}>Mark in progress</Button>
              <Button variant="outlined" color="inherit" disabled={saving} onClick={() => updateStatus('not_started')}>Mark not done</Button>
              <Button variant="contained" color="success" disabled={saving || !profile} onClick={() => updateStatus('done')}>
                Mark done
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="text" disabled={saving} onClick={() => updateStatus(null)}>Save notes</Button>
            </Stack>
            {!profile && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                Save a brand profile before marking the setup done.
              </Typography>
            )}
            {request.setupCompletedAt && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Completed {formatDate(request.setupCompletedAt)}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BrandDeskRequestDetail;
