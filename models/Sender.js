const mongoose = require('mongoose');
const autiIncrement = require('mongoose-id-autoincrement');


const senderSchema = new mongoose.Schema({
    smtp: {
        host: { type: String, required: true },
        port: { type: Number, required: true },
        secure: { type: Boolean, required: true },
        auth: {
            user: { type: String, required: true },
            pass: { type: String, required: true }
        }
    },
    daily_limit: { type: Number, default: 50 },
    is_active: { type: Boolean, default: true },

});
const Sender = mongoose.model('Sender', senderSchema);

module.exports = Sender;
