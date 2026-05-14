import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, IconButton, Skeleton, GlobalStyles } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import axios from 'axios';

// Seeded deterministic float [0, 1]
function sfloat(seed, i) {
  const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return Math.abs(x - Math.floor(x));
}

function Waveform({ trackId, bpm }) {
  const BAR_COUNT = 80;

  const bars = useMemo(() => {
    let seed = 0;
    for (let j = 0; j < (trackId?.length || 1); j++) {
      seed += (trackId?.charCodeAt(j) || 1) * (j + 1);
    }
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      // Bell-curve bias: taller bars toward the centre
      const centerBias = 1 - Math.abs(i / BAR_COUNT - 0.5) * 0.7;
      const rand = sfloat(seed, i);
      return {
        height: Math.max(0.07, rand * centerBias),
        delay: sfloat(seed + 999, i),
      };
    });
  }, [trackId]);

  // Pulse at 2× the beat period (so it breathes, not strobes)
  const duration = bpm ? ((60 / bpm) * 2).toFixed(2) : '1.40';

  return (
    <>
      <GlobalStyles
        styles={`
          @keyframes waveBar {
            from { transform: scaleY(0.22); opacity: 0.38; }
            to   { transform: scaleY(1);    opacity: 1;    }
          }
        `}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2.5px',
          height: 96,
          width: '100%',
        }}
      >
        {bars.map(({ height, delay }, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              minWidth: 0,
              height: `${height * 100}%`,
              background: `rgba(79,142,247,${(0.3 + height * 0.7).toFixed(2)})`,
              borderRadius: '3px',
              transformOrigin: 'bottom center',
              animation: `waveBar ${duration}s ease-in-out ${(delay * parseFloat(duration)).toFixed(2)}s infinite alternate`,
            }}
          />
        ))}
      </Box>
    </>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.375,
        px: 3,
        py: 2,
        borderRadius: 2.5,
        background: accent ? 'rgba(79,142,247,0.08)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${accent ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.08)'}`,
        minWidth: 96,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.28)',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: accent ? '#4F8EF7' : '#fff',
          letterSpacing: '-0.025em',
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function TrackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackId } = useParams();

  const [track, setTrack] = useState(location.state?.track || null);
  const [loading, setLoading] = useState(!location.state?.track);

  // If no router state (direct URL), fetch from backend
  useEffect(() => {
    if (!location.state?.track && trackId) {
      axios
        .get(`/user/track/${trackId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((res) => { setTrack(res.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [trackId, location.state]);

  return (
    <Box sx={{ p: 4, pb: 8 }}>
      {/* Back */}
      <Box sx={{ mb: 5 }}>
        <IconButton
          onClick={() => navigate(-1)}
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

      {loading ? (
        /* Loading state */
        <Box>
          <Box sx={{ display: 'flex', gap: 6, mb: 6 }}>
            <Skeleton variant="rectangular" sx={{ width: 300, height: 300, borderRadius: 4, flexShrink: 0 }} />
            <Box sx={{ pt: 2, flex: 1 }}>
              <Skeleton variant="text" width="70%" height={56} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={28} sx={{ mb: 4 }} />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Skeleton variant="rectangular" width={96} height={68} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" width={96} height={68} sx={{ borderRadius: 2 }} />
              </Box>
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
        </Box>
      ) : !track ? (
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '1rem' }}>
            Track not found
          </Typography>
        </Box>
      ) : (
        <>
          {/* Hero */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 4, md: 6 },
              alignItems: { xs: 'center', md: 'flex-start' },
              mb: 6,
            }}
          >
            {/* Album art */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              {/* Blue glow */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: -24,
                  background: 'radial-gradient(circle, rgba(79,142,247,0.18) 0%, transparent 68%)',
                  filter: 'blur(24px)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              <Box
                sx={{
                  width: { xs: 240, md: 300 },
                  height: { xs: 240, md: 300 },
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: '#1A1A1A',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 48px 120px rgba(0,0,0,0.85)',
                  position: 'relative',
                  zIndex: 1,
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
                    <MusicNoteRoundedIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.06)' }} />
                  </Box>
                )}
              </Box>
            </Box>

            {/* Info */}
            <Box
              sx={{
                flex: 1,
                pt: { md: 1 },
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '1.75rem', md: '2.75rem' },
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.035em',
                  lineHeight: 1.1,
                  mb: 0.75,
                }}
              >
                {track.track}
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.125rem',
                  color: 'rgba(255,255,255,0.45)',
                  fontWeight: 400,
                  mb: 4,
                }}
              >
                {track.artist}
              </Typography>

              {/* Stat cards */}
              {(track.bpm || track.key) ? (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    flexWrap: 'wrap',
                  }}
                >
                  {track.bpm && <StatCard label="BPM" value={track.bpm} />}
                  {track.key && <StatCard label="Key" value={track.key} accent />}
                </Box>
              ) : (
                <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8125rem', fontStyle: 'italic' }}>
                  Audio features unavailable for this track
                </Typography>
              )}
            </Box>
          </Box>

          {/* Waveform card */}
          <Box
            sx={{
              background: '#111',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 3,
              p: { xs: 2.5, md: 3.5 },
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.22)',
                }}
              >
                Waveform
              </Typography>
              {track.bpm && (
                <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
                  {track.bpm} BPM · pulsing at beat tempo
                </Typography>
              )}
            </Box>
            <Waveform trackId={track.id} bpm={track.bpm} />
          </Box>
        </>
      )}
    </Box>
  );
}
