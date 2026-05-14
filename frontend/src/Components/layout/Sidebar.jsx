import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Skeleton,
  Tooltip,
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import axios from 'axios';

const NAV_ITEMS = [
  { label: 'Home', path: '/home', icon: <HomeRoundedIcon fontSize="small" /> },
  { label: 'Top Tracks', path: '/top-tracks', icon: <WhatshotRoundedIcon fontSize="small" /> },
  { label: 'Recommended', path: '/user-reccomended', icon: <AutoAwesomeRoundedIcon fontSize="small" /> },
  { label: 'DJ Playlists', path: '/dj-playlists', icon: <TuneRoundedIcon fontSize="small" /> },
  { label: 'Now Playing', path: '/now-playing', icon: <GraphicEqRoundedIcon fontSize="small" /> },
];

export default function Sidebar({ width }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

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
      .catch(() => setLoading(false));
  }, []);

  return (
    <Box
      sx={{
        width,
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        background: '#0F0F0F',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: '#2A2A2A', borderRadius: 2 },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, pt: 3.5, pb: 2.5, cursor: 'pointer' }} onClick={() => navigate('/home')}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#4F8EF7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" fill="#fff" />
            </svg>
          </Box>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            Digest
          </Typography>
        </Box>
      </Box>

      {/* Main nav */}
      <List sx={{ px: 1.5, py: 0 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{ py: 1, px: 1.5, borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2, my: 2 }} />

      {/* Library header */}
      <Box
        sx={{
          px: 2.5,
          mb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', letterSpacing: '0.1em' }}
        >
          Your Library
        </Typography>
        <Tooltip title="Create playlist" placement="right">
          <Box
            onClick={() => navigate('/create-playlist')}
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)',
              transition: 'all 0.15s ease',
              '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.08)' },
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 15 }} />
          </Box>
        </Tooltip>
      </Box>

      {/* Playlist list */}
      <List sx={{ px: 1.5, py: 0, flex: 1 }}>
        {loading
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <ListItem key={i} sx={{ py: 0.5, px: 1.5 }}>
                  <Skeleton variant="text" width="75%" height={18} />
                </ListItem>
              ))
          : playlists.map((pl) => (
              <ListItem key={pl.id} disablePadding>
                <ListItemButton
                  selected={location.pathname.includes(pl.id)}
                  onClick={() => navigate(`/playlist/playlistTracks/${pl.id}`)}
                  sx={{ py: 0.625, px: 1.5, borderRadius: 1.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <QueueMusicRoundedIcon sx={{ fontSize: '0.85rem' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={pl.name}
                    primaryTypographyProps={{
                      fontSize: '0.8125rem',
                      fontWeight: 400,
                      noWrap: true,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
      </List>

      {/* Bottom spacer for now-playing bar */}
      <Box sx={{ height: 96 }} />
    </Box>
  );
}
