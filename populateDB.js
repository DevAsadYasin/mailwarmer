const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Sender = require('./models/Sender');
const Recipient = require('./models/Recipient');
const dotenv = require('dotenv');
dotenv.config();

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

  const senderStream = fs.createReadStream(path.join(__dirname, 'data.csv'))
    .pipe(csv())
    .on('data', (row) => {
      const sender = {
        smtp: {
          host: row['Host'],
          port: parseInt(row['SMTP Port']),
          secure: true,
          auth: {
            user: row['Email'],
            pass: row['PWD']
          }
        },
        daily_limit: 100
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

populateDB();ƒƒ
