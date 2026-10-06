import React, { useState, useCallback, useRef } from 'react';
import { Dialog, Button, Typography, Box, IconButton } from '@mui/material';
import { X, ArrowUpRight, Lightbulb, Bell, Gift } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/info.verifyhub/';

const PERKS = [
  { icon: Lightbulb, label: 'Credit tips' },
  { icon: Bell, label: 'Updates' },
  { icon: Gift, label: 'Offers' },
];

/* ------------------------------------------------------------------ */
/* Modal component                                                     */
/* The "= {}" default means a stray no-argument call can never crash.  */
/* ------------------------------------------------------------------ */
export const InstagramFollowModal = ({ open = false, onClose = () => {} } = {}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="instagram-modal-title"
      BackdropProps={{
        sx: { backgroundColor: 'rgba(15, 31, 61, 0.55)', backdropFilter: 'blur(6px)' },
      }}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          m: 2,
          boxShadow: '0 24px 60px rgba(15, 31, 61, 0.35)',
        },
      }}
    >
      {/* Header banner */}
      <Box
        sx={{
          position: 'relative',
          height: 128,
          background:
            'radial-gradient(circle at 85% 0%, rgba(45,212,167,0.35) 0%, rgba(45,212,167,0) 45%), linear-gradient(135deg, #0F1F3D 0%, #1E3A6E 100%)',
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'rgba(255,255,255,0.85)',
            bgcolor: 'rgba(255,255,255,0.12)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
          }}
        >
          <X size={18} />
        </IconButton>

        {/* Clickable Instagram logo tile */}
        <Box
          component="a"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="VerifyHub on Instagram"
          onClick={onClose}
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: -36,
            transform: 'translateX(-50%)',
            width: 72,
            height: 72,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #2563EB 0%, #1E3A6E 100%)',
            border: '4px solid #fff',
            boxShadow: '0 10px 24px rgba(37, 99, 235, 0.35)',
            transition: 'transform .2s ease, box-shadow .2s ease',
            '&:hover': {
              transform: 'translateX(-50%) translateY(-2px) scale(1.04)',
              boxShadow: '0 14px 30px rgba(37, 99, 235, 0.45)',
            },
            '&:focus-visible': { outline: '3px solid #2DD4A7', outlineOffset: 3 },
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: 3.5, pt: 6.5, pb: 3, textAlign: 'center' }}>
        <Typography
          id="instagram-modal-title"
          variant="h5"
          sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', mb: 1 }}
        >
          Follow us on Instagram
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, mb: 2.5 }}>
          Get credit tips, product updates and offers from VerifyHub.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {PERKS.map(({ icon: Icon, label }) => (
            <Box
              key={label}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.6,
                borderRadius: '999px',
                bgcolor: '#F1F5F9',
                color: '#334155',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              <Icon size={14} color="#2563EB" />
              {label}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            component="a"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            variant="contained"
            endIcon={<ArrowUpRight size={18} />}
            sx={{
              py: 1.5,
              borderRadius: '14px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 15,
              color: '#fff',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                boxShadow: '0 10px 26px rgba(37, 99, 235, 0.45)',
              },
            }}
          >
            Follow on Instagram
          </Button>
          <Button
            onClick={onClose}
            variant="text"
            sx={{
              py: 1,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#64748B',
              '&:hover': { bgcolor: '#F1F5F9', color: '#334155' },
            }}
          >
            Maybe later
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/*                                                                     */
/* const { showInstagramModal, instagramModal } = useInstagramModal(); */
/*   - call showInstagramModal() after a successful download           */
/*   - render {instagramModal} once in the page JSX (NOT as a call)    */
/*                                                                     */
/* Optional: useInstagramModal({ onClose }) runs onClose after the     */
/* popup closes (used by the analyzer page to reset itself).           */
/* ------------------------------------------------------------------ */
export const useInstagramModal = ({ onClose } = {}) => {
  const [open, setOpen] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const showInstagramModal = useCallback(() => setOpen(true), []);

  const closeInstagramModal = useCallback(() => {
    setOpen((wasOpen) => {
      if (wasOpen && typeof onCloseRef.current === 'function') {
        // run after state update so a double close can't fire it twice
        setTimeout(() => onCloseRef.current && onCloseRef.current(), 0);
      }
      return false;
    });
  }, []);

  const instagramModal = (
    <InstagramFollowModal open={open} onClose={closeInstagramModal} />
  );

  return {
    open,
    showInstagramModal,
    closeInstagramModal,
    instagramModal, // a React element: render it as {instagramModal}
  };
};

export default useInstagramModal;