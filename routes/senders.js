const express = require('express');
const router = express.Router();
const Sender = require('../models/Sender');

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
