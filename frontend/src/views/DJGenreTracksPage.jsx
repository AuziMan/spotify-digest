import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Skeleton, Alert, IconButton, Divider } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import axios from 'axios';

function genreAccent(genre) {
  let hash = 0;
  for (let i = 0; i < genre.length; i++) {
    hash = genre.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = ['#4F8EF7', '#7B61FF', '#FF6B6B', '#FFD166', '#06D6A0', '#FF9500', '#E040FB', '#00BCD4'];
  return palette[Math.abs(hash) % palette.length];
}

function Badge({ label, accent }) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 1,
        background: accent ? 'rgba(79,142,247,0.1)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${accent ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.08)'}`,
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: accent ? '#4F8EF7' : 'rgba(255,255,255,0.4)',
          letterSpacing: '0.03em',
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function TrackRow({ id, track, artist, albumImg, bpm, trackKey, index }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/track/${id}`, { state: { track: { id, track, artist, albumImg, bpm, key: trackKey } } })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1,
        borderRadius: 1.5,
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        background: hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
      }}
    >
      <Typography
        sx={{
          width: 24,
          textAlign: 'right',
          flexShrink: 0,
          fontSize: '0.8125rem',
          color: 'rgba(255,255,255,0.3)',
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {index + 1}
      </Typography>

      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#1A1A1A',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {albumImg && !imgError ? (
          <img
            src={albumImg}
            alt={track}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MusicNoteRoundedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.15)' }} />
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 500,
            color: hovered ? '#fff' : 'rgba(255,255,255,0.9)',
            fontSize: '0.9375rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.35,
            transition: 'color 0.15s ease',
          }}
        >
          {track}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.8125rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.35,
          }}
        >
          {artist}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexShrink: 0 }}>
        {bpm && <Badge label={`${bpm} BPM`} />}
        {trackKey && <Badge label={trackKey} accent />}
      </Box>
    </Box>
  );
}

export default function DJGenreTracksPage() {
  const { genreName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const decodedGenre = decodeURIComponent(genreName);
  const accent = genreAccent(decodedGenre);

  const [tracks, setTracks] = useState(location.state?.tracks || null);
  const [loading, setLoading] = useState(!location.state?.tracks);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location.state?.tracks) {
      setLoading(true);
      axios
        .get('/playlist/djGenres', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((res) => {
          const found = res.data?.genres?.find((g) => g.genre === decodedGenre);
          setTracks(found?.tracks || []);
          setLoading(false);
        })
        .catch((err) => { setError(err.message); setLoading(false); });
    }
  }, [decodedGenre, location.state]);

  return (
    <Box sx={{ p: 4, pb: 6 }}>
      {/* Back */}
      <Box sx={{ mb: 4 }}>
        <IconButton
          onClick={() => navigate('/dj-playlists')}
          sx={{
            color: 'rgba(255,255,255,0.45)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.07)',
            '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' },
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        {loading ? (
          <>
            <Skeleton variant="rectangular" width={120} height={26} sx={{ borderRadius: 1.5, mb: 1.5 }} />
            <Skeleton variant="text" width={200} height={48} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={120} height={20} />
          </>
        ) : (
          <>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.375,
                borderRadius: 1.5,
                background: `${accent}18`,
                border: `1px solid ${accent}33`,
                mb: 1.5,
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {decodedGenre}
              </Typography>
            </Box>

            <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1.1, mb: 0.5 }}>
              All Tracks
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
              {tracks?.length ?? 0} {tracks?.length === 1 ? 'track' : 'tracks'} across your playlists
            </Typography>
          </>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Column headers */}
      {!loading && tracks?.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, pb: 1 }}>
            <Typography sx={{ width: 24, textAlign: 'right', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
              #
            </Typography>
            <Box sx={{ width: 44, flexShrink: 0 }} />
            <Typography sx={{ flex: 1, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
              Title
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>BPM</Typography>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', minWidth: 52 }}>Key</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 1 }} />
        </>
      )}

      {/* Tracks */}
      {loading
        ? Array(8).fill(0).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1 }}>
              <Skeleton variant="text" width={20} height={18} sx={{ flexShrink: 0 }} />
              <Skeleton variant="rectangular" width={44} height={44} sx={{ borderRadius: 1, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="55%" height={18} />
                <Skeleton variant="text" width="35%" height={14} sx={{ mt: 0.5 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <Skeleton variant="rectangular" width={60} height={22} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={52} height={22} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          ))
        : tracks?.map((track, i) => (
            <TrackRow
              key={track.id || i}
              id={track.id}
              index={i}
              track={track.track}
              artist={track.artist}
              albumImg={track.albumImg}
              bpm={track.bpm}
              trackKey={track.key}
            />
          ))}

      {!loading && tracks?.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.18)', fontWeight: 600, fontSize: '1.125rem' }}>
            No tracks found for this genre
          </Typography>
        </Box>
      )}
    </Box>
  );
}
