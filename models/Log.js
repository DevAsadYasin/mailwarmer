const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
