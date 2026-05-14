import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Skeleton, Alert } from '@mui/material';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import axios from 'axios';

function genreAccent(genre) {
  let hash = 0;
  for (let i = 0; i < genre.length; i++) {
    hash = genre.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = ['#4F8EF7', '#7B61FF', '#FF6B6B', '#FFD166', '#06D6A0', '#FF9500', '#E040FB', '#00BCD4'];
  return palette[Math.abs(hash) % palette.length];
}

function GenreCard({ genre, count, tracks = [] }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const accent = genreAccent(genre || '');
  const previewImgs = Array.isArray(tracks)
    ? tracks.slice(0, 4).map((t) => t?.albumImg).filter(Boolean)
    : [];

  const handleClick = () => {
    navigate(`/dj-playlists/genre/${encodeURIComponent(genre)}`, {
      state: { tracks, genre },
    });
  };

  return (
    <Box
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: 2.5,
        background: '#141414',
        border: `1px solid ${hovered ? accent + '55' : 'rgba(255,255,255,0.06)'}`,
        borderLeft: `3px solid ${accent}`,
        p: 2.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accent}22` : 'none',
      }}
    >
      {/* Genre name + count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography
          sx={{
            fontWeight: 700,
            color: hovered ? '#fff' : 'rgba(255,255,255,0.9)',
            fontSize: '1rem',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            flex: 1,
            pr: 1,
            transition: 'color 0.15s ease',
          }}
        >
          {genre}
        </Typography>
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            background: `${accent}18`,
            border: `1px solid ${accent}33`,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: accent, letterSpacing: '0.04em' }}>
            {count} {count === 1 ? 'track' : 'tracks'}
          </Typography>
        </Box>
      </Box>

      {/* Album art preview strip */}
      {previewImgs.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {previewImgs.map((src, i) => (
            <Box
              key={i}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
              }}
            >
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </Box>
          ))}
          {tracks.length > 4 && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                background: 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                +{tracks.length - 4}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default function DJPlaylistsPage() {
  const [genres, setGenres] = useState([]);
  const [totalTracks, setTotalTracks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('/playlist/djGenres', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        setGenres(res.data?.genres || []);
        setTotalTracks(res.data?.totalTracks || 0);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  return (
    <Box sx={{ p: 4, pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
          <TuneRoundedIcon sx={{ color: '#4F8EF7', fontSize: 28 }} />
          <Typography sx={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1.1 }}>
            DJ Playlists
          </Typography>
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: 400 }}>
          {loading ? 'Loading your library…' : `${totalTracks} tracks across ${genres.length} genres`}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {loading
          ? Array(9).fill(0).map((_, i) => (
              <Box
                key={i}
                sx={{
                  borderRadius: 2.5,
                  background: '#141414',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: '3px solid rgba(255,255,255,0.1)',
                  p: 2.5,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Skeleton variant="text" width="50%" height={22} />
                  <Skeleton variant="rectangular" width={68} height={22} sx={{ borderRadius: 1 }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  {Array(4).fill(0).map((__, j) => (
                    <Skeleton key={j} variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
                  ))}
                </Box>
              </Box>
            ))
          : genres.map(({ genre, count, tracks }) => (
              <GenreCard key={genre} genre={genre} count={count} tracks={tracks} />
            ))}
      </Box>

      {!loading && genres.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.18)', fontWeight: 600, fontSize: '1.125rem' }}>
            No genre data found in your library
          </Typography>
        </Box>
      )}
    </Box>
  );
}
