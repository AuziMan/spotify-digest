import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Callback from './utils/Auth/Callback';
import LoginPage from './views/LoginPage';
import AppLayout from './Components/layout/AppLayout';
import HomePage from './views/HomePage';
import TopTracksPage from './views/TopTracksPage';
import NowPlayingPage from './views/NowPlayingPage';
import RecommendedPage from './views/RecommendedPage';
import CreatePlaylistPage from './views/CreatePlaylistPage';
import PlaylistTracksPage from './views/PlaylistTracksPage';
import TrackPage from './views/TrackPage';
import DJPlaylistsPage from './views/DJPlaylistsPage';
import DJGenreTracksPage from './views/DJGenreTracksPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/callback" element={<Callback />} />
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/top-tracks" element={<TopTracksPage />} />
          <Route path="/now-playing" element={<NowPlayingPage />} />
          <Route path="/user-playlists" element={<Navigate to="/home" replace />} />
          <Route path="/user-reccomended" element={<RecommendedPage />} />
          <Route path="/create-playlist" element={<CreatePlaylistPage />} />
          <Route path="/playlistTracks/:playlistId" element={<PlaylistTracksPage />} />
          <Route path="/playlist/playlistTracks/:playlistId" element={<PlaylistTracksPage />} />
          <Route path="/track/:trackId" element={<TrackPage />} />
          <Route path="/dj-playlists" element={<DJPlaylistsPage />} />
          <Route path="/dj-playlists/genre/:genreName" element={<DJGenreTracksPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
