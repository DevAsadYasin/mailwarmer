const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const appUrl = process.env.APP_URL;

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
        const response = await axios.get(`${appUrl}/logs/all`);
        const logs = response.data;
        res.render('logs', { logs, title: 'Logs' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch logs' });
    }
});

router.get('/log-stats', async (req, res) => {
    try {
        const now = new Date();
        const last24Hours = new Date(now - 24 * 60 * 60 * 1000);

        const allLogs = await Log.find();
        const last24HoursLogs = await Log.find({ date: { $gte: last24Hours } });

        const TotalMailsProcessed = allLogs.length;
        const TotalMailsFailed = allLogs.filter(log => log.status === 'failed').length;
        const TotalSentMail = allLogs.filter(log => log.status === 'sent').length;
        const Last24HoursTotalMails = last24HoursLogs.length;
        const Last24HoursFailedMails = last24HoursLogs.filter(log => log.status === 'failed');
        const Last24HoursTotalFailedMails = Last24HoursFailedMails.length;
        const Last24HoursSentMails = last24HoursLogs.filter(log => log.status === 'sent');
        const Last24HoursTotalSuccessfullMails = Last24HoursSentMails.length;

        const FailedSendersLast24Hours = [...new Set(Last24HoursFailedMails.map(log => log.sender))];
        const ErrorsLast24Hours = [...new Set(Last24HoursFailedMails.map(log => log.error))];
        const SuccessfulSendersLast24Hours = [...new Set(Last24HoursSentMails.map(log => log.sender))];

        res.json({
            TotalMailsProcessed,
            TotalMailsFailed,
            TotalSentMail,
            Last24HoursTotalMails,
            Last24HoursTotalFailedMails,
            Last24HoursTotalSuccessfullMails,
            FailedSendersLast24Hours:
            {
                senders: FailedSendersLast24Hours
            },
            SuccessfulSendersLast24Hours: {
                senders: SuccessfulSendersLast24Hours
            },
            ErrorsLast24Hours: {
                errors: ErrorsLast24Hours
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
