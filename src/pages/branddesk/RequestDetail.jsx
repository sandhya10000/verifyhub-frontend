import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, TextField, Button, Alert, CircularProgress, Stack, IconButton } from '@mui/material';
import axios from 'axios';
import { FileText, Users, Mail, Phone, Calendar, UserCheck, Upload, Zap, Check, Pencil, ArrowLeft, Tag, Type, MessageSquare, Palette, Megaphone, Image as ImageIcon } from 'lucide-react';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
const API_BASE = `${API_ROOT}/api`;

const PURPLE = '#7C3AED';
const HEX = /^#[0-9a-fA-F]{6}$/;

const SETUP_CHIP = {
  not_started: { label: 'Not done', bg: '#F1F5F9', fg: '#475569' },
  in_progress: { label: 'In Progress', bg: '#FEF3C7', fg: '#B45309' },
  done: { label: 'Done', bg: '#DCFCE7', fg: '#15803D' },
};

const PARTNER_STATUS = {
  active: { label: 'Active', dot: '#16A34A', bg: '#DCFCE7', fg: '#15803D' },
  onboarding: { label: 'Onboarding', dot: '#16A34A', bg: '#F1F5F9', fg: '#334155' },
};

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const formatDate = (v) => (v ? new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

const emptyForm = {
  firmName: '', tagline: '', primaryColor: '#1A3C5E', secondaryColor: '#2E86AB', accentColor: '#F5A623',
  email: '', website: 'https://', phone: '', whatsapp: '', address: '',
};

const Pill = ({ bg, fg, children, dot }) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.4, borderRadius: '999px', bgcolor: bg, color: fg, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
    {dot && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: dot }} />}
    {children}
  </Box>
);

const Card = ({ children, sx }) => (
  <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #EEF1F6', boxShadow: '0 1px 3px rgba(15,30,51,.04)', ...sx }}>
    {children}
  </Paper>
);

// Label + value row used in the Partner Details block.
const InfoRow = ({ icon: Icon, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
    <Icon size={15} color="#64748B" style={{ flexShrink: 0 }} />
    <Typography sx={{ fontSize: '0.85rem', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text || '—'}</Typography>
  </Box>
);

const AssetRow = ({ icon: Icon, label, value, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid #F1F5F9' }}>
    <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: '#F5F3FF', color: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={14} />
    </Box>
    <Typography sx={{ fontSize: '0.84rem', color: '#334155', flexGrow: 1 }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.84rem', color: '#0F172A', fontWeight: 500, textAlign: 'right', maxWidth: '55%', wordBreak: 'break-word' }}>
      {children || value || '—'}
    </Typography>
  </Box>
);

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#F8FAFC', fontSize: '0.9rem', '& fieldset': { borderColor: '#E2E8F0' } },
  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: PURPLE },
  '& .MuiInputLabel-root': { fontSize: '0.78rem', fontWeight: 600, color: '#64748B' },
};

const BrandDeskRequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [editing, setEditing] = useState(false);
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
      setEditing(false);
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
  const setupKey = request.setupStatus || 'not_started';
  const setup = SETUP_CHIP[setupKey];
  const partner = request.partnerId || {};
  const partnerStatus = PARTNER_STATUS[partner.brandingStatus] || { label: partner.brandingStatus || '—', dot: '#94A3B8', bg: '#F1F5F9', fg: '#334155' };
  const previewLogo = logoPreview || profile?.logo?.dataUri;
  const isDone = setupKey === 'done';
  // 1 = brand details, 2 = setup in progress, 3 = completed
  const stepState = isDone ? 3 : setupKey === 'in_progress' || profile ? 2 : 1;
  const steps = ['Brand Details', 'Setup in Progress', 'Completed'];

  const assetRows = [
    { icon: Type, label: 'Company Name', value: details.companyName },
    { icon: MessageSquare, label: 'Tagline', value: details.tagline },
    { icon: Mail, label: 'Contact Email', value: details.contactEmail },
    { icon: Phone, label: 'Contact Phone', value: details.contactPhone },
    { icon: ImageIcon, label: 'Logo URL', value: details.logoUrl },
    { icon: Palette, label: 'Brand Colours', value: (details.brandColors || []).join(', ') },
    { icon: Megaphone, label: 'Notes from Partner', value: details.notes },
    { icon: Calendar, label: 'Submitted At', value: formatDate(details.submittedAt) },
    { icon: Tag, label: 'Revisions Used', value: `${details.revisionsUsed || 0} / 2` },
  ];

  const colourRow = (
    <Box sx={{ display: 'flex', gap: 0.75 }}>
      {(details.brandColors || []).map((c, i) => (
        <Box key={i} title={c} sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: c, border: '1px solid #E2E8F0' }} />
      ))}
    </Box>
  );

  const colourField = (key, label, fallbackHelp) => (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.75, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <Box sx={{ width: 18, height: 18, borderRadius: 0.75, bgcolor: HEX.test(form[key]) ? form[key] : '#fff', border: '1px solid #CBD5E1', flexShrink: 0 }} />
        <TextField variant="standard" fullWidth value={form[key]} onChange={setField(key)} disabled={!editing}
          error={!HEX.test(form[key])} helperText={!HEX.test(form[key]) ? fallbackHelp : undefined}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.88rem', fontWeight: 500 } } }} />
      </Box>
    </Box>
  );

  const textField = (key, label, extra = {}) => (
    <TextField fullWidth size="small" label={label} value={form[key]} onChange={setField(key)} disabled={!editing} sx={fieldSx} {...extra} />
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5, flexWrap: 'wrap' }}>
        <IconButton component={RouterLink} to="/brand-desk/requests" size="small" aria-label="Back to requests">
          <ArrowLeft size={18} />
        </IconButton>
        <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F1E33' }}>{request.requestId}</Typography>
        <Pill bg={setup.bg} fg={setup.fg}>{setup.label}</Pill>
        <Pill bg="#EDE9FE" fg="#6D28D9">{`Payment: ${request.paymentMethod || '—'} ₹${request.amount ?? '—'}`}</Pill>
      </Stack>

      {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(300px, 5fr) 7fr' }, gap: 2.5, alignItems: 'start' }}>
        {/* Left column: partner + submitted assets */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Card>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Users size={18} color={PURPLE} />
              <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>Partner Details</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: '#E0E7FF', color: '#4338CA', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {(partner.name || '?').charAt(0).toUpperCase()}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>{partner.name || '—'}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>Partner ID: {partner.partner_id || '—'}</Typography>
                </Box>
              </Box>
              <Pill bg={partnerStatus.bg} fg={partnerStatus.fg} dot={partnerStatus.dot}>{partnerStatus.label}</Pill>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, rowGap: 2, pt: 2, borderTop: '1px solid #F1F5F9' }}>
              <InfoRow icon={Mail} text={request.email || partner.email} />
              <InfoRow icon={Calendar} text={formatDate(request.createdAt)} />
              <InfoRow icon={Phone} text={request.phone || partner.phone} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <UserCheck size={15} color="#64748B" />
                <Box>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>Partner Account Status</Typography>
                  <Pill bg={partnerStatus.bg} fg={partnerStatus.fg} dot={partnerStatus.dot}>{partnerStatus.label}</Pill>
                </Box>
              </Box>
            </Box>
          </Card>

          <Card>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Upload size={18} color={PURPLE} />
                <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>Submitted Assets</Typography>
              </Box>
              <Box sx={{ minWidth: 24, height: 24, px: 0.75, borderRadius: '999px', bgcolor: '#EDE9FE', color: '#6D28D9', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {assetRows.length}
              </Box>
            </Box>
            {assetRows.map((a) => (
              <AssetRow key={a.label} icon={a.icon} label={a.label} value={a.value}>
                {a.label === 'Brand Colours' ? colourRow : undefined}
              </AssetRow>
            ))}
            {!isDone && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: '#F5F3FF', display: 'flex', gap: 1.25, alignItems: 'center' }}>
                <Box sx={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #6D28D9', color: '#6D28D9', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>i</Box>
                <Typography sx={{ fontSize: '0.82rem', color: '#4C1D95' }}>
                  {partner.brandingStatus === 'onboarding' ? 'Partner is in onboarding stage. Please complete the setup.' : 'Setup is not finished yet.'}
                </Typography>
              </Box>
            )}
          </Card>
        </Box>

        {/* Right column: brand profile + setup status */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Card>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#EDE9FE', color: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={22} />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>Brand Profile</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>Complete brand details for this partner</Typography>
              </Box>
              {editing ? (
                <Stack direction="row" spacing={1}>
                  <Button size="small" color="inherit" disabled={saving} onClick={() => { setEditing(false); setLogoFile(null); load(); }}>Cancel</Button>
                  <Button size="small" variant="contained" onClick={saveProfile} disabled={saving}
                    sx={{ bgcolor: PURPLE, '&:hover': { bgcolor: '#6D28D9' }, textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>
                    {saving ? 'Saving…' : profile ? 'Save as new version' : 'Save brand profile'}
                  </Button>
                </Stack>
              ) : (
                <Button startIcon={<Pencil size={15} />} onClick={() => setEditing(true)}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, color: '#334155', bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}>
                  Edit
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              {textField('firmName', 'Brand Name')}
              {textField('tagline', 'Tagline')}
              {textField('email', 'Report Email')}
              {textField('website', 'Website (https://)')}
              {textField('phone', 'Phone')}
              {textField('whatsapp', 'WhatsApp')}
              {textField('address', 'Address', { sx: { ...fieldSx, gridColumn: { sm: 'span 2' } } })}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, mt: 2 }}>
              {colourField('primaryColor', 'Primary Colour', 'e.g. #1A3C5E')}
              {colourField('secondaryColor', 'Secondary Colour', 'e.g. #2E86AB')}
              {colourField('accentColor', 'Accent Colour', 'e.g. #F5A623')}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2.5, flexWrap: 'wrap' }}>
              {editing && (
                <Button component="label" variant="outlined" size="small" startIcon={<Upload size={15} />}
                  sx={{ textTransform: 'none', borderRadius: 1.5, borderStyle: 'dashed', color: PURPLE, borderColor: '#C4B5FD' }}>
                  {logoFile ? 'Change logo' : profile?.logo?.dataUri ? 'Replace logo' : 'Upload logo'}
                  <input hidden type="file" accept="image/png,image/jpeg" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                </Button>
              )}
              {previewLogo ? (
                <Box sx={{ position: 'relative', width: 96, height: 72, borderRadius: 2, bgcolor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
                  <img src={previewLogo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">No logo uploaded</Typography>
              )}
              {editing && <Typography variant="caption" color="text.secondary">PNG or JPEG, max 2 MB</Typography>}
              {logoFile && <Typography variant="caption" color="warning.main">New logo — not saved yet</Typography>}
              {editing && <Box sx={{ flexGrow: 1 }} />}
            </Box>
          </Card>

          <Card>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Zap size={18} color={PURPLE} />
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>Setup Status</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>Track the current setup progress</Typography>
                </Box>
              </Box>
              <Pill bg={setup.bg} fg={setup.fg} dot={setup.fg}>{setup.label}</Pill>
            </Box>

            {/* Stepper */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', px: { xs: 0, sm: 4 } }}>
              {steps.map((label, i) => {
                const n = i + 1;
                const completed = n < stepState || (n === 3 && isDone);
                const active = n === stepState && !isDone;
                return (
                  <React.Fragment key={label}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 110, flexShrink: 0 }}>
                      <Box sx={{
                        width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.85rem',
                        bgcolor: completed ? PURPLE : '#fff',
                        color: completed ? '#fff' : active ? PURPLE : '#94A3B8',
                        border: completed ? 'none' : `2px solid ${active ? PURPLE : '#CBD5E1'}`,
                        boxShadow: active ? '0 0 0 4px #EDE9FE' : 'none',
                      }}>
                        {completed ? <Check size={16} /> : n}
                      </Box>
                      <Typography sx={{ mt: 1, fontSize: '0.8rem', fontWeight: active ? 700 : 500, color: completed || active ? '#0F172A' : '#94A3B8', textAlign: 'center' }}>
                        {label}
                      </Typography>
                    </Box>
                    {i < steps.length - 1 && (
                      <Box sx={{ flexGrow: 1, height: 2, mt: '14px', bgcolor: n < stepState || isDone ? PURPLE : '#E2E8F0' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </Box>

            {/* Notes + status actions (unchanged behaviour) */}
            <Box sx={{ mt: 3.5 }}>
              <TextField fullWidth size="small" multiline minRows={2} label="Internal notes (not shown to partner)"
                value={notes} onChange={(e) => setNotes(e.target.value)} sx={fieldSx} />
              <Stack direction="row" spacing={1.25} sx={{ mt: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" disabled={saving} onClick={() => updateStatus('in_progress')} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Mark in progress</Button>
                <Button variant="outlined" color="inherit" disabled={saving} onClick={() => updateStatus('not_started')} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Mark not done</Button>
                <Button variant="contained" disabled={saving || !profile} onClick={() => updateStatus('done')}
                  sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}>
                  Mark done
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="text" disabled={saving} onClick={() => updateStatus(null)} sx={{ textTransform: 'none' }}>Save notes</Button>
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
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default BrandDeskRequestDetail;
