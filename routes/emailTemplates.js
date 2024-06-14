const express = require('express');
const router = express.Router();
const EmailTemplate = require('../models/EmailTemplate');

router.post('/create', async (req, res) => {
    try {
        const { subject, body } = req.body;
        const newEmailTemplate = new EmailTemplate({ subject, body });
        await newEmailTemplate.save();
        res.status(201).json(newEmailTemplate);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/all', async (req, res) => {
    try {
        const emailTemplates = await EmailTemplate.find();
        res.json(emailTemplates);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, body } = req.body;
        const emailTemplate = await EmailTemplate.findByIdAndUpdate(id, { subject, body }, { new: true });
        if (!emailTemplate) {
            return res.status(404).send('Email Template not found');
        }
        res.json(emailTemplate);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const emailTemplate = await EmailTemplate.findByIdAndDelete(id);
        if (!emailTemplate) {
            return res.status(404).send('Email Template not found');
        }
        res.json({ message: 'Email Template deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        res.render( { title: 'Email Templates' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch templates' });
    }
});

module.exports = router;
