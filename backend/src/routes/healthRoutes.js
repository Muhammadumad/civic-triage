const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (req, res) => {
  const dbStateMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'Unknown';

  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
