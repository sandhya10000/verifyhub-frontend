import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { FaLinkedin, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';

export const socialLinks = [
  { icon: <FaLinkedin size={15} />,  label: 'LinkedIn',  href: 'https://www.linkedin.com/company/infoverifyhub/', color: '#0A66C2' },
  { icon: <FaThreads size={15} />,   label: 'Threads',   href: 'https://www.threads.com/@info.verifyhub?invite=0', color: '#000000' },
  { icon: <FaInstagram size={15} />, label: 'Instagram', href: 'https://www.instagram.com/info.verifyhub/', color: '#E1306C' },
  { icon: <FaFacebook size={15} />,  label: 'Facebook',  href: 'https://www.facebook.com/share/1RSnR2cGyb/?mibextid=wwXIfr', color: '#1877F2' },
  { icon: <FaYoutube size={15} />,   label: 'YouTube',   href: 'https://youtube.com/@info.verifyhub?si=KMG9lv2oPEuIvdud', color: '#FF0033' },
];

const SocialLinks = ({ variant = 'light', collapsed = false }) => {
  const theme = useTheme();

  if (variant === 'dark') {
    return (
      <Box sx={{ mt: { xs: 2, md: 3 }, pt: 2, borderTop: '1px solid rgba(255,255,255,.12)', px: collapsed ? 1 : 1.5, pb: 1 }}>
        {!collapsed && (
          <Typography sx={{ 
            fontSize: '12px', 
            fontWeight: 700, 
            letterSpacing: '0.06em', 
            textTransform: 'uppercase', 
            color: 'rgba(255,255,255,.55)', 
            mb: 1.5 
          }}>
            Follow us
          </Typography>
        )}
        <Box sx={{ 
          display: 'flex', 
          gap: '8px', 
          flexWrap: collapsed ? 'wrap' : 'nowrap', 
          justifyContent: collapsed ? 'center' : 'flex-start',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center'
        }}>
          {socialLinks.map(({ icon, label, href, color }) => {
            const isThreads = label === 'Threads';
            const hoverColor = isThreads ? '#ffffff' : color;
            return (
              <Box
                key={label}
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,.18)',
                  color: 'rgba(255,255,255,.75)',
                  textDecoration: 'none',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    borderColor: hoverColor,
                    color: hoverColor,
                    transform: 'translateY(-2px)'
                  },
                  '&:focus-visible': {
                    outline: `3px solid ${hoverColor}`,
                    outlineOffset: '2px'
                  }
                }}
              >
                {icon}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  // Light variant (default)
  return (
    <Box sx={{ mt: 6, pt: 5, borderTop: `1px solid ${theme.palette.divider}` }}>
      <Typography sx={{ 
        fontSize: '13px', 
        fontWeight: 700, 
        letterSpacing: '0.06em', 
        textTransform: 'uppercase', 
        color: theme.palette.text.secondary, 
        mb: 2 
      }}>
        Follow us
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {socialLinks.map(({ icon, label, href, color }) => (
          <Box
            key={label}
            component="a"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              border: `1px solid ${theme.palette.divider}`,
              color: theme.palette.text.secondary,
              textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(15,27,45,.06)',
              transition: 'all 0.18s ease',
              '&:hover': {
                borderColor: color,
                color: color,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(15,27,45,.14)'
              },
              '&:focus-visible': {
                outline: `3px solid ${color}`,
                outlineOffset: '2px'
              }
            }}
          >
            {icon}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SocialLinks;
