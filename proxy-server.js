const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3001;

const API_KEY = process.env.EXPO_PUBLIC_MOVIE_API_KEY;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Proxy endpoint for discover movies
app.get('/api/discover/movie', async (req, res) => {
  try {
    console.log('Proxying request to TMDB API...');
    const response = await axios.get(
      'https://api.themoviedb.org/3/discover/movie',
      {
        params: req.query,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for search movies
app.get('/api/search/movie', async (req, res) => {
  try {
    console.log('Proxying search request to TMDB API...');
    const response = await axios.get(
      'https://api.themoviedb.org/3/search/movie',
      {
        params: req.query,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for movie details
app.get('/api/movie/:id', async (req, res) => {
  try {
    console.log(`Proxying movie details request for ID: ${req.params.id}`);
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${req.params.id}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for watch providers
app.get('/api/movie/:id/watch/providers', async (req, res) => {
  try {
    console.log(`Proxying watch providers request for ID: ${req.params.id}`);
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${req.params.id}/watch/providers`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Access from network: http://<your-ip>:${PORT}`);
});

// Export for Vercel serverless
module.exports = app;
