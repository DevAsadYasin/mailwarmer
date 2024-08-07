const express = require('express');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Sender = require('../models/Sender');
const Recipient = require('../models/Recipient');
const Log = require('../models/Log');

const router = express.Router();
let cronJob;
let isCronRunning = false;

const sendEmailWithDelay = async (transporter, mailOptions, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully from ${mailOptions.from} to ${mailOptions.to}`);
      return 'sent';
    } catch (error) {
      console.error(`Attempt ${attempt} - Error sending email from ${mailOptions.from} to ${mailOptions.to}:`, error);
      if (attempt === retries) {
        await Log.create({
          sender: mailOptions.from,
          recipient: mailOptions.to,
          subject: mailOptions.subject,
          body: mailOptions.text,
          date: new Date(),
          status: 'failed',
          error: error.message
        });
        return 'failed';
      }
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
};

const sendEmails = async () => {
  try {
    console.log('Sending Mail in progress');
    const senders = await Sender.find({ is_active: true }).sort({ _id: -1 });
    const recipients = await Recipient.find({});
    const sentEmails = {};
    const failureCounts = {};

    for (const sender of senders) {
      let transporter;
      failureCounts[sender.smtp.auth.user] = 0;

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
        const recipient = recipients[Math.floor(Math.random() * recipients.length)] || { email: 'jeff.robison@firstunitedbank.com' };
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
          console.log(`Email sent from ${sender.smtp.auth.user} to ${recipient.email}`);
          await Log.create({
            sender: sender.smtp.auth.user,
            recipient: recipient.email,
            subject: mailOptions.subject,
            body: mailOptions.text,
            date: new Date(),
            status: 'sent'
          });
          failureCounts[sender.smtp.auth.user] = 0;
        } else {
          failureCounts[sender.smtp.auth.user]++;
          if (failureCounts[sender.smtp.auth.user] >= 5) {
            console.log(`Skipping sender ${sender.smtp.auth.user} after 5 consecutive failures`);
            break;
          }
        }

        sentEmails[sender.smtp.auth.user].push(recipient.email);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      transporter.close();
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
      console.log('Warmer have been started');
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
