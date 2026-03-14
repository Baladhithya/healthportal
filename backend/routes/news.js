const express = require('express');
const axios = require('axios');
const router = express.Router();

// Simple in-memory cache to prevent exceeding NewsAPI rate limits
const cache = {
  data: null,
  timestamp: null,
};

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

router.get('/health', async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached data if valid
    if (cache.data && cache.timestamp && (now - cache.timestamp < CACHE_DURATION_MS)) {
      return res.json(cache.data);
    }

    // Fetch from NewsAPI
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      console.warn('NEWS_API_KEY is not configured in .env');
      return res.status(503).json({ error: 'News service is currently unavailable.' });
    }

    const { data } = await axios.get(
      `https://newsapi.org/v2/top-headlines?category=health&language=en&apiKey=${apiKey}`
    );

    // Update cache
    cache.data = data.articles;
    cache.timestamp = now;

    res.json(cache.data);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news articles.' });
  }
});

module.exports = router;
