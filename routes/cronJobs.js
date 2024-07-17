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
        resolve('sent');
      } catch (error) {
        console.error(`Error sending email from ${mailOptions.from} to ${mailOptions.to}:`, error);
        await Log.create({
          sender: mailOptions.from,
          recipient: mailOptions.to,
          subject: mailOptions.subject,
          body: mailOptions.text,
          date: new Date(),
          status: 'failed',
          error: error.message
        });
        resolve('failed');
      }
    }, 60000);
  });
};


const sendEmails = async () => {
  try {
    console.log('Sending Mail in progress');
    const senders = await Sender.find({ is_active: true });
    const recipients = await Recipient.find({});
    const sentEmails = {};

    for (const sender of senders) {
      let transporter;
      try {
        transporter = nodemailer.createTransport(sender.smtp);
      } catch (error) {
        console.error(`Error setting up transporter for sender ${sender.smtp.auth.user}:`, error);
        await Log.create({
          sender: sender.smtp.auth.user,
          recipient: 'N/A',
          subject: 'N/A',
          body: 'N/A',
          date: new Date(),
          status: 'failed',
          error: error.message
        });
        continue;
      }

      for (let i = 0; i < sender.daily_limit; i++) {
        const recipient = recipients[Math.floor(Math.random() * recipients.length)] || { email: 'technology14781@gmail.com' };
        if (!sentEmails[sender.smtp.auth.user]) sentEmails[sender.smtp.auth.user] = [];
        if (sentEmails[sender.smtp.auth.user].includes(recipient.email)) continue;

        const mailOptions = {
          from: sender.smtp.auth.user,
          to: recipient.email,
          subject: 'Test Email',
          text: 'This is a test email.'
        };

        const status = await sendEmailWithDelay(transporter, mailOptions);
        if (status === 'sent') {
          await Log.create({
            sender: sender.smtp.auth.user,
            recipient: recipient.email,
            subject: mailOptions.subject,
            body: mailOptions.text,
            date: new Date(),
            status: 'sent'
          });
        }

        sentEmails[sender.smtp.auth.user].push(recipient.email);
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
      res.send({ message: 'Cron job started' });
      isCronRunning = true;
      cronJob = cron.schedule('0 0 * * *', sendEmails, {
        scheduled: true
    });
      cronJob.start();
    }
    sendEmails();
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
