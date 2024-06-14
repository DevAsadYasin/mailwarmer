const express = require('express');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Sender = require('../models/Sender');
const Recipient = require('../models/Recipient');
const Log = require('../models/Log');

const router = express.Router();
let cronJob;
let isCronRunning = false;

const sendEmailWithDelay = async (transporter, mailOptions) => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent successfully from ${mailOptions.from} to ${mailOptions.to}`);
                resolve();
            } catch (error) {
                console.error(`Error sending email from ${mailOptions.from} to ${mailOptions.to}:`, error);
                resolve();
            }
        }, 60000);
    });
};

const sendEmails = async () => {
    try {
        const senders = await Sender.find({ is_active: true });
        const recipients = await Recipient.find({});
        const sentEmails = {};

        for (const sender of senders) {
            const transporter = nodemailer.createTransport(sender.smtp);

            for (let i = 0; i < sender.daily_limit; i++) {
                const recipient = recipients[Math.floor(Math.random() * recipients.length)] || { email: 'technology14781@gmail.com' };
                if (!sentEmails[sender.email]) sentEmails[sender.email] = [];
                if (sentEmails[sender.email].includes(recipient.email)) continue;

                const mailOptions = {
                    from: sender.email,
                    to: recipient.email,
                    subject: 'Test Email',
                    text: 'This is a test email.'
                };

                await sendEmailWithDelay(transporter, mailOptions);
                await Log.create({ sender: sender.email, recipient: recipient.email, subject: mailOptions.subject, body: mailOptions.text, date: new Date() });
                sentEmails[sender.email].push(recipient.email);
            }
        }

        console.log('Email sending process completed successfully.');
    } catch (error) {
        console.error('Error sending emails:', error);
        throw error;
    }
};

router.post('/start', async (req, res) => {
    try {
        if (isCronRunning) {
            res.send({ message: 'Cron job is already running' });
        } else {
            await sendEmails();
            cronJob = cron.schedule('0 0 * * *', sendEmails);
            cronJob.start();
            isCronRunning = true;

            res.send({ message: 'Cron job started' });
        }
    } catch (error) {
        console.error('Failed to start cron job:', error);
        res.status(500).send({ error: 'Failed to start cron job', message: error.message });
    }
});

router.post('/stop', async (req, res) => {
    try {
        if (isCronRunning) {
            cronJob.stop();
            cronJob = null;
            isCronRunning = false;
            res.send({ message: 'Cron job stopped' });
        } else {
            res.send({ message: 'No cron job to stop' });
        }
    } catch (error) {
        console.error('Failed to stop cron job:', error);
        res.status(500).send({ error: 'Failed to stop cron job', message: error.message });
    }
});

router.get('/status', (req, res) => {
    res.send({ isRunning: isCronRunning });
});

module.exports = router;
