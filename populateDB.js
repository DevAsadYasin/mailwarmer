const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Sender = require('./models/Sender');
const Recipient = require('./models/Recipient');
const dotenv = require('dotenv');

const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri, {
    authSource: "admin"
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
}).on('error', (error) => {
    console.log('Connection error:', error);
});

const populateDB = async () => {
    const senders = [];
    const recipients = [];

    const senderStream = fs.createReadStream(path.join(__dirname, 'senders.csv'))
        .pipe(csv())
        .on('data', (row) => {
            const sender = {
                email: row['Email'],
                smtp: {
                    host: row['SMTP Host'],
                    port: parseInt(row['SMTP Port']),
                    secure: row['SMTP Port'] == 465,
                    auth: {
                        user: row['SMTP Username'],
                        pass: row['SMTP Password']
                    }
                },
                imap: {
                    host: row['IMAP Host'],
                    port: parseInt(row['IMAP Port']),
                    secure: row['IMAP Port'] == 993,
                    auth: {
                        user: row['IMAP Username'],
                        pass: row['IMAP Password']
                    }
                },
                daily_limit: parseInt(row['Daily Limit']),
                warmupEnabled: row['Warmup Enabled'].toUpperCase() === 'TRUE',
                warmupLimit: parseInt(row['Warmup Limit']),
                warmupIncrement: parseInt(row['Warmup Increment'])
            };

            senders.push(sender);
        })
        .on('end', async () => {
            try {
                await Sender.insertMany(senders);
                console.log('Database populated with sender data.');

                const recipientStream = fs.createReadStream(path.join(__dirname, 'recipients.csv'))
                    .pipe(csv())
                    .on('data', (row) => {
                        const recipient = {
                            email: row['Email']
                        };
                        recipients.push(recipient);
                    })
                    .on('end', async () => {
                        try {
                            await Recipient.insertMany(recipients);
                            console.log('Database populated with recipient data.');
                        } catch (err) {
                            console.error('Error inserting recipient data: ', err);
                        } finally {
                            mongoose.connection.close();
                        }
                    });
            } catch (err) {
                console.error('Error inserting sender data: ', err);
                mongoose.connection.close();
            }
        });
};

populateDB();
