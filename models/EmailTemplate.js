const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    body: { type: String, required: true }
});

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

module.exports = EmailTemplate;
