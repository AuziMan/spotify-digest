import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';

export default function TrackCard({ id, trackName, artistName, albumImg, index, bpm, trackKey }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/track/${id}`, {
      state: { track: { id, track: trackName, artist: artistName, albumImg, bpm, key: trackKey } },
    });
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        background: '#1A1A1A',
        border: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        '&:hover': {
          background: '#242424',
          transform: 'translateY(-4px)',
          borderColor: 'rgba(255,255,255,0.1)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
          '& .play-overlay': { opacity: 1 },
          '& .track-img': { transform: 'scale(1.06)' },
        },
      }}
    >
      {/* Album art */}
      <Box sx={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#111' }}>
        {albumImg && !imgError ? (
          <Box
            component="img"
            src={albumImg}
            alt={trackName}
            className="track-img"
            onError={() => setImgError(true)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.4s ease',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1A1A1A, #111)',
            }}
          >
            <MusicNoteRoundedIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.08)' }} />
          </Box>
        )}

        {/* Play overlay */}
        <Box
          className="play-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#4F8EF7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(79,142,247,0.5)',
            }}
          >
            <PlayArrowRoundedIcon sx={{ fontSize: 26, color: '#fff', ml: '2px' }} />
          </Box>
        </Box>
      </Box>

      {/* Info */}
      <Box sx={{ p: 1.5 }}>
        {index !== undefined && (
          <Typography
            sx={{
              color: '#4F8EF7',
              fontWeight: 700,
              fontSize: '0.625rem',
              letterSpacing: '0.06em',
              mb: 0.375,
              display: 'block',
            }}
          >
            #{index + 1}
          </Typography>
        )}
        <Typography
          sx={{
            fontWeight: 600,
            color: '#fff',
            fontSize: '0.875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.25,
            lineHeight: 1.3,
          }}
        >
          {trackName}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            mb: (bpm || trackKey) ? 0.75 : 0,
          }}
        >
          {artistName}
        </Typography>

        {(bpm || trackKey) && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {bpm && (
              <Box
                sx={{
                  px: 0.75,
                  py: 0.125,
                  borderRadius: 0.75,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}>
                  {bpm} BPM
                </Typography>
              </Box>
            )}
            {trackKey && (
              <Box
                sx={{
                  px: 0.75,
                  py: 0.125,
                  borderRadius: 0.75,
                  background: 'rgba(79,142,247,0.1)',
                  border: '1px solid rgba(79,142,247,0.18)',
                }}
              >
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: '#4F8EF7', letterSpacing: '0.02em' }}>
                  {trackKey}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
