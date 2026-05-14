import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import NowPlayingBar from '../ui/NowPlayingBar';
import axios from 'axios';

const SIDEBAR_WIDTH = 260;
const NOW_PLAYING_HEIGHT = 88;

export default function AppLayout() {
  const [nowPlaying, setNowPlaying] = useState(null);

  useEffect(() => {
    const fetch = () => {
      axios.get('/user/nowPlaying', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((res) => {
          if (res.data && res.data.length > 0) setNowPlaying(res.data[0]);
          else setNowPlaying(null);
        })
        .catch(() => {});
    };

    fetch();
    const id = setInterval(fetch, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0A0A0A' }}>
      {/* Sidebar spacer keeps main content from sliding under the fixed sidebar */}
      <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }} />

      <Sidebar width={SIDEBAR_WIDTH} />

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: 'auto',
          height: '100%',
          pb: `${NOW_PLAYING_HEIGHT}px`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#333', borderRadius: 3 },
        }}
      >
        <Outlet />
      </Box>

      <NowPlayingBar track={nowPlaying} />
    </Box>
  );
}
