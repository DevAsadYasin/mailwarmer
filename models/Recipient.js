const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
    email: { type: String, required: true }
});

const Recipient = mongoose.model('Recipient', recipientSchema);

module.exports = Recipient;
