import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { CreateNewPlaylist } from '../Services/CreateNewPlaylist';

export default function CreatePlaylistPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await CreateNewPlaylist(name.trim());
      setSuccess(true);
      setName('');
    } catch (err) {
      setError(err.message || 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: 'rgba(79,142,247,0.1)',
              border: '1px solid rgba(79,142,247,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <AddRoundedIcon sx={{ color: '#4F8EF7', fontSize: 30 }} />
          </Box>
          <Typography
            sx={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              mb: 0.75,
            }}
          >
            Create Playlist
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: 400 }}>
            Give your new playlist a name
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            disabled={loading}
            inputProps={{ maxLength: 100 }}
            sx={{ mb: 2.5 }}
          />

          {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

          {success && (
            <Alert
              severity="success"
              icon={<CheckCircleOutlineRoundedIcon />}
              sx={{ mb: 2.5 }}
            >
              Playlist created successfully!
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || !name.trim()}
            sx={{
              py: 1.625,
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 50,
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={18} sx={{ color: '#000' }} />
                Creating...
              </Box>
            ) : (
              'Create Playlist'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
