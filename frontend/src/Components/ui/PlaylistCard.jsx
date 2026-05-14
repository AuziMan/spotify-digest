import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

export default function PlaylistCard({ id, name, imageUrl }) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/playlist/playlistTracks/${id}`)}
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
          '& .playlist-play': { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
      }}
    >
      {/* Art */}
      <Box
        sx={{
          aspectRatio: '1/1',
          overflow: 'hidden',
          position: 'relative',
          background: imageUrl
            ? 'transparent'
            : 'linear-gradient(135deg, #1a2f1a 0%, #0d1a0d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <QueueMusicRoundedIcon sx={{ fontSize: 36, color: '#4F8EF7', opacity: 0.5 }} />
        )}

        {/* Hover play */}
        <Box
          className="playlist-play"
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#4F8EF7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transform: 'scale(0.8) translateY(4px)',
            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          <PlayArrowRoundedIcon sx={{ fontSize: 22, color: '#fff', ml: '2px' }} />
        </Box>
      </Box>

      {/* Info */}
      <Box sx={{ p: 1.5 }}>
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
          {name}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
          Playlist
        </Typography>
      </Box>
    </Box>
  );
}
