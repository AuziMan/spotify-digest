import React from 'react';
import { Box, Typography } from '@mui/material';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';

export default function NowPlayingBar({ track }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 88,
        background: 'rgba(10,10,10,0.88)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        zIndex: 200,
      }}
    >
      {track ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Album art */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              overflow: 'hidden',
              flexShrink: 0,
              background: '#1A1A1A',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            {track.albumImg ? (
              <img
                src={track.albumImg}
                alt={track.track}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MusicNoteRoundedIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.2)' }} />
              </Box>
            )}
          </Box>

          {/* Track info */}
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <GraphicEqRoundedIcon
                sx={{
                  fontSize: 13,
                  color: '#4F8EF7',
                  flexShrink: 0,
                  animation: 'eq 1.1s ease-in-out infinite alternate',
                  '@keyframes eq': { from: { opacity: 0.4 }, to: { opacity: 1 } },
                }}
              />
              <Typography
                sx={{
                  fontWeight: 600,
                  color: '#fff',
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 200,
                }}
              >
                {track.track}
              </Typography>
            </Box>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: '0.75rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 200,
              }}
            >
              {track.artist}
            </Typography>
          </Box>

          {/* Live pill */}
          <Box
            sx={{
              ml: 2,
              px: 1.25,
              py: 0.375,
              borderRadius: 50,
              background: 'rgba(79,142,247,0.12)',
              border: '1px solid rgba(79,142,247,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 0.625,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#4F8EF7',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                },
              }}
            />
            <Typography sx={{ color: '#4F8EF7', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.06em' }}>
              LIVE
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              background: '#1A1A1A',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MusicNoteRoundedIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.12)' }} />
          </Box>
          <Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontWeight: 500, fontSize: '0.875rem' }}>
              Nothing playing
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>
              Open Spotify to start listening
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
