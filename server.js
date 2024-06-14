const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;
const appUrl = process.env.APP_URL; 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './public/views'));

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin"
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
}).on('error', (error) => {
    console.log('Connection error:', error);
});

app.use('/senders', require('./routes/senders'));
app.use('/recipients', require('./routes/recipients'));
app.use('/logs', require('./routes/logs'));
app.use('/cronJob', require('./routes/cronJobs'));

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${appUrl}/senders/all`);
        const senders = response.data;
        res.render('senders', { senders, title: 'Senders' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch senders' });
    }
});

app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(port, () => {
    console.log(`Server is running on ${appUrl}`);
});
