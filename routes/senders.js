const express = require('express');
const router = express.Router();
const Imap = require('node-imap');
const Sender = require('../models/Sender');
const axios = require('axios');

const imapFetch = async (sender) => {
    const imapConfig = {
        user: sender.imap.auth.user,
        password: sender.imap.auth.pass,
        host: sender.imap.host,
        port: sender.imap.port,
        tls: sender.imap.secure
    };

    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
        imap.openBox('INBOX', true, (err, box) => {
            if (err) throw err;
            imap.search(['ALL'], (searchErr, results) => {
                if (searchErr) throw searchErr;
                const fetch = imap.fetch(results, { bodies: '' });
                fetch.on('message', (msg) => {
                    msg.on('body', (stream, info) => {
                        let buffer = '';
                        stream.on('data', (chunk) => {
                            buffer += chunk.toString('utf8');
                        });
                        stream.once('end', () => {
                            console.log(buffer);
                        });
                    });
                });
                fetch.once('end', () => {
                    imap.end();
                });
            });
        });
    });

    imap.once('error', (err) => {
        console.error(err);
    });

    imap.once('end', () => {
        console.log('Connection ended');
    });

    imap.connect();
};

router.post('/', async (req, res) => {
    try {
        const newSender = new Sender({
            smtp: {
                host: req.body['smtp.host'],
                port: req.body['smtp.port'],
                secure: req.body['smtp.secure'],
                auth: {
                    user: req.body['smtp.auth.user'],
                    pass: req.body['smtp.auth.pass']
                }
            },
            daily_limit: req.body.daily_limit,
            is_active: req.body.is_active
        });

        await newSender.save();

        res.status(201).json(newSender);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/save', async (req, res) => {
    try {
        const newSender = new Sender(req.body);
        await newSender.save();
        res.status(201).json(newSender);
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => error.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/all', async (req, res) => {
    try {
        const senders = await Sender.find();
        res.json(senders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch senders' });
    }
});

router.post('/toggle', async (req, res) => {
    const _id = req.body._id;
    try {
        const sender = await Sender.findById({ _id: _id }).exec();
        if (!sender) {
            return res.status(404).json({ error: 'Sender not found' });
        }

        sender.is_active = !sender.is_active;
        await sender.save();

        res.json({ message: 'Sender status updated successfully', is_active: sender.is_active });
    } catch (err) {
        console.error('Error toggling sender status:', err);
        res.status(500).json({ error: 'Failed to update sender status' });
    }
});

router.post('/delete', async (req, res) => {
    const _id = req.body._id;
    try {
        const deletedSender = await Sender.findByIdAndDelete(_id );
        if (!deletedSender) {
            return res.status(404).json({ error: 'Sender not found' });
        }
        res.json({ message: 'Sender deleted successfully' });
    } catch (err) {
        console.error('Error deleting sender:', err);
        res.status(500).json({ error: 'Failed to delete sender' });
    }
});

module.exports = router;
