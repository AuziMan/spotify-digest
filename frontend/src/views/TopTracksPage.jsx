import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Skeleton } from '@mui/material';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import axios from 'axios';
import TrackCard from '../Components/ui/TrackCard';

export default function TopTracksPage() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('/user/topTracks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => { setTracks(res.data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  return (
    <Box sx={{ p: 4, pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
          <WhatshotRoundedIcon sx={{ color: '#4F8EF7', fontSize: 28 }} />
          <Typography
            sx={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
            }}
          >
            Top Tracks
          </Typography>
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: 400 }}>
          Your most played songs
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(5, 1fr)',
            xl: 'repeat(6, 1fr)',
          },
          gap: 2,
        }}
      >
        {loading
          ? Array(20)
              .fill(0)
              .map((_, i) => (
                <Box key={i} sx={{ borderRadius: 2, overflow: 'hidden', background: '#1A1A1A' }}>
                  <Skeleton variant="rectangular" sx={{ aspectRatio: '1/1', width: '100%' }} />
                  <Box sx={{ p: 1.5 }}>
                    <Skeleton variant="text" width="78%" height={17} />
                    <Skeleton variant="text" width="55%" height={13} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              ))
          : tracks.map((track, i) => (
              <TrackCard
                key={i}
                id={track.id}
                trackName={track.track}
                artistName={track.artist}
                albumImg={track.albumImg}
                index={i}
                bpm={track.bpm}
                trackKey={track.key}
              />
            ))}
      </Box>

      {!loading && tracks.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.18)', fontWeight: 600, fontSize: '1.125rem' }}>
            No top tracks yet
          </Typography>
        </Box>
      )}
    </Box>
  );
}
