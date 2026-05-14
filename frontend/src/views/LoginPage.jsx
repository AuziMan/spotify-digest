import React from 'react';
import { Box, Button, Typography } from '@mui/material';

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orbs */}
      <Box
        sx={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,142,247,0.1) 0%, transparent 65%)',
          top: '-10%',
          left: '5%',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 65%)',
          bottom: '0%',
          right: '10%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1, px: 3, maxWidth: 440 }}>
        {/* Icon */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#4F8EF7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 60px rgba(79,142,247,0.35), 0 0 120px rgba(79,142,247,0.1)',
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" fill="#fff" />
            </svg>
          </Box>
        </Box>

        <Typography
          sx={{
            fontSize: '3rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            mb: 1.5,
          }}
        >
          Spotify Digest
        </Typography>

        <Typography
          sx={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '1.0625rem',
            lineHeight: 1.6,
            mb: 4.5,
            fontWeight: 400,
          }}
        >
          Your personal music dashboard.
          <br />
          Discover your listening habits.
        </Typography>

        <Button
          variant="contained"
          size="large"
          href="http://localhost:4000/auth/login"
          sx={{
            py: 1.625,
            px: 4.5,
            fontSize: '1rem',
            borderRadius: 50,
            background: '#4F8EF7',
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            boxShadow: '0 4px 28px rgba(79,142,247,0.4)',
            '&:hover': {
              background: '#6FA3FF',
              boxShadow: '0 8px 40px rgba(79,142,247,0.55)',
              transform: 'scale(1.03)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Connect with Spotify
        </Button>

        <Typography
          sx={{
            display: 'block',
            mt: 3.5,
            color: 'rgba(255,255,255,0.18)',
            fontSize: '0.75rem',
            lineHeight: 1.6,
          }}
        >
          We only read your listening data.
          <br />
          We never modify your account.
        </Typography>
      </Box>
    </Box>
  );
}
