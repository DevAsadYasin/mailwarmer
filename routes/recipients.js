const express = require('express');
const router = express.Router();
const Recipient = require('../models/Recipient');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const appUrl = process.env.APP_URL; 

router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        const newRecipient = new Recipient({ email });
        await newRecipient.save();
        res.status(201).json(newRecipient);
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
        const recipients = await Recipient.find();
        res.json(recipients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch recipients' });
    }
});

router.post('/delete', async (req, res) => {
    const { id } = req.body;
    try {
        const deletedRecipient = await Recipient.findByIdAndDelete(id);
        if (!deletedRecipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        res.json({ message: 'Recipient deleted successfully' });
    } catch (err) {
        console.error('Error deleting recipient:', err);
        res.status(500).json({ error: 'Failed to delete recipient' });
    }
});

router.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${appUrl}/recipients/all`);
        const recipients = response.data;
        res.render('recipients', { recipients, title: 'Recipients' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch recipients' });
    }
});
module.exports = router;
