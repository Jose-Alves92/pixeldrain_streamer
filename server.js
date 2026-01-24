const { serveHTTP, publishToCentral } = require('stremio-addon-sdk');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const manifest = require('./manifest.json');
const { handleStreams } = require('./stream_handler');

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
};

const app = express();
app.use(cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'pixeldrain-debrid-addon' });
});

// Manifest endpoint
app.get('/manifest.json', (req, res) => {
    res.json(manifest);
});

// Stream endpoint
app.get('/stream/:type/:id.json', async (req, res) => {
    try {
        const { type, id } = req.params;
        const streams = await handleStreams(type, id);
        res.json({ streams });
    } catch (error) {
        console.error('Stream error:', error);
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.ADDON_PORT || 7000;

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Addon running on http://localhost:${port}`);
        console.log(`Addon URL: http://localhost:${port}/manifest.json`);
        
        // Optional: publish to Stremio Central
        // publishToCentral(`http://localhost:${port}/manifest.json`);
    });
}

module.exports = { handleStreams };