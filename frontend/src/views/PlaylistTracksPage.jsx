import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, Skeleton, Divider } from '@mui/material';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import axios from 'axios';

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

  const handleClick = () => {
    navigate(`/track/${id}`, {
      state: { track: { id, track, artist, albumImg, bpm, key: trackKey } },
    });
  };

  return (
    <Box
      onClick={handleClick}
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
      {/* Index */}
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

      {/* Album art */}
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

      {/* Track info */}
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

      {/* BPM + Key badges */}
      <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexShrink: 0 }}>
        {bpm && <Badge label={`${bpm} BPM`} />}
        {trackKey && <Badge label={trackKey} accent />}
      </Box>
    </Box>
  );
}

export default function PlaylistTracksPage() {
  const { playlistId } = useParams();
  const [tracks, setTracks] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`/playlist/playlistTracks/${playlistId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        setPlaylistName(res.data?.playlistName || 'Playlist');
        setTracks(Array.isArray(res.data?.playlistTracks) ? res.data.playlistTracks : []);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [playlistId]);

  return (
    <Box sx={{ p: 4, pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        {loading ? (
          <>
            <Skeleton variant="text" width={240} height={52} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={100} height={20} />
          </>
        ) : (
          <>
            <Typography
              sx={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.035em',
                lineHeight: 1.1,
                mb: 0.5,
              }}
            >
              {playlistName}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
              {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
            </Typography>
          </>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Column headers */}
      {!loading && tracks.length > 0 && (
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
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
                BPM
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', minWidth: 52 }}>
                Key
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 1 }} />
        </>
      )}

      {/* Track list */}
      {loading ? (
        Array(12).fill(0).map((_, i) => (
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
      ) : (
        tracks.map((track, i) => (
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
        ))
      )}

      {!loading && tracks.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.18)', fontWeight: 600, fontSize: '1.125rem' }}>
            This playlist is empty
          </Typography>
        </Box>
      )}
    </Box>
  );
}
