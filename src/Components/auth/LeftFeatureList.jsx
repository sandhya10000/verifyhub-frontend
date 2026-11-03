import React from 'react';
import { Box, Typography } from '@mui/material';
import { Sparkles, FileBarChart, Layers, Zap } from 'lucide-react';

export const FEATURES = [
  {
    icon: Zap,
    title: 'Instant credit reports without OTP',
    text: 'Download a customer’s credit report in seconds, with no OTP step to wait on.',
  },
  {
    icon: Sparkles,
    title: 'AI Credit Report Analyzer',
    text: 'Turns a long report into a plain-language summary and points out what matters for the lending decision.',
  },
  {
    icon: FileBarChart,
    title: 'Bank Statement Analyzer',
    text: 'Upload statements and review income, spending and cash flow without checking each line by hand.',
  },
  {
    icon: Layers,
    title: 'White Label Solution',
    text: 'Offer these tools to your own customers under your brand name and logo.',
  },
];

const LeftFeatureList = ({ sx = {} }) => {
  return (
    <Box
      component="ul"
      sx={{
        width: '100%',
        listStyle: 'none',
        p: 0,
        m: 0,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {FEATURES.map((item, index) => {
        const IconComponent = item.icon;
        const isNotLast = index < FEATURES.length - 1;

        return (
          <Box
            component="li"
            key={item.title}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              py: '16px',
              borderBottom: isNotLast ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* 44x44 icon tile */}
            <Box
              sx={{
                width: 44,
                height: 44,
                minWidth: 44,
                minHeight: 44,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <IconComponent size={22} color="#FFFFFF" strokeWidth={2} />
            </Box>

            {/* Text block */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                component="h4"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  lineHeight: 1.25,
                  m: 0,
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                }}
              >
                {item.title}
              </Typography>
              <Typography
                component="p"
                sx={{
                  color: '#B9C2F3',
                  fontSize: '0.97rem',
                  lineHeight: 1.5,
                  mt: '4px',
                  mb: 0,
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {item.text}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default LeftFeatureList;

