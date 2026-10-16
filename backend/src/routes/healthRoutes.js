const express = require('express');
const mongoose = require('mongoose');
const { getGeminiApiKey, getCandidateModels } = require('../services/geminiService');

const router = express.Router();

router.get('/', (req, res) => {
  const dbStateMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'Unknown';
  const geminiConfigured = Boolean(getGeminiApiKey());

  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
    aiService: {
      configured: geminiConfigured,
      status: geminiConfigured ? 'ready' : 'offline_fallback',
      candidateModels: getCandidateModels(),
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
