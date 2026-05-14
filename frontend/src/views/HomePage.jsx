import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Skeleton } from '@mui/material';
import axios from 'axios';
import PlaylistCard from '../Components/ui/PlaylistCard';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('/playlist/playlists', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        const items = res.data?.items;
        setPlaylists(Array.isArray(items) ? items : []);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  const featured = playlists.slice(0, 6);
  const rest = playlists.slice(6);

  return (
    <Box sx={{ p: 4, pb: 6 }}>
      {/* Greeting */}
      <Box sx={{ mb: 5 }}>
        <Typography
          sx={{
            fontSize: { xs: '2rem', sm: '2.75rem' },
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            mb: 0.5,
          }}
        >
          {getGreeting()}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: 400 }}>
          Here's your library
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Featured / Top Playlists */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.02em', mb: 2 }}>
          Top Playlists
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(6, 1fr)',
            },
            gap: 2,
          }}
        >
          {loading
            ? Array(6).fill(0).map((_, i) => (
                <Box key={i} sx={{ borderRadius: 2, overflow: 'hidden', background: '#1A1A1A' }}>
                  <Skeleton variant="rectangular" sx={{ aspectRatio: '1/1', width: '100%' }} />
                  <Box sx={{ p: 1.5 }}>
                    <Skeleton variant="text" width="78%" height={17} />
                    <Skeleton variant="text" width="50%" height={13} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              ))
            : featured.map((pl) => (
                <PlaylistCard
                  key={pl.id}
                  id={pl.id}
                  name={pl.name}
                  imageUrl={pl.images?.[0]?.url}
                />
              ))}
        </Box>
      </Box>

      {/* All Playlists */}
      {(loading || rest.length > 0) && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.02em' }}>
              All Playlists
            </Typography>
            {!loading && (
              <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8125rem' }}>
                {playlists.length} total
              </Typography>
            )}
          </Box>

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
              ? Array(12).fill(0).map((_, i) => (
                  <Box key={i} sx={{ borderRadius: 2, overflow: 'hidden', background: '#1A1A1A' }}>
                    <Skeleton variant="rectangular" sx={{ aspectRatio: '1/1', width: '100%' }} />
                    <Box sx={{ p: 1.5 }}>
                      <Skeleton variant="text" width="78%" height={17} />
                      <Skeleton variant="text" width="50%" height={13} sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                ))
              : rest.map((pl) => (
                  <PlaylistCard
                    key={pl.id}
                    id={pl.id}
                    name={pl.name}
                    imageUrl={pl.images?.[0]?.url}
                  />
                ))}
          </Box>
        </Box>
      )}

      {!loading && playlists.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.18)', fontWeight: 600, fontSize: '1.125rem', mb: 0.75 }}>
            No playlists found
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.12)', fontSize: '0.875rem' }}>
            Make sure you're connected to Spotify
          </Typography>
        </Box>
      )}
    </Box>
  );
}
