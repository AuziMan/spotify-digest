import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Skeleton } from '@mui/material';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import axios from 'axios';

export default function NowPlayingPage() {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = () => {
      axios
        .get('/user/nowPlaying', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((res) => {
          setTrack(res.data && res.data.length > 0 ? res.data[0] : null);
          setLoading(false);
        })
        .catch(() => { setTrack(null); setLoading(false); });
    };

    fetch();
    const id = setInterval(fetch, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loading ? (
        <Box sx={{ textAlign: 'center' }}>
          <Skeleton
            variant="rectangular"
            sx={{ width: 280, height: 280, borderRadius: 4, mx: 'auto', mb: 3 }}
          />
          <Skeleton variant="text" width={200} height={36} sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" width={140} height={22} sx={{ mx: 'auto' }} />
        </Box>
      ) : track ? (
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          {/* Badge */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Chip
              icon={
                <GraphicEqRoundedIcon
                  sx={{
                    fontSize: '0.95rem !important',
                    color: '#4F8EF7 !important',
                    animation: 'eq 1.1s ease-in-out infinite alternate',
                    '@keyframes eq': { from: { opacity: 0.4 }, to: { opacity: 1 } },
                  }}
                />
              }
              label="Now Playing"
              sx={{
                background: 'rgba(79,142,247,0.1)',
                border: '1px solid rgba(79,142,247,0.22)',
                color: '#4F8EF7',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
              }}
            />
          </Box>

          {/* Album art */}
          <Box
            sx={{
              width: 280,
              height: 280,
              borderRadius: 4,
              overflow: 'hidden',
              mx: 'auto',
              mb: 4.5,
              background: '#1A1A1A',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(79,142,247,0.07)',
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
                <MusicNoteRoundedIcon sx={{ fontSize: 72, color: 'rgba(255,255,255,0.06)' }} />
              </Box>
            )}
          </Box>

          <Typography
            sx={{
              fontWeight: 800,
              color: '#fff',
              fontSize: '1.875rem',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              mb: 0.75,
            }}
          >
            {track.track}
          </Typography>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.0625rem', fontWeight: 400 }}
          >
            {track.artist}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: '#111',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3.5,
            }}
          >
            <MusicNoteRoundedIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.06)' }} />
          </Box>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.22)', fontWeight: 600, fontSize: '1.125rem', mb: 0.75 }}
          >
            Nothing playing right now
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.12)', fontSize: '0.875rem' }}>
            Open Spotify and start listening
          </Typography>
        </Box>
      )}
    </Box>
  );
}
