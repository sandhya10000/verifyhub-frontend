import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Alert, Skeleton,
  Chip, Switch, FormControlLabel, Divider,
} from '@mui/material';
import { Save, RefreshCw, Database, Sheet, KeyRound, Clock } from 'lucide-react';

const API = (path) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const TAB_META = [
  { key: 'bureau', label: 'Bureau Reports', desc: 'CIBIL · CRIF · Experian · Equifax pulls' },
  { key: 'ai', label: 'AI Analysis', desc: 'AI Credit Report Analyzer results' },
  { key: 'rc', label: 'Vehicle RC', desc: 'RC verifications' },
  { key: 'gst', label: 'GST', desc: 'GSTIN verifications' },
];

const fmtTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
};

const AdminSettings = () => {
  const [config, setConfig] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [pending, setPending] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [banner, setBanner] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(API('/admin/integrations/google-sheets'), { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data.config);
        setKeyFile(data.data.keyFile);
        setPending(data.data.pending);
        setHeaders(data.data.headers);
      } else {
        setBanner({ tone: 'error', text: 'Could not load Sheets settings.' });
      }
    } catch {
      setBanner({ tone: 'error', text: 'Could not load Sheets settings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const setField = (field, v) => setConfig((c) => ({ ...c, [field]: v }));
  const setTab = (k, v) => setConfig((c) => ({ ...c, tabs: { ...c.tabs, [k]: v } }));
  const setEnabled = (k, v) => setConfig((c) => ({ ...c, enabled: { ...c.enabled, [k]: v } }));

  const handleSave = async () => {
    try {
      setSaving(true);
      setBanner(null);
      const res = await fetch(API('/admin/integrations/google-sheets'), {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          spreadsheetId: config.spreadsheetId,
          tabs: config.tabs,
          enabled: config.enabled,
          scheduleMinutes: Number(config.scheduleMinutes),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data.config);
        setKeyFile(data.data.keyFile);
        setBanner({ tone: 'success', text: 'Sheets settings saved.' });
      } else {
        setBanner({ tone: 'error', text: data.message || 'Save failed.' });
      }
    } catch {
      setBanner({ tone: 'error', text: 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async (backfill) => {
    try {
      setSyncing(true);
      setBanner(null);
      const res = await fetch(API('/admin/integrations/google-sheets/sync-now'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ backfill: Boolean(backfill) }),
      });
      const data = await res.json();
      if (data.success) {
        const parts = Object.entries(data.data)
          .filter(([, r]) => !r.skipped)
          .map(([k, r]) => `${k}: ${r.pushed ?? 0} rows${r.error ? ` (error: ${r.error})` : ''}`);
        setBanner({ tone: 'success', text: backfill ? `Backfill done — ${parts.join(' · ')}` : `Sync done — ${parts.join(' · ')}` });
        fetchSettings();
      } else {
        setBanner({ tone: 'error', text: data.message || 'Sync failed.' });
      }
    } catch {
      setBanner({ tone: 'error', text: 'Sync failed.' });
    } finally {
      setSyncing(false);
    }
  };

  if (loading || !config) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Settings</Typography>
        <Skeleton variant="rounded" height={220} sx={{ mt: 2 }} />
      </Box>
    );
  }

  const sheetUrl = config.spreadsheetId ? `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit` : null;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Settings</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
        Platform settings and integrations.
      </Typography>

      {banner && (
        <Alert severity={banner.tone} onClose={() => setBanner(null)} sx={{ mb: 2, borderRadius: 2 }}>
          {banner.text}
        </Alert>
      )}

      {/* Google Sheets export */}
      <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Sheet size={20} color="#16a34a" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Google Sheets export</Typography>
          <Chip
            label={keyFile?.configured ? 'Key connected' : 'Key missing'}
            size="small"
            color={keyFile?.configured ? 'success' : 'warning'}
            sx={{ ml: 'auto', fontWeight: 700 }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Verification data is pushed to your spreadsheet on a schedule. Sync failures never affect verifications.
          {sheetUrl && (
            <> Open the sheet: <a href={sheetUrl} target="_blank" rel="noreferrer">{config.spreadsheetId}</a></>
          )}
        </Typography>

        {!keyFile?.configured && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            {keyFile?.message || 'Service-account key not configured.'} Set <b>GOOGLE_SA_KEYFILE</b> on the
            server to the key JSON path, then share the sheet (Editor) with the service-account email.
          </Alert>
        )}
        {keyFile?.configured && keyFile?.clientEmail && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <KeyRound size={15} />
              <span>Share the sheet (Editor) with <b>{keyFile.clientEmail}</b> or syncs will fail with 403.</span>
            </Box>
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              label="Spreadsheet ID"
              value={config.spreadsheetId || ''}
              onChange={(e) => setField('spreadsheetId', e.target.value)}
              size="small"
              fullWidth
              helperText="From the sheet URL: docs.google.com/spreadsheets/d/<ID>/edit"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem' } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Every N minutes (5–1440)"
              type="number"
              value={config.scheduleMinutes ?? 15}
              onChange={(e) => setField('scheduleMinutes', e.target.value)}
              size="small"
              fullWidth
              slotProps={{ htmlInput: { min: 5, max: 1440 } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem' } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          {TAB_META.map((t) => (
            <Grid size={{ xs: 12, md: 6 }} key={t.key}>
              <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Database size={16} color="#2563eb" />
                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{t.label}</Typography>
                  <FormControlLabel
                    control={<Switch size="small" checked={Boolean(config.enabled?.[t.key])} onChange={(e) => setEnabled(t.key, e.target.checked)} />}
                    label={config.enabled?.[t.key] ? 'On' : 'Off'}
                    sx={{ ml: 'auto', mr: 0 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>{t.desc}</Typography>
                <TextField
                  label="Tab name"
                  value={config.tabs?.[t.key] || ''}
                  onChange={(e) => setTab(t.key, e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem' } }}
                />
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip size="small" label={`${pending?.[t.key] ?? '?'} pending`} variant="outlined" />
                  <Chip
                    size="small"
                    icon={<Clock size={12} />}
                    label={`last: ${fmtTime(config.lastSync?.[t.key])}`}
                    variant="outlined"
                  />
                </Box>
                {config.lastError?.[t.key] && (
                  <Alert severity="error" sx={{ mt: 1.5, borderRadius: 1.5 }}>{config.lastError[t.key]}</Alert>
                )}
                {headers?.[t.key] && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1.5, lineHeight: 1.6 }}>
                    Columns: {headers[t.key].join(' · ')}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            disableElevation
            startIcon={<Save size={16} />}
            disabled={saving}
            onClick={handleSave}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            disabled={syncing}
            onClick={() => handleSync(false)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {syncing ? 'Syncing…' : 'Sync now'}
          </Button>
          <Button
            variant="outlined"
            color="warning"
            disabled={syncing}
            onClick={() => handleSync(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Backfill all
          </Button>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
          Sync now pushes only new records. Backfill re-pushes everything (up to 500 rows per tab per run — repeat until pending hits 0).
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminSettings;
