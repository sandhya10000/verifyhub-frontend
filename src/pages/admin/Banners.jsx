import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Button, Alert, Skeleton,
  Chip, Switch, FormControlLabel, Divider, Slider,
} from '@mui/material';
import { Upload, RotateCcw, Image as ImageIcon } from 'lucide-react';
import AutoCropBanner from '../../Components/shared/AutoCropBanner';

const API = (path) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
const BACKEND_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// Uploaded files live on the backend ("/uploads/banners/..."); the bundled
// default ("/Add_Funds_banner.png") is a frontend public asset.
const resolveSrc = (imageUrl) => {
  if (!imageUrl) return '/Add_Funds_banner.png';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith('/uploads/')) return `${BACKEND_ORIGIN}${imageUrl}`;
  return imageUrl;
};

const AdminBanners = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingCrop, setSavingCrop] = useState(false);
  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(null);
  // Manual crop override (percent per side). Auto-detect runs first; the
  // larger of the two wins on the live page. Touch only if bands remain.
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const fileRef = useRef(null);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const res = await fetch(API('/admin/banners/add-funds'), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setCropTop(Math.round(Number(data.data.cropTop || 0) * 100));
        setCropBottom(Math.round(Number(data.data.cropBottom || 0) * 100));
        setCropLeft(Math.round(Number(data.data.cropLeft || 0) * 100));
        setCropRight(Math.round(Number(data.data.cropRight || 0) * 100));
      } else setBanner({ tone: 'error', text: 'Could not load banner.' });
    } catch {
      setBanner({ tone: 'error', text: 'Could not load banner.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanner(); }, []);

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setBanner({ tone: 'error', text: 'Only PNG, JPG or WebP images are supported.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setBanner({ tone: 'error', text: 'Image must be under 5 MB.' });
      return;
    }
    setPreview({ file, url: URL.createObjectURL(file) });
    setBanner(null);
  };

  const handleUpload = async () => {
    if (!preview?.file) return;
    try {
      setUploading(true);
      setBanner(null);
      const form = new FormData();
      form.append('banner', preview.file);
      const res = await fetch(API('/admin/banners/add-funds'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setCropTop(Math.round(Number(data.data.cropTop || 0) * 100));
        setCropBottom(Math.round(Number(data.data.cropBottom || 0) * 100));
        setCropLeft(Math.round(Number(data.data.cropLeft || 0) * 100));
        setCropRight(Math.round(Number(data.data.cropRight || 0) * 100));
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
        setBanner({ tone: 'success', text: 'Banner published — live on Add Funds now.' });
      } else {
        setBanner({ tone: 'error', text: data.message || 'Upload failed.' });
      }
    } catch {
      setBanner({ tone: 'error', text: 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleToggle = async (enabled) => {
    try {
      const res = await fetch(API('/admin/banners/add-funds'), {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setBanner({ tone: 'success', text: enabled ? 'Banner visible on Add Funds.' : 'Banner hidden on Add Funds.' });
      } else {
        setBanner({ tone: 'error', text: data.message || 'Update failed.' });
      }
    } catch {
      setBanner({ tone: 'error', text: 'Update failed.' });
    }
  };

  const handleCropSave = async () => {
    try {
      setSavingCrop(true);
      setBanner(null);
      const res = await fetch(API('/admin/banners/add-funds'), {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropTop: cropTop / 100, cropBottom: cropBottom / 100, cropLeft: cropLeft / 100, cropRight: cropRight / 100 }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setBanner({ tone: 'success', text: 'Crop applied — live on Add Funds now.' });
      } else {
        setBanner({ tone: 'error', text: data.message || 'Crop save failed.' });
      }
    } catch {
      setBanner({ tone: 'error', text: 'Crop save failed.' });
    } finally {
      setSavingCrop(false);
    }
  };
  const handleReset = async () => {
    try {
      setBanner(null);
      const res = await fetch(API('/admin/banners/add-funds'), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setCropTop(0);
        setCropBottom(0);
        setCropLeft(0);
        setCropRight(0);
        setPreview(null);
        setBanner({ tone: 'success', text: 'Reverted to the default banner.' });
      } else {
        setBanner({ tone: 'error', text: data.message || 'Reset failed.' });
      }
    } catch {
      setBanner({ tone: 'error', text: 'Reset failed.' });
    }
  };

  if (loading || !config) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Banners</Typography>
        <Skeleton variant="rounded" height={280} sx={{ mt: 2 }} />
      </Box>
    );
  }

  const liveSrc = resolveSrc(config.imageUrl);

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Banners</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2.5 }}>
        Upload once, live instantly for all partners. Changes never affect payments or wallet credits.
      </Typography>

      {banner && (
        <Alert severity={banner.tone} onClose={() => setBanner(null)} sx={{ mb: 2, borderRadius: 2 }}>
          {banner.text}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <ImageIcon size={20} color="#7c3aed" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Add Funds banner</Typography>
          <Chip
            label={config.isDefault ? 'Default' : 'Custom'}
            size="small"
            color={config.isDefault ? 'default' : 'success'}
            sx={{ ml: 'auto', fontWeight: 700 }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Shown at the top of the partner Add Funds page. Wide images work best (about 2170 × 506).
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <FormControlLabel
            control={<Switch size="small" checked={config.enabled !== false} onChange={(e) => handleToggle(e.target.checked)} />}
            label={config.enabled !== false ? 'Visible' : 'Hidden'}
          />
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1 }}>
          LIVE NOW
        </Typography>
        <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2, bgcolor: '#4C1D95' }}>
          <AutoCropBanner
            src={liveSrc}
            alt="Live Add Funds banner"
            minTop={cropTop / 100}
            minBottom={cropBottom / 100}
            minLeft={cropLeft / 100}
            minRight={cropRight / 100}
          />
        </Box>

        <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Manual crop (fallback)</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
            Black/white bars are removed automatically. If any band remains, nudge these — the larger of auto vs manual wins. Preview above updates live.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ flex: '1 1 220px', minWidth: 200 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Top: {cropTop}%</Typography>
              <Slider size="small" min={0} max={35} step={1} value={cropTop} onChange={(_, v) => setCropTop(v)} />
            </Box>
            <Box sx={{ flex: '1 1 220px', minWidth: 200 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Bottom: {cropBottom}%</Typography>
              <Slider size="small" min={0} max={35} step={1} value={cropBottom} onChange={(_, v) => setCropBottom(v)} />
            </Box>
            <Box sx={{ flex: '1 1 220px', minWidth: 200 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Left: {cropLeft}%</Typography>
              <Slider size="small" min={0} max={35} step={1} value={cropLeft} onChange={(_, v) => setCropLeft(v)} />
            </Box>
            <Box sx={{ flex: '1 1 220px', minWidth: 200 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Right: {cropRight}%</Typography>
              <Slider size="small" min={0} max={35} step={1} value={cropRight} onChange={(_, v) => setCropRight(v)} />
            </Box>
            <Button
              variant="contained" disableElevation disabled={savingCrop}
              onClick={handleCropSave}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              {savingCrop ? 'Applying…' : 'Apply crop'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1 }}>
          UPLOAD NEW
        </Typography>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFilePick} style={{ display: 'none' }} />
        {preview && (
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '2px solid #7c3aed', mb: 2 }}>
            <AutoCropBanner src={preview.url} alt="New banner preview" />
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<Upload size={16} />} onClick={() => fileRef.current?.click()}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
            {preview ? 'Choose different image' : 'Choose image'}
          </Button>
          <Button variant="contained" disableElevation disabled={!preview || uploading} onClick={handleUpload}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
            {uploading ? 'Publishing…' : 'Publish banner'}
          </Button>
          <Button variant="outlined" color="warning" startIcon={<RotateCcw size={16} />} onClick={handleReset} disabled={config.isDefault}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
            Revert to default
          </Button>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
          PNG, JPG or WebP · max 5 MB · publishing replaces the previous upload immediately.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminBanners;
