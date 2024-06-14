const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const axios = require('axios');

router.get('/all', async (req, res) => {
    try {
        const logs = await Log.find().sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/logs/all');
        const logs = response.data;
        res.render('logs', { logs, title: 'Logs' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch logs' });
    }
});

module.exports = router;
